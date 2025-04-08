import json
import os
import boto3
import uuid
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
comprehend = boto3.client('comprehend')
transcribe = boto3.client('transcribe')
eventbridge = boto3.client('events')

# Environment variables
MEETINGS_TABLE = os.environ.get('MEETINGS_TABLE')
TRANSCRIPTS_TABLE = os.environ.get('TRANSCRIPTS_TABLE')
ACTIONS_TABLE = os.environ.get('ACTIONS_TABLE')

def lambda_handler(event, context):
    """
    Main handler for AI Meeting Assistant API
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
        if path == '/meetings/transcribe' and http_method == 'POST':
            return handle_transcribe_meeting(body)
        elif path == '/meetings/summarize' and http_method == 'POST':
            return handle_summarize_meeting(body)
        elif path == '/meetings/extract-actions' and http_method == 'POST':
            return handle_extract_actions(body)
        elif path == '/meetings/generate-followup' and http_method == 'POST':
            return handle_generate_followup(body)
        elif path == '/meetings/search' and http_method == 'GET':
            return handle_search_meetings(event.get('queryStringParameters', {}))
        elif path.startswith('/meetings/') and http_method == 'GET':
            meeting_id = path.split('/')[-1]
            return handle_get_meeting(meeting_id)
        else:
            return build_response(404, {'error': 'Not Found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

def handle_transcribe_meeting(body):
    """
    Handle meeting transcription request
    """
    # Validate request
    if 'audio_url' not in body:
        return build_response(400, {'error': 'Missing required field: audio_url'})
    
    # Generate meeting ID
    meeting_id = str(uuid.uuid4())
    
    # Create meeting record
    meeting = {
        'meeting_id': meeting_id,
        'status': 'transcribing',
        'created_at': datetime.utcnow().isoformat(),
        'audio_url': body['audio_url'],
        'title': body.get('title', 'Untitled Meeting'),
        'participants': body.get('participants', []),
        'metadata': body.get('metadata', {})
    }
    
    # Store meeting in DynamoDB
    table = dynamodb.Table(MEETINGS_TABLE)
    table.put_item(Item=meeting)
    
    # Start transcription job
    job_name = f"meeting-{meeting_id}"
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': body['audio_url']},
        MediaFormat=body.get('media_format', 'mp3'),
        LanguageCode=body.get('language', 'en-US'),
        Settings={
            'ShowSpeakerLabels': True,
            'MaxSpeakerLabels': min(10, len(body.get('participants', [])) + 2)
        }
    )
    
    # Return meeting details to client
    return build_response(202, {
        'meeting_id': meeting_id,
        'status': 'transcribing',
        'title': meeting['title']
    })

def handle_summarize_meeting(body):
    """
    Handle meeting summarization request
    """
    # Validate request
    if 'meeting_id' not in body:
        return build_response(400, {'error': 'Missing required field: meeting_id'})
    
    meeting_id = body['meeting_id']
    
    # Get meeting transcript
    transcripts_table = dynamodb.Table(TRANSCRIPTS_TABLE)
    response = transcripts_table.get_item(
        Key={'meeting_id': meeting_id}
    )
    
    if 'Item' not in response:
        return build_response(404, {'error': 'Transcript not found'})
    
    transcript = response['Item']
    
    # Update meeting status
    meetings_table = dynamodb.Table(MEETINGS_TABLE)
    meetings_table.update_item(
        Key={'meeting_id': meeting_id},
        UpdateExpression="set #status = :s",
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={':s': 'summarizing'}
    )
    
    # Generate summary using Amazon Comprehend
    # Note: In a real implementation, you might use a more sophisticated summarization approach
    text_to_summarize = transcript.get('full_text', '')
    
    # For demonstration, we'll use Comprehend to extract key phrases as a simple form of summarization
    if text_to_summarize:
        key_phrases_response = comprehend.detect_key_phrases(
            Text=text_to_summarize[:5000],  # Comprehend has a 5KB limit
            LanguageCode='en'
        )
        
        key_phrases = [phrase['Text'] for phrase in key_phrases_response.get('KeyPhrases', [])]
        
        # Create a simple summary from key phrases
        summary = "Meeting Summary:\n\n"
        summary += "Key points discussed:\n"
        for phrase in key_phrases[:10]:  # Limit to top 10 phrases
            summary += f"- {phrase}\n"
        
        # Store summary in meeting record
        meetings_table.update_item(
            Key={'meeting_id': meeting_id},
            UpdateExpression="set summary = :sum, #status = :s",
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':sum': summary,
                ':s': 'summarized'
            }
        )
        
        return build_response(200, {
            'meeting_id': meeting_id,
            'summary': summary
        })
    else:
        return build_response(400, {'error': 'No transcript text available for summarization'})

def handle_extract_actions(body):
    """
    Handle action item extraction request
    """
    # Validate request
    if 'meeting_id' not in body:
        return build_response(400, {'error': 'Missing required field: meeting_id'})
    
    meeting_id = body['meeting_id']
    
    # Get meeting transcript
    transcripts_table = dynamodb.Table(TRANSCRIPTS_TABLE)
    response = transcripts_table.get_item(
        Key={'meeting_id': meeting_id}
    )
    
    if 'Item' not in response:
        return build_response(404, {'error': 'Transcript not found'})
    
    transcript = response['Item']
    text_to_analyze = transcript.get('full_text', '')
    
    if not text_to_analyze:
        return build_response(400, {'error': 'No transcript text available for action extraction'})
    
    # Extract action items
    # In a real implementation, you would use a more sophisticated NLP approach
    # For demonstration, we'll use a simple keyword-based approach with Comprehend entities
    
    entities_response = comprehend.detect_entities(
        Text=text_to_analyze[:5000],  # Comprehend has a 5KB limit
        LanguageCode='en'
    )
    
    # Look for entities that might be people (assignees)
    people = [entity['Text'] for entity in entities_response.get('Entities', []) 
              if entity['Type'] in ['PERSON', 'TITLE']]
    
    # Simple action item extraction based on keywords
    action_keywords = ['action item', 'todo', 'to-do', 'task', 'follow up', 'will do', 
                      'should do', 'needs to', 'have to', 'must', 'will send', 'will create']
    
    sentences = text_to_analyze.split('.')
    action_items = []
    
    for sentence in sentences:
        for keyword in action_keywords:
            if keyword.lower() in sentence.lower():
                # Try to identify assignee
                assignee = 'Unassigned'
                for person in people:
                    if person in sentence:
                        assignee = person
                        break
                
                # Create action item
                action_id = str(uuid.uuid4())
                action_item = {
                    'action_id': action_id,
                    'meeting_id': meeting_id,
                    'description': sentence.strip(),
                    'assignee': assignee,
                    'status': 'open',
                    'created_at': datetime.utcnow().isoformat(),
                    'due_date': None
                }
                
                # Store action item in DynamoDB
                actions_table = dynamodb.Table(ACTIONS_TABLE)
                actions_table.put_item(Item=action_item)
                
                # Add to response list
                action_items.append({
                    'action_id': action_id,
                    'description': action_item['description'],
                    'assignee': action_item['assignee']
                })
                
                break
    
    # Update meeting with action count
    meetings_table = dynamodb.Table(MEETINGS_TABLE)
    meetings_table.update_item(
        Key={'meeting_id': meeting_id},
        UpdateExpression="set action_count = :ac",
        ExpressionAttributeValues={':ac': len(action_items)}
    )
    
    return build_response(200, {
        'meeting_id': meeting_id,
        'action_items': action_items,
        'count': len(action_items)
    })

def handle_generate_followup(body):
    """
    Handle follow-up generation request
    """
    # Validate request
    if 'meeting_id' not in body:
        return build_response(400, {'error': 'Missing required field: meeting_id'})
    
    meeting_id = body['meeting_id']
    
    # Get action items for the meeting
    actions_table = dynamodb.Table(ACTIONS_TABLE)
    response = actions_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('meeting_id').eq(meeting_id)
    )
    
    if not response.get('Items'):
        return build_response(404, {'error': 'No action items found for this meeting'})
    
    action_items = response['Items']
    
    # Get meeting details
    meetings_table = dynamodb.Table(MEETINGS_TABLE)
    meeting_response = meetings_table.get_item(
        Key={'meeting_id': meeting_id}
    )
    
    if 'Item' not in meeting_response:
        return build_response(404, {'error': 'Meeting not found'})
    
    meeting = meeting_response['Item']
    
    # Generate follow-up messages
    followups = []
    
    # Group action items by assignee
    assignee_actions = {}
    for action in action_items:
        assignee = action.get('assignee', 'Unassigned')
        if assignee not in assignee_actions:
            assignee_actions[assignee] = []
        assignee_actions[assignee].append(action)
    
    # Create follow-up for each assignee
    for assignee, actions in assignee_actions.items():
        # Create follow-up message
        message = f"Subject: Action Items from {meeting.get('title', 'Recent Meeting')}\n\n"
        message += f"Hi {assignee},\n\n"
        message += f"Following up on our meeting, here are your action items:\n\n"
        
        for action in actions:
            message += f"- {action.get('description')}\n"
        
        message += "\nPlease let me know if you have any questions.\n\n"
        message += "Thanks,\nAI Meeting Assistant"
        
        # Schedule follow-up in EventBridge (in a real implementation)
        # For demonstration, we'll just return the messages
        
        followups.append({
            'assignee': assignee,
            'message': message,
            'action_count': len(actions)
        })
    
    return build_response(200, {
        'meeting_id': meeting_id,
        'followups': followups
    })

def handle_search_meetings(query_params):
    """
    Handle meeting search request
    """
    # Validate request
    if not query_params or ('query' not in query_params and 'date' not in query_params):
        return build_response(400, {'error': 'Missing required parameter: query or date'})
    
    # Get meetings table
    meetings_table = dynamodb.Table(MEETINGS_TABLE)
    
    # If searching by date
    if 'date' in query_params:
        date = query_params['date']
        # In a real implementation, you would use a GSI for date-based queries
        # For demonstration, we'll scan the table (not efficient for production)
        response = meetings_table.scan(
            FilterExpression="begins_with(created_at, :date)",
            ExpressionAttributeValues={':date': date}
        )
        
        meetings = response.get('Items', [])
        return build_response(200, {
            'meetings': meetings,
            'count': len(meetings)
        })
    
    # If searching by text query
    if 'query' in query_params:
        query = query_params['query']
        
        # In a real implementation, you would use Elasticsearch or similar
        # For demonstration, we'll scan the table (not efficient for production)
        response = meetings_table.scan()
        
        # Filter meetings that contain the query in title or transcript
        meetings = []
        for meeting in response.get('Items', []):
            if (query.lower() in meeting.get('title', '').lower() or 
                query.lower() in meeting.get('summary', '').lower()):
                meetings.append(meeting)
        
        # If we have transcripts, search those too
        transcripts_table = dynamodb.Table(TRANSCRIPTS_TABLE)
        transcript_response = transcripts_table.scan()
        
        meeting_ids_from_transcripts = set()
        for transcript in transcript_response.get('Items', []):
            if query.lower() in transcript.get('full_text', '').lower():
                meeting_ids_from_transcripts.add(transcript.get('meeting_id'))
        
        # Add meetings found in transcripts that weren't already included
        if meeting_ids_from_transcripts:
            meeting_ids_already_included = {m.get('meeting_id') for m in meetings}
            for meeting_id in meeting_ids_from_transcripts:
                if meeting_id not in meeting_ids_already_included:
                    meeting_response = meetings_table.get_item(
                        Key={'meeting_id': meeting_id}
                    )
                    if 'Item' in meeting_response:
                        meetings.append(meeting_response['Item'])
        
        return build_response(200, {
            'meetings': meetings,
            'count': len(meetings)
        })
    
    return build_response(400, {'error': 'Invalid search parameters'})

def handle_get_meeting(meeting_id):
    """
    Handle get meeting details request
    """
    # Get meeting details
    meetings_table = dynamodb.Table(MEETINGS_TABLE)
    response = meetings_table.get_item(
        Key={'meeting_id': meeting_id}
    )
    
    if 'Item' not in response:
        return build_response(404, {'error': 'Meeting not found'})
    
    meeting = response['Item']
    
    # Get transcript if available
    transcripts_table = dynamodb.Table(TRANSCRIPTS_TABLE)
    transcript_response = transcripts_table.get_item(
        Key={'meeting_id': meeting_id}
    )
    
    if 'Item' in transcript_response:
        meeting['transcript'] = transcript_response['Item']
    
    # Get action items if available
    actions_table = dynamodb.Table(ACTIONS_TABLE)
    actions_response = actions_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('meeting_id').eq(meeting_id)
    )
    
    if actions_response.get('Items'):
        meeting['action_items'] = actions_response['Items']
    
    return build_response(200, meeting)

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
