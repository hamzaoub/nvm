import json
import os
import boto3
import uuid
from datetime import datetime

# Initialize AWS clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
polly = boto3.client('polly')
batch = boto3.client('batch')

# Environment variables
VOICE_PROFILES_TABLE = os.environ.get('VOICE_PROFILES_TABLE')
VOICE_JOBS_TABLE = os.environ.get('VOICE_JOBS_TABLE')
STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET')
BATCH_JOB_QUEUE = os.environ.get('BATCH_JOB_QUEUE')
BATCH_JOB_DEFINITION = os.environ.get('BATCH_JOB_DEFINITION')

def lambda_handler(event, context):
    """
    Main handler for AI Voice Generation API
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
        if path == '/voice/create-profile' and http_method == 'POST':
            return handle_create_profile(body)
        elif path == '/voice/generate' and http_method == 'POST':
            return handle_generate_speech(body)
        elif path == '/voice/adjust-emotion' and http_method == 'POST':
            return handle_adjust_emotion(body)
        elif path == '/voice/translate' and http_method == 'POST':
            return handle_translate(body)
        elif path == '/voice/batch-process' and http_method == 'POST':
            return handle_batch_process(body)
        elif path.startswith('/voice/profiles/') and http_method == 'GET':
            profile_id = path.split('/')[-1]
            return handle_get_profile(profile_id)
        elif path.startswith('/voice/jobs/') and http_method == 'GET':
            job_id = path.split('/')[-1]
            return handle_get_job(job_id)
        elif path == '/voice/profiles' and http_method == 'GET':
            return handle_list_profiles(event.get('queryStringParameters', {}))
        else:
            return build_response(404, {'error': 'Not Found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

def handle_create_profile(body):
    """
    Handle voice profile creation request
    """
    # Validate request
    if 'name' not in body:
        return build_response(400, {'error': 'Missing required field: name'})
    if 'sample_audio_urls' not in body or not body['sample_audio_urls']:
        return build_response(400, {'error': 'Missing required field: sample_audio_urls'})
    
    # Generate profile ID
    profile_id = str(uuid.uuid4())
    
    # Create profile record
    profile = {
        'profile_id': profile_id,
        'name': body['name'],
        'description': body.get('description', ''),
        'sample_audio_urls': body['sample_audio_urls'],
        'status': 'processing',
        'created_at': datetime.utcnow().isoformat(),
        'metadata': body.get('metadata', {}),
        'gender': body.get('gender', 'neutral'),
        'language': body.get('language', 'en-US')
    }
    
    # Store profile in DynamoDB
    table = dynamodb.Table(VOICE_PROFILES_TABLE)
    table.put_item(Item=profile)
    
    # Start voice profile creation job (in a real implementation, this would be more complex)
    # For demonstration, we'll simulate the process by storing sample URLs and updating status
    
    # Create a folder in S3 for this profile
    for i, audio_url in enumerate(body['sample_audio_urls']):
        # In a real implementation, you would download the audio from the URL and process it
        # For demonstration, we'll just store a reference
        s3_client.put_object(
            Bucket=STORAGE_BUCKET,
            Key=f'profiles/{profile_id}/sample_{i}.json',
            Body=json.dumps({'url': audio_url}),
            ContentType='application/json'
        )
    
    # Update profile status to 'ready' (in a real implementation, this would happen after processing)
    table.update_item(
        Key={'profile_id': profile_id},
        UpdateExpression="set #status = :s",
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={':s': 'ready'}
    )
    
    # Return profile details to client
    return build_response(201, {
        'profile_id': profile_id,
        'name': profile['name'],
        'status': 'ready'  # In a real implementation, this would initially be 'processing'
    })

def handle_generate_speech(body):
    """
    Handle speech generation request
    """
    # Validate request
    if 'text' not in body:
        return build_response(400, {'error': 'Missing required field: text'})
    if 'profile_id' not in body:
        return build_response(400, {'error': 'Missing required field: profile_id'})
    
    # Check if profile exists
    profile_table = dynamodb.Table(VOICE_PROFILES_TABLE)
    profile_response = profile_table.get_item(
        Key={'profile_id': body['profile_id']}
    )
    
    if 'Item' not in profile_response:
        return build_response(404, {'error': 'Voice profile not found'})
    
    profile = profile_response['Item']
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'profile_id': body['profile_id'],
        'text': body['text'],
        'status': 'processing',
        'created_at': datetime.utcnow().isoformat(),
        'options': {
            'voice_style': body.get('voice_style', 'neutral'),
            'speed': body.get('speed', 1.0),
            'pitch': body.get('pitch', 0),
            'format': body.get('format', 'mp3')
        }
    }
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(VOICE_JOBS_TABLE)
    jobs_table.put_item(Item=job)
    
    # For demonstration, we'll use Amazon Polly as a fallback
    # In a real implementation, you would use the custom voice model
    try:
        # Map gender to Polly voice
        voice_id = 'Matthew'  # Default male voice
        if profile['gender'].lower() == 'female':
            voice_id = 'Joanna'
        elif profile['gender'].lower() == 'neutral':
            voice_id = 'Ivy'
        
        # Generate speech using Polly
        polly_response = polly.synthesize_speech(
            Text=body['text'],
            OutputFormat=job['options']['format'],
            VoiceId=voice_id,
            Engine='neural'
        )
        
        # Save audio to S3
        if 'AudioStream' in polly_response:
            audio_data = polly_response['AudioStream'].read()
            s3_client.put_object(
                Bucket=STORAGE_BUCKET,
                Key=f'jobs/{job_id}/output.{job["options"]["format"]}',
                Body=audio_data,
                ContentType=f'audio/{job["options"]["format"]}'
            )
            
            # Update job status
            jobs_table.update_item(
                Key={'job_id': job_id},
                UpdateExpression="set #status = :s, output_url = :u",
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':s': 'completed',
                    ':u': f"https://{STORAGE_BUCKET}.s3.amazonaws.com/jobs/{job_id}/output.{job['options']['format']}"
                }
            )
            
            # Return job details with output URL
            return build_response(202, {
                'job_id': job_id,
                'status': 'completed',
                'output_url': f"https://{STORAGE_BUCKET}.s3.amazonaws.com/jobs/{job_id}/output.{job['options']['format']}"
            })
    
    except Exception as e:
        print(f"Error generating speech with Polly: {str(e)}")
        # Continue with the normal flow, treating this as an async job
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'processing'
    })

def handle_adjust_emotion(body):
    """
    Handle emotion adjustment request
    """
    # Validate request
    if 'job_id' not in body:
        return build_response(400, {'error': 'Missing required field: job_id'})
    if 'emotion' not in body:
        return build_response(400, {'error': 'Missing required field: emotion'})
    
    # Check if job exists
    jobs_table = dynamodb.Table(VOICE_JOBS_TABLE)
    job_response = jobs_table.get_item(
        Key={'job_id': body['job_id']}
    )
    
    if 'Item' not in job_response:
        return build_response(404, {'error': 'Job not found'})
    
    original_job = job_response['Item']
    
    # Generate new job ID
    new_job_id = str(uuid.uuid4())
    
    # Create new job record with emotion adjustment
    new_job = {
        'job_id': new_job_id,
        'profile_id': original_job['profile_id'],
        'text': original_job['text'],
        'status': 'processing',
        'created_at': datetime.utcnow().isoformat(),
        'parent_job_id': body['job_id'],
        'options': {
            'voice_style': body['emotion'],
            'speed': body.get('speed', original_job['options'].get('speed', 1.0)),
            'pitch': body.get('pitch', original_job['options'].get('pitch', 0)),
            'format': body.get('format', original_job['options'].get('format', 'mp3'))
        }
    }
    
    # Store job in DynamoDB
    jobs_table.put_item(Item=new_job)
    
    # In a real implementation, you would process this job with the emotion adjustment
    # For demonstration, we'll simulate completion after a delay
    
    # Return job details to client
    return build_response(202, {
        'job_id': new_job_id,
        'status': 'processing',
        'original_job_id': body['job_id']
    })

def handle_translate(body):
    """
    Handle translation and voice generation request
    """
    # Validate request
    if 'text' not in body:
        return build_response(400, {'error': 'Missing required field: text'})
    if 'profile_id' not in body:
        return build_response(400, {'error': 'Missing required field: profile_id'})
    if 'target_language' not in body:
        return build_response(400, {'error': 'Missing required field: target_language'})
    
    # Check if profile exists
    profile_table = dynamodb.Table(VOICE_PROFILES_TABLE)
    profile_response = profile_table.get_item(
        Key={'profile_id': body['profile_id']}
    )
    
    if 'Item' not in profile_response:
        return build_response(404, {'error': 'Voice profile not found'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'profile_id': body['profile_id'],
        'text': body['text'],
        'status': 'processing',
        'created_at': datetime.utcnow().isoformat(),
        'translation': {
            'source_language': body.get('source_language', 'auto'),
            'target_language': body['target_language']
        },
        'options': {
            'voice_style': body.get('voice_style', 'neutral'),
            'speed': body.get('speed', 1.0),
            'pitch': body.get('pitch', 0),
            'format': body.get('format', 'mp3')
        }
    }
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(VOICE_JOBS_TABLE)
    jobs_table.put_item(Item=job)
    
    # In a real implementation, you would:
    # 1. Translate the text using a service like Amazon Translate
    # 2. Generate speech in the target language
    # For demonstration, we'll just return the job ID
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'processing',
        'source_language': job['translation']['source_language'],
        'target_language': job['translation']['target_language']
    })

def handle_batch_process(body):
    """
    Handle batch processing request
    """
    # Validate request
    if 'texts' not in body or not isinstance(body['texts'], list):
        return build_response(400, {'error': 'Missing required field: texts (must be an array)'})
    if 'profile_id' not in body:
        return build_response(400, {'error': 'Missing required field: profile_id'})
    
    # Check if profile exists
    profile_table = dynamodb.Table(VOICE_PROFILES_TABLE)
    profile_response = profile_table.get_item(
        Key={'profile_id': body['profile_id']}
    )
    
    if 'Item' not in profile_response:
        return build_response(404, {'error': 'Voice profile not found'})
    
    # Generate batch job ID
    batch_id = str(uuid.uuid4())
    
    # Create individual jobs for each text
    job_ids = []
    for i, text in enumerate(body['texts']):
        job_id = f"{batch_id}-{i}"
        
        # Create job record
        job = {
            'job_id': job_id,
            'batch_id': batch_id,
            'profile_id': body['profile_id'],
            'text': text,
            'status': 'queued',
            'created_at': datetime.utcnow().isoformat(),
            'batch_index': i,
            'options': {
                'voice_style': body.get('voice_style', 'neutral'),
                'speed': body.get('speed', 1.0),
                'pitch': body.get('pitch', 0),
                'format': body.get('format', 'mp3')
            }
        }
        
        # Store job in DynamoDB
        jobs_table = dynamodb.Table(VOICE_JOBS_TABLE)
        jobs_table.put_item(Item=job)
        
        job_ids.append(job_id)
    
    # Create batch metadata
    batch_metadata = {
        'batch_id': batch_id,
        'profile_id': body['profile_id'],
        'job_count': len(job_ids),
        'job_ids': job_ids,
        'status': 'submitted',
        'created_at': datetime.utcnow().isoformat(),
        'options': {
            'voice_style': body.get('voice_style', 'neutral'),
            'speed': body.get('speed', 1.0),
            'pitch': body.get('pitch', 0),
            'format': body.get('format', 'mp3')
        }
    }
    
    # Store batch metadata in S3
    s3_client.put_object(
        Bucket=STORAGE_BUCKET,
        Key=f'batches/{batch_id}/metadata.json',
        Body=json.dumps(batch_metadata),
        ContentType='application/json'
    )
    
    # Submit batch job to AWS Batch (in a real implementation)
    try:
        batch_response = batch.submit_job(
            jobName=f"voice-generation-{batch_id}",
            jobQueue=BATCH_JOB_QUEUE,
            jobDefinition=BATCH_JOB_DEFINITION,
            parameters={
                'batchId': batch_id,
                'bucket': STORAGE_BUCKET
            }
        )
        
        print(f"Submitted batch job: {batch_response['jobId']}")
    except Exception as e:
        print(f"Error submitting batch job: {str(e)}")
        # Continue with the response even if batch submission fails
    
    # Return batch details to client
    return build_response(202, {
        'batch_id': batch_id,
        'job_count': len(job_ids),
        'status': 'submitted'
    })

def handle_get_profile(profile_id):
    """
    Handle get profile details request
    """
    # Get profile from DynamoDB
    table = dynamodb.Table(VOICE_PROFILES_TABLE)
    response = table.get_item(
        Key={'profile_id': profile_id}
    )
    
    if 'Item' not in response:
        return build_response(404, {'error': 'Voice profile not found'})
    
    profile = response['Item']
    
    # Return profile details
    return build_response(200, profile)

def handle_get_job(job_id):
    """
    Handle get job details request
    """
    # Get job from DynamoDB
    table = dynamodb.Table(VOICE_JOBS_TABLE)
    response = table.get_item(
        Key={'job_id': job_id}
    )
    
    if 'Item' not in response:
        return build_response(404, {'error': 'Job not found'})
    
    job = response['Item']
    
    # If job is completed, include the output URL
    if job['status'] == 'completed' and 'output_url' not in job:
        job['output_url'] = f"https://{STORAGE_BUCKET}.s3.amazonaws.com/jobs/{job_id}/output.{job['options']['format']}"
    
    # Return job details
    return build_response(200, job)

def handle_list_profiles(query_params):
    """
    Handle list profiles request
    """
    # Get profiles from DynamoDB
    table = dynamodb.Table(VOICE_PROFILES_TABLE)
    
    # Apply filters if provided
    filter_expression = None
    expression_attribute_values = {}
    
    if query_params and 'language' in query_params:
        filter_expression = "language = :lang"
        expression_attribute_values[':lang'] = query_params['language']
    
    if query_params and 'gender' in query_params:
        if filter_expression:
            filter_expression += " AND gender = :gender"
        else:
            filter_expression = "gender = :gender"
        expression_attribute_values[':gender'] = query_params['gender']
    
    # Execute query
    if filter_expression:
        response = table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
    else:
        response = table.scan()
    
    profiles = response.get('Items', [])
    
    # Return profiles
    return build_response(200, {
        'profiles': profiles,
        'count': len(profiles)
    })

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
