import json
import os
import boto3
import uuid
from datetime import datetime

# Initialize AWS clients
s3_client = boto3.client('s3')
sqs_client = boto3.client('sqs')

# Environment variables
QUEUE_URL = os.environ.get('TRANSFORM_QUEUE_URL')
BUCKET_NAME = os.environ.get('STORAGE_BUCKET_NAME')

def lambda_handler(event, context):
    """
    Main handler for Content Transformation API
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
        if path == '/transform/text-to-speech':
            return handle_text_to_speech(body)
        elif path == '/transform/speech-to-text':
            return handle_speech_to_text(body)
        elif path == '/transform/text-to-image':
            return handle_text_to_image(body)
        elif path == '/transform/image-to-text':
            return handle_image_to_text(body)
        elif path == '/transform/text-to-video':
            return handle_text_to_video(body)
        elif path == '/transform/status':
            return handle_status(event.get('queryStringParameters', {}))
        else:
            return build_response(404, {'error': 'Not Found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

def handle_text_to_speech(body):
    """
    Handle text-to-speech transformation request
    """
    # Validate request
    if 'text' not in body:
        return build_response(400, {'error': 'Missing required field: text'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create transformation job
    job = {
        'job_id': job_id,
        'type': 'text-to-speech',
        'status': 'queued',
        'created_at': datetime.utcnow().isoformat(),
        'input': {
            'text': body['text']
        },
        'options': {
            'voice': body.get('voice', 'default'),
            'speed': body.get('speed', 1.0),
            'format': body.get('format', 'mp3')
        }
    }
    
    # Store job details in S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f'jobs/{job_id}/job.json',
        Body=json.dumps(job),
        ContentType='application/json'
    )
    
    # Queue job for processing
    sqs_client.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'job_id': job_id,
            'type': 'text-to-speech'
        })
    )
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'queued',
        'status_url': f'/transform/status?job_id={job_id}'
    })

def handle_speech_to_text(body):
    """
    Handle speech-to-text transformation request
    """
    # Validate request
    if 'audio_url' not in body:
        return build_response(400, {'error': 'Missing required field: audio_url'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create transformation job
    job = {
        'job_id': job_id,
        'type': 'speech-to-text',
        'status': 'queued',
        'created_at': datetime.utcnow().isoformat(),
        'input': {
            'audio_url': body['audio_url']
        },
        'options': {
            'language': body.get('language', 'en-US'),
            'format': body.get('format', 'txt')
        }
    }
    
    # Store job details in S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f'jobs/{job_id}/job.json',
        Body=json.dumps(job),
        ContentType='application/json'
    )
    
    # Queue job for processing
    sqs_client.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'job_id': job_id,
            'type': 'speech-to-text'
        })
    )
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'queued',
        'status_url': f'/transform/status?job_id={job_id}'
    })

def handle_text_to_image(body):
    """
    Handle text-to-image transformation request
    """
    # Validate request
    if 'prompt' not in body:
        return build_response(400, {'error': 'Missing required field: prompt'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create transformation job
    job = {
        'job_id': job_id,
        'type': 'text-to-image',
        'status': 'queued',
        'created_at': datetime.utcnow().isoformat(),
        'input': {
            'prompt': body['prompt']
        },
        'options': {
            'width': body.get('width', 512),
            'height': body.get('height', 512),
            'style': body.get('style', 'realistic'),
            'format': body.get('format', 'png')
        }
    }
    
    # Store job details in S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f'jobs/{job_id}/job.json',
        Body=json.dumps(job),
        ContentType='application/json'
    )
    
    # Queue job for processing
    sqs_client.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'job_id': job_id,
            'type': 'text-to-image'
        })
    )
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'queued',
        'status_url': f'/transform/status?job_id={job_id}'
    })

def handle_image_to_text(body):
    """
    Handle image-to-text transformation request
    """
    # Validate request
    if 'image_url' not in body:
        return build_response(400, {'error': 'Missing required field: image_url'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create transformation job
    job = {
        'job_id': job_id,
        'type': 'image-to-text',
        'status': 'queued',
        'created_at': datetime.utcnow().isoformat(),
        'input': {
            'image_url': body['image_url']
        },
        'options': {
            'detail_level': body.get('detail_level', 'standard'),
            'language': body.get('language', 'en')
        }
    }
    
    # Store job details in S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f'jobs/{job_id}/job.json',
        Body=json.dumps(job),
        ContentType='application/json'
    )
    
    # Queue job for processing
    sqs_client.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'job_id': job_id,
            'type': 'image-to-text'
        })
    )
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'queued',
        'status_url': f'/transform/status?job_id={job_id}'
    })

def handle_text_to_video(body):
    """
    Handle text-to-video transformation request
    """
    # Validate request
    if 'script' not in body:
        return build_response(400, {'error': 'Missing required field: script'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create transformation job
    job = {
        'job_id': job_id,
        'type': 'text-to-video',
        'status': 'queued',
        'created_at': datetime.utcnow().isoformat(),
        'input': {
            'script': body['script']
        },
        'options': {
            'duration': body.get('duration', 30),
            'style': body.get('style', 'standard'),
            'resolution': body.get('resolution', '720p'),
            'format': body.get('format', 'mp4')
        }
    }
    
    # Store job details in S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f'jobs/{job_id}/job.json',
        Body=json.dumps(job),
        ContentType='application/json'
    )
    
    # Queue job for processing
    sqs_client.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({
            'job_id': job_id,
            'type': 'text-to-video'
        })
    )
    
    # Return job details to client
    return build_response(202, {
        'job_id': job_id,
        'status': 'queued',
        'status_url': f'/transform/status?job_id={job_id}'
    })

def handle_status(query_params):
    """
    Handle job status request
    """
    # Validate request
    if 'job_id' not in query_params:
        return build_response(400, {'error': 'Missing required parameter: job_id'})
    
    job_id = query_params['job_id']
    
    try:
        # Get job details from S3
        response = s3_client.get_object(
            Bucket=BUCKET_NAME,
            Key=f'jobs/{job_id}/job.json'
        )
        job = json.loads(response['Body'].read().decode('utf-8'))
        
        # Prepare response
        result = {
            'job_id': job['job_id'],
            'type': job['type'],
            'status': job['status'],
            'created_at': job['created_at']
        }
        
        # Include result URL if job is completed
        if job['status'] == 'completed':
            result_type = job['type'].split('-')[-1]  # Get output type (speech, text, image, video)
            result['result_url'] = f"https://{BUCKET_NAME}.s3.amazonaws.com/jobs/{job_id}/result.{result_type}"
        
        # Include error details if job failed
        if job['status'] == 'failed' and 'error' in job:
            result['error'] = job['error']
        
        return build_response(200, result)
    
    except s3_client.exceptions.NoSuchKey:
        return build_response(404, {'error': 'Job not found'})
    
    except Exception as e:
        print(f"Error retrieving job status: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

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
