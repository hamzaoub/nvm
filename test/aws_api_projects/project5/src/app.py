import json
import os
import boto3
import uuid
import random
import numpy as np
from datetime import datetime, timedelta

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
batch = boto3.client('batch')

# Environment variables
DATASETS_TABLE = os.environ.get('DATASETS_TABLE')
JOBS_TABLE = os.environ.get('JOBS_TABLE')
STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET')
BATCH_JOB_QUEUE = os.environ.get('BATCH_JOB_QUEUE')
BATCH_JOB_DEFINITION = os.environ.get('BATCH_JOB_DEFINITION')

def lambda_handler(event, context):
    """
    Main handler for Synthetic Data Generation API
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
        if path == '/data/generate' and http_method == 'POST':
            return handle_generate_data(body)
        elif path == '/data/create-schema' and http_method == 'POST':
            return handle_create_schema(body)
        elif path == '/data/generate-tabular' and http_method == 'POST':
            return handle_generate_tabular(body)
        elif path == '/data/generate-time-series' and http_method == 'POST':
            return handle_generate_time_series(body)
        elif path == '/data/generate-text' and http_method == 'POST':
            return handle_generate_text(body)
        elif path == '/data/anonymize' and http_method == 'POST':
            return handle_anonymize_data(body)
        elif path.startswith('/data/datasets/') and http_method == 'GET':
            dataset_id = path.split('/')[-1]
            return handle_get_dataset(dataset_id)
        elif path.startswith('/data/jobs/') and http_method == 'GET':
            job_id = path.split('/')[-1]
            return handle_get_job(job_id)
        elif path == '/data/datasets' and http_method == 'GET':
            return handle_list_datasets(event.get('queryStringParameters', {}))
        elif path == '/data/jobs' and http_method == 'GET':
            return handle_list_jobs(event.get('queryStringParameters', {}))
        else:
            return build_response(404, {'error': 'Not Found'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return build_response(500, {'error': 'Internal Server Error'})

def handle_generate_data(body):
    """
    Handle general data generation request
    """
    # Validate request
    if 'type' not in body:
        return build_response(400, {'error': 'Missing required field: type'})
    if 'schema' not in body and 'schema_id' not in body:
        return build_response(400, {'error': 'Missing required field: schema or schema_id'})
    
    # Route to specific handler based on data type
    data_type = body['type'].lower()
    if data_type == 'tabular':
        return handle_generate_tabular(body)
    elif data_type == 'time-series':
        return handle_generate_time_series(body)
    elif data_type == 'text':
        return handle_generate_text(body)
    else:
        return build_response(400, {'error': f'Unsupported data type: {data_type}'})

def handle_create_schema(body):
    """
    Handle schema creation request
    """
    # Validate request
    if 'name' not in body:
        return build_response(400, {'error': 'Missing required field: name'})
    if 'type' not in body:
        return build_response(400, {'error': 'Missing required field: type'})
    if 'fields' not in body:
        return build_response(400, {'error': 'Missing required field: fields'})
    
    # Generate schema ID
    schema_id = str(uuid.uuid4())
    
    # Create schema record
    schema = {
        'dataset_id': schema_id,
        'name': body['name'],
        'type': body['type'],
        'fields': body['fields'],
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'status': 'active',
        'dataset_count': 0,
        'is_schema': True,
        'metadata': body.get('metadata', {})
    }
    
    # Store schema in DynamoDB
    datasets_table = dynamodb.Table(DATASETS_TABLE)
    try:
        datasets_table.put_item(Item=schema)
        return build_response(201, {
            'schema_id': schema_id,
            'name': schema['name'],
            'type': schema['type'],
            'created_at': schema['created_at']
        })
    except Exception as e:
        print(f"Error creating schema: {str(e)}")
        return build_response(500, {'error': 'Failed to create schema'})

def handle_generate_tabular(body):
    """
    Handle tabular data generation request
    """
    # Validate request
    if 'rows' not in body:
        return build_response(400, {'error': 'Missing required field: rows'})
    
    # Get schema
    schema = None
    if 'schema' in body:
        schema = body['schema']
    elif 'schema_id' in body:
        try:
            datasets_table = dynamodb.Table(DATASETS_TABLE)
            response = datasets_table.get_item(
                Key={'dataset_id': body['schema_id']}
            )
            if 'Item' in response:
                schema = response['Item']
            else:
                return build_response(404, {'error': 'Schema not found'})
        except Exception as e:
            print(f"Error retrieving schema: {str(e)}")
            return build_response(500, {'error': 'Failed to retrieve schema'})
    else:
        return build_response(400, {'error': 'Missing required field: schema or schema_id'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'type': 'tabular',
        'status': 'submitted',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'parameters': {
            'rows': body['rows'],
            'schema_id': schema.get('dataset_id') if isinstance(schema, dict) else None,
            'schema': schema,
            'format': body.get('format', 'csv'),
            'include_header': body.get('include_header', True),
            'seed': body.get('seed')
        },
        'output_location': None
    }
    
    # For small datasets (< 1000 rows), generate synchronously
    if body['rows'] < 1000 and isinstance(schema, dict) and 'fields' in schema:
        try:
            # Generate data
            data = generate_tabular_data(
                schema['fields'], 
                body['rows'], 
                body.get('seed')
            )
            
            # Save to S3
            output_key = f"data/{job_id}/output.{body.get('format', 'csv')}"
            
            if body.get('format') == 'json':
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=json.dumps(data),
                    ContentType='application/json'
                )
            else:  # Default to CSV
                # Convert to CSV
                header = ','.join([field['name'] for field in schema['fields']])
                rows = []
                for row in data:
                    rows.append(','.join([str(value) for value in row.values()]))
                
                csv_content = ''
                if body.get('include_header', True):
                    csv_content = header + '\n'
                csv_content += '\n'.join(rows)
                
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=csv_content,
                    ContentType='text/csv'
                )
            
            # Update job record
            job['status'] = 'completed'
            job['output_location'] = f"s3://{STORAGE_BUCKET}/{output_key}"
            job['completed_at'] = datetime.utcnow().isoformat()
            
            # Create dataset record
            dataset_id = str(uuid.uuid4())
            dataset = {
                'dataset_id': dataset_id,
                'name': f"Tabular Dataset {dataset_id[:8]}",
                'type': 'tabular',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'status': 'available',
                'rows': body['rows'],
                'schema_id': schema.get('dataset_id'),
                'job_id': job_id,
                'storage_location': f"s3://{STORAGE_BUCKET}/{output_key}",
                'format': body.get('format', 'csv'),
                'metadata': body.get('metadata', {})
            }
            
            # Store dataset in DynamoDB
            datasets_table = dynamodb.Table(DATASETS_TABLE)
            datasets_table.put_item(Item=dataset)
            
            # If schema_id exists, update schema dataset count
            if schema.get('dataset_id'):
                try:
                    datasets_table.update_item(
                        Key={'dataset_id': schema['dataset_id']},
                        UpdateExpression="set dataset_count = dataset_count + :val, updated_at = :ua",
                        ExpressionAttributeValues={
                            ':val': 1,
                            ':ua': datetime.utcnow().isoformat()
                        }
                    )
                except Exception as e:
                    print(f"Warning: Could not update schema dataset count: {str(e)}")
            
        except Exception as e:
            print(f"Error generating tabular data: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    else:
        # For larger datasets, submit to AWS Batch
        try:
            # Prepare job parameters
            job_parameters = {
                'job_id': job_id,
                'type': 'tabular',
                'parameters': job['parameters'],
                'output_bucket': STORAGE_BUCKET
            }
            
            # Submit to AWS Batch
            batch_response = batch.submit_job(
                jobName=f"tabular-{job_id[:8]}",
                jobQueue=BATCH_JOB_QUEUE,
                jobDefinition=BATCH_JOB_DEFINITION,
                containerOverrides={
                    'command': ['python', 'generate_data.py', json.dumps(job_parameters)]
                }
            )
            
            job['batch_job_id'] = batch_response['jobId']
            
        except Exception as e:
            print(f"Error submitting batch job: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    try:
        jobs_table.put_item(Item=job)
        
        response_data = {
            'job_id': job_id,
            'status': job['status'],
            'type': 'tabular'
        }
        
        if job['status'] == 'completed':
            response_data['dataset_id'] = dataset_id
            response_data['output_location'] = job['output_location']
        
        return build_response(202, response_data)
    
    except Exception as e:
        print(f"Error storing job: {str(e)}")
        return build_response(500, {'error': 'Failed to store job'})

def handle_generate_time_series(body):
    """
    Handle time series data generation request
    """
    # Validate request
    if 'points' not in body:
        return build_response(400, {'error': 'Missing required field: points'})
    if 'start_date' not in body:
        return build_response(400, {'error': 'Missing required field: start_date'})
    if 'frequency' not in body:
        return build_response(400, {'error': 'Missing required field: frequency'})
    if 'fields' not in body:
        return build_response(400, {'error': 'Missing required field: fields'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'type': 'time-series',
        'status': 'submitted',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'parameters': {
            'points': body['points'],
            'start_date': body['start_date'],
            'frequency': body['frequency'],
            'fields': body['fields'],
            'format': body.get('format', 'csv'),
            'include_header': body.get('include_header', True),
            'seed': body.get('seed')
        },
        'output_location': None
    }
    
    # For small datasets (< 1000 points), generate synchronously
    if body['points'] < 1000:
        try:
            # Generate data
            data = generate_time_series_data(
                body['fields'],
                body['points'],
                body['start_date'],
                body['frequency'],
                body.get('seed')
            )
            
            # Save to S3
            output_key = f"data/{job_id}/output.{body.get('format', 'csv')}"
            
            if body.get('format') == 'json':
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=json.dumps(data),
                    ContentType='application/json'
                )
            else:  # Default to CSV
                # Convert to CSV
                header = 'timestamp,' + ','.join([field['name'] for field in body['fields']])
                rows = []
                for row in data:
                    row_values = [row['timestamp']] + [str(row[field['name']]) for field in body['fields']]
                    rows.append(','.join(row_values))
                
                csv_content = ''
                if body.get('include_header', True):
                    csv_content = header + '\n'
                csv_content += '\n'.join(rows)
                
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=csv_content,
                    ContentType='text/csv'
                )
            
            # Update job record
            job['status'] = 'completed'
            job['output_location'] = f"s3://{STORAGE_BUCKET}/{output_key}"
            job['completed_at'] = datetime.utcnow().isoformat()
            
            # Create dataset record
            dataset_id = str(uuid.uuid4())
            dataset = {
                'dataset_id': dataset_id,
                'name': f"Time Series Dataset {dataset_id[:8]}",
                'type': 'time-series',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'status': 'available',
                'points': body['points'],
                'start_date': body['start_date'],
                'frequency': body['frequency'],
                'job_id': job_id,
                'storage_location': f"s3://{STORAGE_BUCKET}/{output_key}",
                'format': body.get('format', 'csv'),
                'metadata': body.get('metadata', {})
            }
            
            # Store dataset in DynamoDB
            datasets_table = dynamodb.Table(DATASETS_TABLE)
            datasets_table.put_item(Item=dataset)
            
        except Exception as e:
            print(f"Error generating time series data: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    else:
        # For larger datasets, submit to AWS Batch
        try:
            # Prepare job parameters
            job_parameters = {
                'job_id': job_id,
                'type': 'time-series',
                'parameters': job['parameters'],
                'output_bucket': STORAGE_BUCKET
            }
            
            # Submit to AWS Batch
            batch_response = batch.submit_job(
                jobName=f"timeseries-{job_id[:8]}",
                jobQueue=BATCH_JOB_QUEUE,
                jobDefinition=BATCH_JOB_DEFINITION,
                containerOverrides={
                    'command': ['python', 'generate_data.py', json.dumps(job_parameters)]
                }
            )
            
            job['batch_job_id'] = batch_response['jobId']
            
        except Exception as e:
            print(f"Error submitting batch job: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    try:
        jobs_table.put_item(Item=job)
        
        response_data = {
            'job_id': job_id,
            'status': job['status'],
            'type': 'time-series'
        }
        
        if job['status'] == 'completed':
            response_data['dataset_id'] = dataset_id
            response_data['output_location'] = job['output_location']
        
        return build_response(202, response_data)
    
    except Exception as e:
        print(f"Error storing job: {str(e)}")
        return build_response(500, {'error': 'Failed to store job'})

def handle_generate_text(body):
    """
    Handle text data generation request
    """
    # Validate request
    if 'template' not in body and 'templates' not in body:
        return build_response(400, {'error': 'Missing required field: template or templates'})
    if 'count' not in body:
        return build_response(400, {'error': 'Missing required field: count'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'type': 'text',
        'status': 'submitted',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'parameters': {
            'template': body.get('template'),
            'templates': body.get('templates'),
            'count': body['count'],
            'variables': body.get('variables', {}),
            'format': body.get('format', 'txt'),
            'seed': body.get('seed')
        },
        'output_location': None
    }
    
    # For small datasets (< 100 texts), generate synchronously
    if body['count'] < 100:
        try:
            # Generate data
            data = generate_text_data(
                body.get('template'),
                body.get('templates'),
                body['count'],
                body.get('variables', {}),
                body.get('seed')
            )
            
            # Save to S3
            output_key = f"data/{job_id}/output.{body.get('format', 'txt')}"
            
            if body.get('format') == 'json':
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=json.dumps(data),
                    ContentType='application/json'
                )
            else:  # Default to TXT
                text_content = '\n\n'.join(data)
                
                s3.put_object(
                    Bucket=STORAGE_BUCKET,
                    Key=output_key,
                    Body=text_content,
                    ContentType='text/plain'
                )
            
            # Update job record
            job['status'] = 'completed'
            job['output_location'] = f"s3://{STORAGE_BUCKET}/{output_key}"
            job['completed_at'] = datetime.utcnow().isoformat()
            
            # Create dataset record
            dataset_id = str(uuid.uuid4())
            dataset = {
                'dataset_id': dataset_id,
                'name': f"Text Dataset {dataset_id[:8]}",
                'type': 'text',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'status': 'available',
                'count': body['count'],
                'job_id': job_id,
                'storage_location': f"s3://{STORAGE_BUCKET}/{output_key}",
                'format': body.get('format', 'txt'),
                'metadata': body.get('metadata', {})
            }
            
            # Store dataset in DynamoDB
            datasets_table = dynamodb.Table(DATASETS_TABLE)
            datasets_table.put_item(Item=dataset)
            
        except Exception as e:
            print(f"Error generating text data: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    else:
        # For larger datasets, submit to AWS Batch
        try:
            # Prepare job parameters
            job_parameters = {
                'job_id': job_id,
                'type': 'text',
                'parameters': job['parameters'],
                'output_bucket': STORAGE_BUCKET
            }
            
            # Submit to AWS Batch
            batch_response = batch.submit_job(
                jobName=f"text-{job_id[:8]}",
                jobQueue=BATCH_JOB_QUEUE,
                jobDefinition=BATCH_JOB_DEFINITION,
                containerOverrides={
                    'command': ['python', 'generate_data.py', json.dumps(job_parameters)]
                }
            )
            
            job['batch_job_id'] = batch_response['jobId']
            
        except Exception as e:
            print(f"Error submitting batch job: {str(e)}")
            job['status'] = 'failed'
            job['error'] = str(e)
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    try:
        jobs_table.put_item(Item=job)
        
        response_data = {
            'job_id': job_id,
            'status': job['status'],
            'type': 'text'
        }
        
        if job['status'] == 'completed':
            response_data['dataset_id'] = dataset_id
            response_data['output_location'] = job['output_location']
        
        return build_response(202, response_data)
    
    except Exception as e:
        print(f"Error storing job: {str(e)}")
        return build_response(500, {'error': 'Failed to store job'})

def handle_anonymize_data(body):
    """
    Handle data anonymization request
    """
    # Validate request
    if 'dataset_id' not in body and 'source_location' not in body:
        return build_response(400, {'error': 'Missing required field: dataset_id or source_location'})
    if 'fields_to_anonymize' not in body:
        return build_response(400, {'error': 'Missing required field: fields_to_anonymize'})
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job record
    job = {
        'job_id': job_id,
        'type': 'anonymize',
        'status': 'submitted',
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'parameters': {
            'dataset_id': body.get('dataset_id'),
            'source_location': body.get('source_location'),
            'fields_to_anonymize': body['fields_to_anonymize'],
            'anonymization_method': body.get('anonymization_method', 'mask'),
            'format': body.get('format')
        },
        'output_location': None
    }
    
    # Submit to AWS Batch
    try:
        # Prepare job parameters
        job_parameters = {
            'job_id': job_id,
            'type': 'anonymize',
            'parameters': job['parameters'],
            'output_bucket': STORAGE_BUCKET
        }
        
        # Submit to AWS Batch
        batch_response = batch.submit_job(
            jobName=f"anonymize-{job_id[:8]}",
            jobQueue=BATCH_JOB_QUEUE,
            jobDefinition=BATCH_JOB_DEFINITION,
            containerOverrides={
                'command': ['python', 'anonymize_data.py', json.dumps(job_parameters)]
            }
        )
        
        job['batch_job_id'] = batch_response['jobId']
        
    except Exception as e:
        print(f"Error submitting batch job: {str(e)}")
        job['status'] = 'failed'
        job['error'] = str(e)
    
    # Store job in DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    try:
        jobs_table.put_item(Item=job)
        
        return build_response(202, {
            'job_id': job_id,
            'status': job['status'],
            'type': 'anonymize'
        })
    
    except Exception as e:
        print(f"Error storing job: {str(e)}")
        return build_response(500, {'error': 'Failed to store job'})

def handle_get_dataset(dataset_id):
    """
    Handle get dataset details request
    """
    # Get dataset from DynamoDB
    datasets_table = dynamodb.Table(DATASETS_TABLE)
    try:
        response = datasets_table.get_item(
            Key={'dataset_id': dataset_id}
        )
        
        if 'Item' not in response:
            return build_response(404, {'error': 'Dataset not found'})
        
        dataset = response['Item']
        
        # Generate presigned URL for dataset download
        if 'storage_location' in dataset and dataset['storage_location'].startswith('s3://'):
            try:
                s3_path = dataset['storage_location'].replace('s3://', '').split('/', 1)
                bucket = s3_path[0]
                key = s3_path[1]
                
                presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': bucket,
                        'Key': key
                    },
                    ExpiresIn=3600  # URL valid for 1 hour
                )
                
                dataset['download_url'] = presigned_url
            except Exception as e:
                print(f"Warning: Could not generate presigned URL: {str(e)}")
        
        return build_response(200, dataset)
    except Exception as e:
        print(f"Error retrieving dataset: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve dataset'})

def handle_get_job(job_id):
    """
    Handle get job details request
    """
    # Get job from DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    try:
        response = jobs_table.get_item(
            Key={'job_id': job_id}
        )
        
        if 'Item' not in response:
            return build_response(404, {'error': 'Job not found'})
        
        job = response['Item']
        
        # If job is in 'submitted' status and has a batch_job_id, check AWS Batch status
        if job['status'] == 'submitted' and 'batch_job_id' in job:
            try:
                batch_response = batch.describe_jobs(
                    jobs=[job['batch_job_id']]
                )
                
                if batch_response['jobs']:
                    batch_job = batch_response['jobs'][0]
                    batch_status = batch_job['status']
                    
                    # Map AWS Batch status to our status
                    status_mapping = {
                        'SUBMITTED': 'submitted',
                        'PENDING': 'submitted',
                        'RUNNABLE': 'submitted',
                        'STARTING': 'processing',
                        'RUNNING': 'processing',
                        'SUCCEEDED': 'completed',
                        'FAILED': 'failed'
                    }
                    
                    new_status = status_mapping.get(batch_status, job['status'])
                    
                    # If status changed, update job record
                    if new_status != job['status']:
                        job['status'] = new_status
                        job['updated_at'] = datetime.utcnow().isoformat()
                        
                        update_expr = "set #status = :s, updated_at = :ua"
                        expr_attr_names = {'#status': 'status'}
                        expr_attr_values = {
                            ':s': new_status,
                            ':ua': job['updated_at']
                        }
                        
                        # If job completed or failed, add additional info
                        if new_status == 'completed':
                            job['completed_at'] = datetime.utcnow().isoformat()
                            output_key = f"data/{job_id}/output.{job['parameters'].get('format', 'csv')}"
                            job['output_location'] = f"s3://{STORAGE_BUCKET}/{output_key}"
                            
                            update_expr += ", completed_at = :ca, output_location = :ol"
                            expr_attr_values[':ca'] = job['completed_at']
                            expr_attr_values[':ol'] = job['output_location']
                            
                            # Create dataset record if job completed successfully
                            try:
                                dataset_id = str(uuid.uuid4())
                                dataset = {
                                    'dataset_id': dataset_id,
                                    'name': f"{job['type'].capitalize()} Dataset {dataset_id[:8]}",
                                    'type': job['type'],
                                    'created_at': datetime.utcnow().isoformat(),
                                    'updated_at': datetime.utcnow().isoformat(),
                                    'status': 'available',
                                    'job_id': job_id,
                                    'storage_location': job['output_location'],
                                    'format': job['parameters'].get('format', 'csv'),
                                    'metadata': {}
                                }
                                
                                # Add type-specific fields
                                if job['type'] == 'tabular':
                                    dataset['rows'] = job['parameters'].get('rows')
                                    dataset['schema_id'] = job['parameters'].get('schema_id')
                                elif job['type'] == 'time-series':
                                    dataset['points'] = job['parameters'].get('points')
                                    dataset['start_date'] = job['parameters'].get('start_date')
                                    dataset['frequency'] = job['parameters'].get('frequency')
                                elif job['type'] == 'text':
                                    dataset['count'] = job['parameters'].get('count')
                                
                                # Store dataset in DynamoDB
                                datasets_table = dynamodb.Table(DATASETS_TABLE)
                                datasets_table.put_item(Item=dataset)
                                
                                job['dataset_id'] = dataset_id
                                update_expr += ", dataset_id = :di"
                                expr_attr_values[':di'] = dataset_id
                                
                                # If schema_id exists, update schema dataset count
                                if job['type'] == 'tabular' and job['parameters'].get('schema_id'):
                                    try:
                                        datasets_table.update_item(
                                            Key={'dataset_id': job['parameters']['schema_id']},
                                            UpdateExpression="set dataset_count = dataset_count + :val, updated_at = :ua",
                                            ExpressionAttributeValues={
                                                ':val': 1,
                                                ':ua': datetime.utcnow().isoformat()
                                            }
                                        )
                                    except Exception as e:
                                        print(f"Warning: Could not update schema dataset count: {str(e)}")
                                
                            except Exception as e:
                                print(f"Warning: Could not create dataset record: {str(e)}")
                        
                        elif new_status == 'failed':
                            if 'statusReason' in batch_job:
                                job['error'] = batch_job['statusReason']
                                update_expr += ", #error = :e"
                                expr_attr_names['#error'] = 'error'
                                expr_attr_values[':e'] = job['error']
                        
                        # Update job record
                        jobs_table.update_item(
                            Key={'job_id': job_id},
                            UpdateExpression=update_expr,
                            ExpressionAttributeValues=expr_attr_values,
                            ExpressionAttributeNames=expr_attr_names
                        )
            
            except Exception as e:
                print(f"Warning: Could not check batch job status: {str(e)}")
        
        # Generate presigned URL for output download if available
        if 'output_location' in job and job['output_location'] and job['output_location'].startswith('s3://'):
            try:
                s3_path = job['output_location'].replace('s3://', '').split('/', 1)
                bucket = s3_path[0]
                key = s3_path[1]
                
                presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': bucket,
                        'Key': key
                    },
                    ExpiresIn=3600  # URL valid for 1 hour
                )
                
                job['download_url'] = presigned_url
            except Exception as e:
                print(f"Warning: Could not generate presigned URL: {str(e)}")
        
        return build_response(200, job)
    except Exception as e:
        print(f"Error retrieving job: {str(e)}")
        return build_response(500, {'error': 'Failed to retrieve job'})

def handle_list_datasets(query_params):
    """
    Handle list datasets request
    """
    # Get datasets from DynamoDB
    datasets_table = dynamodb.Table(DATASETS_TABLE)
    
    # Apply filters if provided
    filter_expression = None
    expression_attribute_values = {}
    
    # Filter out schema records unless explicitly requested
    if not query_params or not query_params.get('include_schemas'):
        filter_expression = "attribute_not_exists(is_schema)"
    
    if query_params and 'type' in query_params:
        if filter_expression:
            filter_expression += " AND #type = :type"
        else:
            filter_expression = "#type = :type"
        expression_attribute_values[':type'] = query_params['type']
    
    # Execute query
    try:
        if filter_expression:
            response = datasets_table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_attribute_values if expression_attribute_values else None,
                ExpressionAttributeNames={'#type': 'type'} if 'type' in query_params else None
            )
        else:
            response = datasets_table.scan()
        
        datasets = response.get('Items', [])
        
        return build_response(200, {
            'datasets': datasets,
            'count': len(datasets)
        })
    except Exception as e:
        print(f"Error listing datasets: {str(e)}")
        return build_response(500, {'error': 'Failed to list datasets'})

def handle_list_jobs(query_params):
    """
    Handle list jobs request
    """
    # Get jobs from DynamoDB
    jobs_table = dynamodb.Table(JOBS_TABLE)
    
    # Apply filters if provided
    filter_expression = None
    expression_attribute_values = {}
    
    if query_params and 'type' in query_params:
        filter_expression = "#type = :type"
        expression_attribute_values[':type'] = query_params['type']
    
    if query_params and 'status' in query_params:
        if filter_expression:
            filter_expression += " AND #status = :status"
        else:
            filter_expression = "#status = :status"
        expression_attribute_values[':status'] = query_params['status']
    
    # Execute query
    try:
        if filter_expression:
            response = jobs_table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames={
                    '#type': 'type',
                    '#status': 'status'
                }
            )
        else:
            response = jobs_table.scan()
        
        jobs = response.get('Items', [])
        
        return build_response(200, {
            'jobs': jobs,
            'count': len(jobs)
        })
    except Exception as e:
        print(f"Error listing jobs: {str(e)}")
        return build_response(500, {'error': 'Failed to list jobs'})

def generate_tabular_data(fields, rows, seed=None):
    """
    Generate tabular data based on field definitions
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)
    
    data = []
    
    for _ in range(rows):
        row = {}
        for field in fields:
            field_name = field['name']
            field_type = field['type']
            
            if field_type == 'integer':
                min_val = field.get('min', 0)
                max_val = field.get('max', 100)
                row[field_name] = random.randint(min_val, max_val)
            
            elif field_type == 'float':
                min_val = field.get('min', 0.0)
                max_val = field.get('max', 1.0)
                precision = field.get('precision', 2)
                value = random.uniform(min_val, max_val)
                row[field_name] = round(value, precision)
            
            elif field_type == 'boolean':
                probability = field.get('probability', 0.5)
                row[field_name] = random.random() < probability
            
            elif field_type == 'categorical':
                categories = field.get('categories', [])
                weights = field.get('weights')
                if not categories:
                    row[field_name] = None
                else:
                    row[field_name] = random.choices(categories, weights=weights, k=1)[0]
            
            elif field_type == 'date':
                start_date = field.get('start_date', '2020-01-01')
                end_date = field.get('end_date', '2025-12-31')
                
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                
                delta = (end_dt - start_dt).days
                random_days = random.randint(0, delta)
                random_date = start_dt + timedelta(days=random_days)
                
                row[field_name] = random_date.strftime('%Y-%m-%d')
            
            elif field_type == 'name':
                first_names = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Jennifer', 'William', 'Elizabeth']
                last_names = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor']
                
                first_name = random.choice(first_names)
                last_name = random.choice(last_names)
                
                if field.get('full_name', True):
                    row[field_name] = f"{first_name} {last_name}"
                else:
                    row[field_name] = first_name
            
            elif field_type == 'email':
                first_names = ['john', 'jane', 'michael', 'emily', 'david', 'sarah', 'robert', 'jennifer', 'william', 'elizabeth']
                last_names = ['smith', 'johnson', 'williams', 'jones', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor']
                domains = ['example.com', 'test.com', 'email.com', 'mail.com', 'domain.com']
                
                first_name = random.choice(first_names)
                last_name = random.choice(last_names)
                domain = random.choice(domains)
                
                formats = [
                    f"{first_name}.{last_name}@{domain}",
                    f"{first_name[0]}{last_name}@{domain}",
                    f"{first_name}_{last_name}@{domain}"
                ]
                
                row[field_name] = random.choice(formats)
            
            elif field_type == 'phone':
                formats = [
                    '(###) ###-####',
                    '###-###-####',
                    '+1 ### ### ####'
                ]
                
                format_template = field.get('format', random.choice(formats))
                phone_number = ''
                
                for char in format_template:
                    if char == '#':
                        phone_number += str(random.randint(0, 9))
                    else:
                        phone_number += char
                
                row[field_name] = phone_number
            
            elif field_type == 'address':
                street_numbers = [str(random.randint(1, 9999)) for _ in range(10)]
                street_names = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park', 'Lake', 'Hill']
                street_types = ['St', 'Ave', 'Blvd', 'Rd', 'Ln', 'Dr', 'Way', 'Pl', 'Ct', 'Terrace']
                cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
                states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA']
                zip_codes = ['10001', '90001', '60601', '77001', '85001', '19101', '78201', '92101', '75201', '95101']
                
                idx = random.randint(0, 9)
                
                street_number = random.choice(street_numbers)
                street_name = random.choice(street_names)
                street_type = random.choice(street_types)
                city = cities[idx]
                state = states[idx]
                zip_code = zip_codes[idx]
                
                row[field_name] = f"{street_number} {street_name} {street_type}, {city}, {state} {zip_code}"
            
            elif field_type == 'id':
                prefix = field.get('prefix', '')
                length = field.get('length', 8)
                
                id_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                id_value = ''.join(random.choices(id_chars, k=length))
                
                row[field_name] = f"{prefix}{id_value}"
            
            else:
                # Default to string type
                options = field.get('options', ['Value A', 'Value B', 'Value C'])
                row[field_name] = random.choice(options)
        
        data.append(row)
    
    return data

def generate_time_series_data(fields, points, start_date, frequency, seed=None):
    """
    Generate time series data based on field definitions
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)
    
    # Parse start date
    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    
    # Determine time delta based on frequency
    if frequency == 'hourly':
        delta = timedelta(hours=1)
    elif frequency == 'daily':
        delta = timedelta(days=1)
    elif frequency == 'weekly':
        delta = timedelta(weeks=1)
    elif frequency == 'monthly':
        delta = timedelta(days=30)  # Approximation
    else:
        # Default to daily
        delta = timedelta(days=1)
    
    data = []
    
    # Generate time points
    timestamps = [start_dt + delta * i for i in range(points)]
    
    # Generate field values
    field_values = {}
    for field in fields:
        field_name = field['name']
        field_type = field['type']
        
        if field_type == 'random_walk':
            # Simple random walk
            start_value = field.get('start_value', 0)
            step_size = field.get('step_size', 1)
            
            values = [start_value]
            for i in range(1, points):
                step = random.uniform(-step_size, step_size)
                values.append(values[-1] + step)
            
            field_values[field_name] = values
        
        elif field_type == 'sine_wave':
            # Sine wave with noise
            amplitude = field.get('amplitude', 1)
            period = field.get('period', points / 4)  # Complete 4 cycles by default
            phase = field.get('phase', 0)
            noise_level = field.get('noise', 0.1)
            
            values = []
            for i in range(points):
                base_value = amplitude * np.sin(2 * np.pi * (i / period) + phase)
                noise = random.uniform(-noise_level, noise_level)
                values.append(base_value + noise)
            
            field_values[field_name] = values
        
        elif field_type == 'trend':
            # Linear trend with noise
            start_value = field.get('start_value', 0)
            end_value = field.get('end_value', 100)
            noise_level = field.get('noise', 5)
            
            slope = (end_value - start_value) / (points - 1) if points > 1 else 0
            
            values = []
            for i in range(points):
                base_value = start_value + slope * i
                noise = random.uniform(-noise_level, noise_level)
                values.append(base_value + noise)
            
            field_values[field_name] = values
        
        elif field_type == 'seasonal':
            # Seasonal pattern with trend
            base_value = field.get('base_value', 0)
            trend = field.get('trend', 0.1)
            amplitude = field.get('amplitude', 10)
            period = field.get('period', points / 4)  # Complete 4 cycles by default
            noise_level = field.get('noise', 2)
            
            values = []
            for i in range(points):
                trend_component = base_value + trend * i
                seasonal_component = amplitude * np.sin(2 * np.pi * (i / period))
                noise = random.uniform(-noise_level, noise_level)
                values.append(trend_component + seasonal_component + noise)
            
            field_values[field_name] = values
        
        else:
            # Default to random values
            min_val = field.get('min', 0)
            max_val = field.get('max', 100)
            
            values = [random.uniform(min_val, max_val) for _ in range(points)]
            field_values[field_name] = values
    
    # Combine timestamps and field values
    for i in range(points):
        row = {'timestamp': timestamps[i].isoformat()}
        for field_name, values in field_values.items():
            row[field_name] = values[i]
        data.append(row)
    
    return data

def generate_text_data(template, templates, count, variables, seed=None):
    """
    Generate text data based on templates and variables
    """
    if seed is not None:
        random.seed(seed)
    
    data = []
    
    # Prepare templates list
    template_list = []
    if template:
        template_list.append(template)
    if templates:
        template_list.extend(templates)
    
    # Generate texts
    for _ in range(count):
        # Select template
        selected_template = random.choice(template_list)
        
        # Replace variables
        text = selected_template
        for var_name, var_values in variables.items():
            placeholder = f"{{{var_name}}}"
            if placeholder in text:
                replacement = random.choice(var_values) if isinstance(var_values, list) else str(var_values)
                text = text.replace(placeholder, replacement)
        
        data.append(text)
    
    return data

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
