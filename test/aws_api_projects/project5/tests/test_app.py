import unittest
import json
import os
import boto3
from unittest.mock import patch, MagicMock
from src.app import lambda_handler, build_response, generate_tabular_data, generate_time_series_data, generate_text_data

class TestSyntheticDataAPI(unittest.TestCase):
    
    def setUp(self):
        # Set up environment variables for testing
        os.environ['DATASETS_TABLE'] = 'test-datasets-table'
        os.environ['JOBS_TABLE'] = 'test-jobs-table'
        os.environ['STORAGE_BUCKET'] = 'test-storage-bucket'
        os.environ['BATCH_JOB_QUEUE'] = 'test-job-queue'
        os.environ['BATCH_JOB_DEFINITION'] = 'test-job-definition'
        
        # Create mock event templates
        self.create_schema_event = {
            'httpMethod': 'POST',
            'path': '/data/create-schema',
            'body': json.dumps({
                'name': 'Test Schema',
                'type': 'tabular',
                'fields': [
                    {
                        'name': 'id',
                        'type': 'id',
                        'prefix': 'TST',
                        'length': 6
                    },
                    {
                        'name': 'age',
                        'type': 'integer',
                        'min': 18,
                        'max': 65
                    },
                    {
                        'name': 'income',
                        'type': 'float',
                        'min': 20000,
                        'max': 100000,
                        'precision': 2
                    }
                ]
            })
        }
        
        self.generate_tabular_event = {
            'httpMethod': 'POST',
            'path': '/data/generate-tabular',
            'body': json.dumps({
                'rows': 100,
                'schema': {
                    'fields': [
                        {
                            'name': 'id',
                            'type': 'id',
                            'prefix': 'TST',
                            'length': 6
                        },
                        {
                            'name': 'age',
                            'type': 'integer',
                            'min': 18,
                            'max': 65
                        },
                        {
                            'name': 'income',
                            'type': 'float',
                            'min': 20000,
                            'max': 100000,
                            'precision': 2
                        }
                    ]
                },
                'format': 'csv',
                'include_header': True,
                'seed': 42
            })
        }
        
        self.generate_time_series_event = {
            'httpMethod': 'POST',
            'path': '/data/generate-time-series',
            'body': json.dumps({
                'points': 100,
                'start_date': '2025-01-01T00:00:00Z',
                'frequency': 'daily',
                'fields': [
                    {
                        'name': 'temperature',
                        'type': 'sine_wave',
                        'amplitude': 10,
                        'period': 30,
                        'noise': 2
                    },
                    {
                        'name': 'humidity',
                        'type': 'random_walk',
                        'start_value': 50,
                        'step_size': 3
                    }
                ],
                'format': 'csv',
                'seed': 42
            })
        }
        
        self.generate_text_event = {
            'httpMethod': 'POST',
            'path': '/data/generate-text',
            'body': json.dumps({
                'template': 'Hello, my name is {name} and I am {age} years old.',
                'count': 10,
                'variables': {
                    'name': ['John', 'Jane', 'Bob', 'Alice', 'Mike'],
                    'age': ['25', '30', '35', '40', '45']
                },
                'format': 'txt',
                'seed': 42
            })
        }
        
        self.anonymize_data_event = {
            'httpMethod': 'POST',
            'path': '/data/anonymize',
            'body': json.dumps({
                'dataset_id': 'dataset123',
                'fields_to_anonymize': ['name', 'email', 'phone'],
                'anonymization_method': 'mask'
            })
        }
        
        self.get_dataset_event = {
            'httpMethod': 'GET',
            'path': '/data/datasets/dataset123'
        }
        
        self.get_job_event = {
            'httpMethod': 'GET',
            'path': '/data/jobs/job123'
        }
        
        self.list_datasets_event = {
            'httpMethod': 'GET',
            'path': '/data/datasets',
            'queryStringParameters': {
                'type': 'tabular'
            }
        }
        
        self.list_jobs_event = {
            'httpMethod': 'GET',
            'path': '/data/jobs',
            'queryStringParameters': {
                'type': 'tabular',
                'status': 'completed'
            }
        }
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_create_schema_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.create_schema_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('schema_id', body)
        self.assertEqual(body['name'], 'Test Schema')
        self.assertEqual(body['type'], 'tabular')
        self.assertIn('created_at', body)
        
        # Verify DynamoDB was called correctly
        mock_table.put_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_generate_tabular_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and S3 clients
        mock_datasets_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-datasets-table': mock_datasets_table,
            'test-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_s3 = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.generate_tabular_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'completed')
        self.assertEqual(body['type'], 'tabular')
        self.assertIn('dataset_id', body)
        self.assertIn('output_location', body)
        
        # Verify DynamoDB and S3 were called correctly
        mock_datasets_table.put_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
        mock_s3.put_object.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_generate_time_series_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and S3 clients
        mock_datasets_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-datasets-table': mock_datasets_table,
            'test-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_s3 = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.generate_time_series_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'completed')
        self.assertEqual(body['type'], 'time-series')
        self.assertIn('dataset_id', body)
        self.assertIn('output_location', body)
        
        # Verify DynamoDB and S3 were called correctly
        mock_datasets_table.put_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
        mock_s3.put_object.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_generate_text_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and S3 clients
        mock_datasets_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-datasets-table': mock_datasets_table,
            'test-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_s3 = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.generate_text_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'completed')
        self.assertEqual(body['type'], 'text')
        self.assertIn('dataset_id', body)
        self.assertIn('output_location', body)
        
        # Verify DynamoDB and S3 were called correctly
        mock_datasets_table.put_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
        mock_s3.put_object.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_anonymize_data_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and Batch clients
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_jobs_table
        
        mock_batch = MagicMock()
        mock_batch.submit_job.return_value = {'jobId': 'batch123'}
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'batch': mock_batch
        }[service]
        
        # Call the handler
        response = lambda_handler(self.anonymize_data_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'submitted')
        self.assertEqual(body['type'], 'anonymize')
        
        # Verify DynamoDB and Batch were called correctly
        mock_jobs_table.put_item.assert_called_once()
        mock_batch.submit_job.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_dataset_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and S3 clients
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        # Configure DynamoDB mock to return dataset data
        mock_table.get_item.return_value = {
            'Item': {
                'dataset_id': 'dataset123',
                'name': 'Test Dataset',
                'type': 'tabular',
                'created_at': '2025-04-07T12:00:00Z',
                'status': 'available',
                'rows': 100,
                'storage_location': 's3://test-storage-bucket/data/job123/output.csv'
            }
        }
        
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = 'https://presigned-url.example.com'
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_dataset_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['dataset_id'], 'dataset123')
        self.assertEqual(body['name'], 'Test Dataset')
        self.assertEqual(body['type'], 'tabular')
        self.assertEqual(body['status'], 'available')
        self.assertEqual(body['rows'], 100)
        self.assertIn('download_url', body)
        self.assertEqual(body['download_url'], 'https://presigned-url.example.com')
        
        # Verify DynamoDB and S3 were called correctly
        mock_table.get_item.assert_called_once()
        mock_s3.generate_presigned_url.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_job_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB, S3, and Batch clients
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        # Configure DynamoDB mock to return job data
        mock_table.get_item.return_value = {
            'Item': {
                'job_id': 'job123',
                'type': 'tabular',
                'status': 'completed',
                'created_at': '2025-04-07T12:00:00Z',
                'completed_at': '2025-04-07T12:05:00Z',
                'output_location': 's3://test-storage-bucket/data/job123/output.csv',
                'parameters': {
                    'rows': 100,
                    'format': 'csv'
                }
            }
        }
        
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = 'https://presigned-url.example.com'
        
        mock_batch = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'batch': mock_batch
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_job_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['job_id'], 'job123')
        self.assertEqual(body['type'], 'tabular')
        self.assertEqual(body['status'], 'completed')
        self.assertEqual(body['created_at'], '2025-04-07T12:00:00Z')
        self.assertEqual(body['completed_at'], '2025-04-07T12:05:00Z')
        self.assertIn('download_url', body)
        self.assertEqual(body['download_url'], 'https://presigned-url.example.com')
        
        # Verify DynamoDB and S3 were called correctly
        mock_table.get_item.assert_called_once()
        mock_s3.generate_presigned_url.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_list_datasets_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        # Configure DynamoDB mock to return datasets
        mock_table.scan.return_value = {
            'Items': [
                {
                    'dataset_id': 'dataset123',
                    'name': 'Test Dataset 1',
                    'type': 'tabular',
                    'status': 'available'
                },
                {
                    'dataset_id': 'dataset456',
                    'name': 'Test Dataset 2',
                    'type': 'tabular',
                    'status': 'available'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.list_datasets_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('datasets', body)
        self.assertEqual(body['count'], 2)
        self.assertEqual(len(body['datasets']), 2)
        
        # Verify DynamoDB was called correctly
        mock_table.scan.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_list_jobs_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        # Configure DynamoDB mock to return jobs
        mock_table.scan.return_value = {
            'Items': [
                {
                    'job_id': 'job123',
                    'type': 'tabular',
                    'status': 'completed'
                },
                {
                    'job_id': 'job456',
                    'type': 'tabular',
                    'status': 'completed'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.list_jobs_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('jobs', body)
        self.assertEqual(body['count'], 2)
        self.assertEqual(len(body['jobs']), 2)
        
        # Verify DynamoDB was called correctly
        mock_table.scan.assert_called_once()
    
    def test_missing_required_field(self):
        # Create test event with missing required field
        event = self.generate_tabular_event.copy()
        event['body'] = json.dumps({
            'schema': {
                'fields': []
            }
            # Missing rows
        })
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 400)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Missing required field: rows')
    
    def test_invalid_path(self):
        # Create test event with invalid path
        event = self.generate_tabular_event.copy()
        event['path'] = '/invalid/path'
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 404)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Not Found')
    
    def test_generate_tabular_data(self):
        # Test the generate_tabular_data function
        fields = [
            {
                'name': 'id',
                'type': 'id',
                'prefix': 'TST',
                'length': 6
            },
            {
                'name': 'age',
                'type': 'integer',
                'min': 18,
                'max': 65
            },
            {
                'name': 'income',
                'type': 'float',
                'min': 20000,
                'max': 100000,
                'precision': 2
            }
        ]
        
        # Generate data with fixed seed for reproducibility
        data = generate_tabular_data(fields, 10, seed=42)
        
        # Verify data structure
        self.assertEqual(len(data), 10)
        self.assertIn('id', data[0])
        self.assertIn('age', data[0])
        self.assertIn('income', data[0])
        
        # Verify data types and ranges
        for row in data:
            self.assertTrue(row['id'].startswith('TST'))
            self.assertEqual(len(row['id']), 9)  # 'TST' + 6 chars
            self.assertTrue(18 <= row['age'] <= 65)
            self.assertTrue(20000 <= row['income'] <= 100000)
    
    def test_generate_time_series_data(self):
        # Test the generate_time_series_data function
        fields = [
            {
                'name': 'temperature',
                'type': 'sine_wave',
                'amplitude': 10,
                'period': 30,
                'noise': 2
            },
            {
                'name': 'humidity',
                'type': 'random_walk',
                'start_value': 50,
                'step_size': 3
            }
        ]
        
        # Generate data with fixed seed for reproducibility
        data = generate_time_series_data(fields, 10, '2025-01-01T00:00:00Z', 'daily', seed=42)
        
        # Verify data structure
        self.assertEqual(len(data), 10)
        self.assertIn('timestamp', data[0])
        self.assertIn('temperature', data[0])
        self.assertIn('humidity', data[0])
        
        # Verify timestamps are sequential
        for i in range(1, len(data)):
            prev_timestamp = data[i-1]['timestamp']
            curr_timestamp = data[i]['timestamp']
            self.assertLess(prev_timestamp, curr_timestamp)
    
    def test_generate_text_data(self):
        # Test the generate_text_data function
        template = 'Hello, my name is {name} and I am {age} years old.'
        variables = {
            'name': ['John', 'Jane', 'Bob', 'Alice', 'Mike'],
            'age': ['25', '30', '35', '40', '45']
        }
        
        # Generate data with fixed seed for reproducibility
        data = generate_text_data(template, None, 10, variables, seed=42)
        
        # Verify data structure
        self.assertEqual(len(data), 10)
        
        # Verify variable substitution
        for text in data:
            self.assertTrue(text.startswith('Hello, my name is '))
            self.assertTrue(' and I am ' in text)
            self.assertTrue(' years old.' in text)
            
            # Extract name and age
            name_start = text.find('is ') + 3
            name_end = text.find(' and')
            name = text[name_start:name_end]
            
            age_start = text.find('am ') + 3
            age_end = text.find(' years')
            age = text[age_start:age_end]
            
            # Verify they're from the provided lists
            self.assertIn(name, variables['name'])
            self.assertIn(age, variables['age'])
    
    def test_build_response(self):
        # Test the build_response helper function
        response = build_response(200, {'message': 'Success'})
        
        # Verify the response structure
        self.assertEqual(response['statusCode'], 200)
        self.assertIn('headers', response)
        self.assertIn('Content-Type', response['headers'])
        self.assertIn('Access-Control-Allow-Origin', response['headers'])
        
        # Verify the body
        body = json.loads(response['body'])
        self.assertEqual(body['message'], 'Success')

if __name__ == '__main__':
    unittest.main()
