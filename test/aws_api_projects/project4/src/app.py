import json
import os
import boto3
import uuid
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
kinesis = boto3.client('kinesis')
personalize = boto3.client('personalize')
personalize_runtime = boto3.client('personalize-runtime')

# Environment variables
USERS_TABLE = os.environ.get('USERS_TABLE')
JOURNEYS_TABLE = os.environ.get('JOURNEYS_TABLE')
TOUCHPOINTS_TABLE = os.environ.get('TOUCHPOINTS_TABLE')
EVENTS_STREAM = os.environ.get('EVENTS_STREAM')
PERSONALIZE_CAMPAIGN_ARN = os.environ.get('PERSONALIZE_CAMPAIGN_ARN')

def lambda_handler(event, context):
    """
    Main handler for Customer Journey Optimization API
    """
    try:
        # Extract HTTP method and path
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        
        # Parse request body if present
        body = {}
        if event.get('body'):
            body = json.loads(event.get('body'))
        
        # Route request to appropriate handler
        if path == '/journey/track-event' and http_method == 'POST':
            return handle_track_event(body)
        elif path == '/journey/create-user' and http_method == 'POST':
            return handle_create_user(body)
        elif path == '/journey/create-journey' and http_method == 'POST':
            return handle_create_journey(body)
        elif path == '/journey/add-touchpoint' and http_method == 'POST':
            return handle_add_touchpoint(body)
        elif path == '/journey/get-recommendations' and http_method == 'POST':
            return handle_get_recommendations(body)
        elif path == '/journey/analyze' and http_method == 'POST':
            return handle_analyze_journey(body)
        elif path.startswith('/journey/users/') and http_method == 'GET':
            user_id = path.split('/')[-1]
            return handle_get_user(user_id)
        elif path.startswith('/journey/journeys/') and http_method == 'GET':
            journey_id = path.split('/')[-1]
            return handle_get_journey(journey_id)
        elif path == '/journey/users' and http_method == 'GET':
            return handle_list_users(event.get('queryStringParameters', {}))
        elif path == '/journey/journeys' and http_method == 'GET':
            return handle_list_journeys(event.get('queryStringParameters', {}))
        else:
            return build_response(404, {'error': 'Not Found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

def handle_track_event(body):
    """
    Handle event tracking request
    """
    # Validate request
    if 'user_id' not in body:
        return build_response(400, {'error': 'Missing required field: user_id'})
    if 'event_type' not in body:
        return build_response(400, {'error': 'Missing required field: event_type'})
    
    # Generate event ID
    event_id = str(uuid.uuid4())
    
    # Create event record
    event_record = {
        'event_id': event_id,
        'user_id': body['user_id'],
        'event_type': body['event_type'],
        'timestamp': datetime.utcnow().isoformat(),
        'properties': body.get('properties', {}),
        'journey_id': body.get('journey_id'),
        'touchpoint_id': body.get('touchpoint_id'),
        'session_id': body.get('session_id')
    }
    
    # Send event to Kinesis stream
    try:
        kinesis_response = kinesis.put_record(
            StreamName=EVENTS_STREAM,
            Data=json.dumps(event_record),
            PartitionKey=body['user_id']
        )
        
        # Update user's last activity if user exists
        users_table = dynamodb.Table(USERS_TABLE)
        try:
            users_table.update_item(
                Key={'user_id': body['user_id']},
                UpdateExpression="set last_activity = :la",
                ExpressionAttributeValues={':la': event_record['timestamp']},
                ConditionExpression="attribute_exists(user_id)"
            )
        except Exception as e:
            # User might not exist, which is fine for event tracking
            print(f"Warning: Could not update user last activity: {str(e)}")
        
        # If journey_id and touchpoint_id are provided, update touchpoint status
        if body.get('journey_id') and body.get('touchpoint_id'):
            touchpoints_table = dynamodb.Table(TOUCHPOINTS_TABLE)
            try:
                touchpoints_table.update_item(
                    Key={
                        'journey_id': body['journey_id'],
                        'touchpoint_id': body['touchpoint_id']
                    },
                    UpdateExpression="set last_interaction = :li, interaction_count = if_not_exists(interaction_count, :zero) + :one",
                    ExpressionAttributeValues={
                        ':li': event_record['timestamp'],
                        ':zero': 0,
                        ':one': 1
                    }
                )
            except Exception as e:
                print(f"Warning: Could not update touchpoint: {str(e)}")
        
        return build_response(201, {
            'event_id': event_id,
            'timestamp': event_record['timestamp'],
            'kinesis_sequence_number': kinesis_response.get('SequenceNumber')
        })
    
    except Exception as e:
        print(f"Error sending event to Kinesis: {str(e)}")
        return build_response(500, {'error': 'Failed to track event'})

def handle_create_user(body):
    """
    Handle user creation request
    """
    # Validate request
    if 'user_id' not in body:
        return build_response(400, {'error': 'Missing required field: user_id'})
    
    # Create user record
    user = {
        'user_id': body['user_id'],
        'created_at': datetime.utcnow().isoformat(),
        'last_activity': datetime.utcnow().isoformat(),
        'attributes': body.get('attributes', {}),
        'segments': body.get('segments', []),
        'preferences': body.get('preferences', {})
    }
    
    # Store user in DynamoDB
    users_table = dynamodb.Table(USERS_TABLE)
    try:
        users_table.put_item(
            Item=user,
            ConditionExpression="attribute_not_exists(user_id)"
        )
        return build_response(201, {
            'user_id': user['user_id'],
            'created_at': user['created_at']
        })
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return build_response(409, {'error': 'User already exists'})
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return build_response(500, {'error': 'Failed to create user'})

def handle_create_journey(body):
    """
    Handle journey creation request
    """
    # Validate request
    if 'user_id' not in body:
        return build_response(400, {'error': 'Missing required field: user_id'})
    if 'name' not in body:
        return build_response(400, {'error': 'Missing required field: name'})
    
    # Generate journey ID
    journey_id = str(uuid.uuid4())
    
    # Create journey record
    journey = {
        'journey_id': journey_id,
        'user_id': body['user_id'],
        'name': body['name'],
        'description': body.get('description', ''),
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'status': 'active',
        'goal': body.get('goal', ''),
        'touchpoint_count': 0,
        'completion_percentage': 0,
        'metadata': body.get('metadata', {})
    }
    
    # Store journey in DynamoDB
    journeys_table = dynamodb.Table(JOURNEYS_TABLE)
    try:
        journeys_table.put_item(Item=journey)
        return build_response(201, {
            'journey_id': journey_id,
            'user_id': journey['user_id'],
            'name': journey['name'],
            'created_at': journey['created_at']
        })
    except Exception as e:
        print(f"Error creating journey: {str(e)}")
        return build_response(500, {'error': 'Failed to create journey'})

def handle_add_touchpoint(body):
    """
    Handle touchpoint addition request
    """
    # Validate request
    if 'journey_id' not in body:
        return build_response(400, {'error': 'Missing required field: journey_id'})
    if 'channel' not in body:
        return build_response(400, {'error': 'Missing required field: channel'})
    if 'content' not in body:
        return build_response(400, {'error': 'Missing required field: content'})
    
    # Check if journey exists
    journeys_table = dynamodb.Table(JOURNEYS_TABLE)
    try:
        journey_response = journeys_table.get_item(
            Key={'journey_id': body['journey_id']}
        )
        
        if 'Item' not in journey_response:
            return build_response(404, {'error': 'Journey not found'})
        
        journey = journey_response['Item']
    except Exception as e:
        print(f"Error retrieving journey: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve journey'})
    
    # Generate touchpoint ID
    touchpoint_id = str(uuid.uuid4())
    
    # Create touchpoint record
    touchpoint = {
        'journey_id': body['journey_id'],
        'touchpoint_id': touchpoint_id,
        'channel': body['channel'],
        'content': body['content'],
        'created_at': datetime.utcnow().isoformat(),
        'scheduled_for': body.get('scheduled_for'),
        'status': body.get('status', 'pending'),
        'sequence': body.get('sequence', journey['touchpoint_count'] + 1),
        'interaction_count': 0,
        'last_interaction': None,
        'metadata': body.get('metadata', {})
    }
    
    # Store touchpoint in DynamoDB
    touchpoints_table = dynamodb.Table(TOUCHPOINTS_TABLE)
    try:
        touchpoints_table.put_item(Item=touchpoint)
        
        # Update journey touchpoint count
        journeys_table.update_item(
            Key={'journey_id': body['journey_id']},
            UpdateExpression="set touchpoint_count = touchpoint_count + :val, updated_at = :ua",
            ExpressionAttributeValues={
                ':val': 1,
                ':ua': datetime.utcnow().isoformat()
            }
        )
        
        return build_response(201, {
            'touchpoint_id': touchpoint_id,
            'journey_id': touchpoint['journey_id'],
            'channel': touchpoint['channel'],
            'sequence': touchpoint['sequence'],
            'created_at': touchpoint['created_at']
        })
    except Exception as e:
        print(f"Error adding touchpoint: {str(e)}")
        return build_response(500, {'error': 'Failed to add touchpoint'})

def handle_get_recommendations(body):
    """
    Handle recommendations request
    """
    # Validate request
    if 'user_id' not in body:
        return build_response(400, {'error': 'Missing required field: user_id'})
    
    # Get recommendations from Amazon Personalize
    try:
        personalize_response = personalize_runtime.get_recommendations(
            campaignArn=PERSONALIZE_CAMPAIGN_ARN,
            userId=body['user_id'],
            numResults=body.get('num_results', 5)
        )
        
        # Process recommendations
        recommendations = []
        for item in personalize_response.get('itemList', []):
            recommendations.append({
                'item_id': item['itemId'],
                'score': item.get('score', 0)
            })
        
        # Track recommendation event
        event_record = {
            'event_id': str(uuid.uuid4()),
            'user_id': body['user_id'],
            'event_type': 'recommendation_served',
            'timestamp': datetime.utcnow().isoformat(),
            'properties': {
                'recommendations': recommendations,
                'context': body.get('context', {})
            }
        }
        
        kinesis.put_record(
            StreamName=EVENTS_STREAM,
            Data=json.dumps(event_record),
            PartitionKey=body['user_id']
        )
        
        return build_response(200, {
            'user_id': body['user_id'],
            'recommendations': recommendations,
            'timestamp': event_record['timestamp']
        })
    
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return build_response(500, {'error': 'Failed to get recommendations'})

def handle_analyze_journey(body):
    """
    Handle journey analysis request
    """
    # Validate request
    if 'journey_id' not in body:
        return build_response(400, {'error': 'Missing required field: journey_id'})
    
    # Get journey details
    journeys_table = dynamodb.Table(JOURNEYS_TABLE)
    try:
        journey_response = journeys_table.get_item(
            Key={'journey_id': body['journey_id']}
        )
        
        if 'Item' not in journey_response:
            return build_response(404, {'error': 'Journey not found'})
        
        journey = journey_response['Item']
    except Exception as e:
        print(f"Error retrieving journey: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve journey'})
    
    # Get touchpoints for the journey
    touchpoints_table = dynamodb.Table(TOUCHPOINTS_TABLE)
    try:
        touchpoints_response = touchpoints_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('journey_id').eq(body['journey_id'])
        )
        
        touchpoints = touchpoints_response.get('Items', [])
    except Exception as e:
        print(f"Error retrieving touchpoints: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve touchpoints'})
    
    # Perform basic analysis
    # In a real implementation, this would be more sophisticated
    total_touchpoints = len(touchpoints)
    interacted_touchpoints = sum(1 for t in touchpoints if t.get('interaction_count', 0) > 0)
    completion_percentage = (interacted_touchpoints / total_touchpoints * 100) if total_touchpoints > 0 else 0
    
    # Update journey completion percentage
    try:
        journeys_table.update_item(
            Key={'journey_id': body['journey_id']},
            UpdateExpression="set completion_percentage = :cp, updated_at = :ua",
            ExpressionAttributeValues={
                ':cp': completion_percentage,
                ':ua': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        print(f"Warning: Could not update journey completion: {str(e)}")
    
    # Prepare analysis results
    analysis = {
        'journey_id': body['journey_id'],
        'user_id': journey['user_id'],
        'name': journey['name'],
        'total_touchpoints': total_touchpoints,
        'interacted_touchpoints': interacted_touchpoints,
        'completion_percentage': completion_percentage,
        'channel_breakdown': {},
        'touchpoint_performance': []
    }
    
    # Calculate channel breakdown
    for touchpoint in touchpoints:
        channel = touchpoint.get('channel')
        if channel not in analysis['channel_breakdown']:
            analysis['channel_breakdown'][channel] = {
                'count': 0,
                'interactions': 0
            }
        
        analysis['channel_breakdown'][channel]['count'] += 1
        analysis['channel_breakdown'][channel]['interactions'] += touchpoint.get('interaction_count', 0)
    
    # Calculate touchpoint performance
    for touchpoint in touchpoints:
        analysis['touchpoint_performance'].append({
            'touchpoint_id': touchpoint['touchpoint_id'],
            'channel': touchpoint.get('channel'),
            'sequence': touchpoint.get('sequence'),
            'interaction_count': touchpoint.get('interaction_count', 0),
            'last_interaction': touchpoint.get('last_interaction')
        })
    
    # Sort touchpoint performance by sequence
    analysis['touchpoint_performance'].sort(key=lambda x: x['sequence'])
    
    return build_response(200, analysis)

def handle_get_user(user_id):
    """
    Handle get user details request
    """
    # Get user from DynamoDB
    users_table = dynamodb.Table(USERS_TABLE)
    try:
        response = users_table.get_item(
            Key={'user_id': user_id}
        )
        
        if 'Item' not in response:
            return build_response(404, {'error': 'User not found'})
        
        user = response['Item']
        return build_response(200, user)
    except Exception as e:
        print(f"Error retrieving user: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve user'})

def handle_get_journey(journey_id):
    """
    Handle get journey details request
    """
    # Get journey from DynamoDB
    journeys_table = dynamodb.Table(JOURNEYS_TABLE)
    try:
        journey_response = journeys_table.get_item(
            Key={'journey_id': journey_id}
        )
        
        if 'Item' not in journey_response:
            return build_response(404, {'error': 'Journey not found'})
        
        journey = journey_response['Item']
        
        # Get touchpoints for the journey
        touchpoints_table = dynamodb.Table(TOUCHPOINTS_TABLE)
        touchpoints_response = touchpoints_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('journey_id').eq(journey_id)
        )
        
        touchpoints = touchpoints_response.get('Items', [])
        
        # Sort touchpoints by sequence
        touchpoints.sort(key=lambda x: x.get('sequence', 0))
        
        # Add touchpoints to journey response
        journey['touchpoints'] = touchpoints
        
        return build_response(200, journey)
    except Exception as e:
        print(f"Error retrieving journey: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve journey'})

def handle_list_users(query_params):
    """
    Handle list users request
    """
    # Get users from DynamoDB
    users_table = dynamodb.Table(USERS_TABLE)
    
    # Apply filters if provided
    filter_expression = None
    expression_attribute_values = {}
    
    if query_params and 'segment' in query_params:
        filter_expression = "contains(segments, :segment)"
        expression_attribute_values[':segment'] = query_params['segment']
    
    # Execute query
    try:
        if filter_expression:
            response = users_table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_attribute_values
            )
        else:
            response = users_table.scan()
        
        users = response.get('Items', [])
        
        return build_response(200, {
            'users': users,
            'count': len(users)
        })
    except Exception as e:
        print(f"Error listing users: {str(e)}")
        return build_response(500, {'error': 'Failed to list users'})

def handle_list_journeys(query_params):
    """
    Handle list journeys request
    """
    # Get journeys from DynamoDB
    journeys_table = dynamodb.Table(JOURNEYS_TABLE)
    
    # Apply filters if provided
    filter_expression = None
    expression_attribute_values = {}
    
    if query_params and 'user_id' in query_params:
        filter_expression = "user_id = :user_id"
        expression_attribute_values[':user_id'] = query_params['user_id']
    
    if query_params and 'status' in query_params:
        if filter_expression:
            filter_expression += " AND #status = :status"
        else:
            filter_expression = "#status = :status"
        expression_attribute_values[':status'] = query_params['status']
    
    # Execute query
    try:
        if filter_expression:
            if 'status' in query_params:
                response = journeys_table.scan(
                    FilterExpression=filter_expression,
                    ExpressionAttributeValues=expression_attribute_values,
                    ExpressionAttributeNames={'#status': 'status'}
                )
            else:
                response = journeys_table.scan(
                    FilterExpression=filter_expression,
                    ExpressionAttributeValues=expression_attribute_values
                )
        else:
            response = journeys_table.scan()
        
        journeys = response.get('Items', [])
        
        return build_response(200, {
            'journeys': journeys,
            'count': len(journeys)
        })
    except Exception as e:
        print(f"Error listing journeys: {str(e)}")
        return build_response(500, {'error': 'Failed to list journeys'})

def build_response(status_code, body):
    """
    Build API Gateway response object
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        'body': json.dumps(body)
    }
