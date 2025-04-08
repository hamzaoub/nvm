import unittest
import json
import os
import boto3
from unittest.mock import patch, MagicMock
from src.app import lambda_handler, build_response

class TestVoiceGenerationAPI(unittest.TestCase):
    
    def setUp(self):
        # Set up environment variables for testing
        os.environ['VOICE_PROFILES_TABLE'] = 'test-voice-profiles-table'
        os.environ['VOICE_JOBS_TABLE'] = 'test-voice-jobs-table'
        os.environ['STORAGE_BUCKET'] = 'test-storage-bucket'
        os.environ['BATCH_JOB_QUEUE'] = 'test-job-queue'
        os.environ['BATCH_JOB_DEFINITION'] = 'test-job-definition'
        
        # Create mock event templates
        self.create_profile_event = {
            'httpMethod': 'POST',
            'path': '/voice/create-profile',
            'body': json.dumps({
                'name': 'Test Voice',
                'description': 'A test voice profile',
                'sample_audio_urls': ['https://example.com/sample1.mp3', 'https://example.com/sample2.mp3'],
                'gender': 'female',
                'language': 'en-US'
            })
        }
        
        self.generate_speech_event = {
            'httpMethod': 'POST',
            'path': '/voice/generate',
            'body': json.dumps({
                'profile_id': '12345',
                'text': 'This is a test of voice generation.',
                'voice_style': 'happy',
                'speed': 1.2,
                'format': 'mp3'
            })
        }
        
        self.adjust_emotion_event = {
            'httpMethod': 'POST',
            'path': '/voice/adjust-emotion',
            'body': json.dumps({
                'job_id': '12345',
                'emotion': 'excited',
                'pitch': 1.5
            })
        }
        
        self.translate_event = {
            'httpMethod': 'POST',
            'path': '/voice/translate',
            'body': json.dumps({
                'profile_id': '12345',
                'text': 'Hello world',
                'source_language': 'en',
                'target_language': 'es'
            })
        }
        
        self.batch_process_event = {
            'httpMethod': 'POST',
            'path': '/voice/batch-process',
            'body': json.dumps({
                'profile_id': '12345',
                'texts': ['Text 1', 'Text 2', 'Text 3'],
                'voice_style': 'neutral'
            })
        }
        
        self.get_profile_event = {
            'httpMethod': 'GET',
            'path': '/voice/profiles/12345'
        }
        
        self.get_job_event = {
            'httpMethod': 'GET',
            'path': '/voice/jobs/12345'
        }
        
        self.list_profiles_event = {
            'httpMethod': 'GET',
            'path': '/voice/profiles',
            'queryStringParameters': {
                'language': 'en-US'
            }
        }
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_create_profile_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and S3 clients
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        mock_s3 = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.create_profile_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('profile_id', body)
        self.assertEqual(body['name'], 'Test Voice')
        self.assertEqual(body['status'], 'ready')
        
        # Verify DynamoDB and S3 were called correctly
        mock_table.put_item.assert_called_once()
        mock_table.update_item.assert_called_once()
        self.assertEqual(mock_s3.put_object.call_count, 2)  # One for each sample URL
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_generate_speech_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB, S3, and Polly clients
        mock_profiles_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return profile data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-voice-profiles-table': mock_profiles_table,
            'test-voice-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_profiles_table.get_item.return_value = {
            'Item': {
                'profile_id': '12345',
                'name': 'Test Voice',
                'gender': 'female',
                'language': 'en-US'
            }
        }
        
        # Configure Polly mock to return audio stream
        mock_polly = MagicMock()
        mock_polly.synthesize_speech.return_value = {
            'AudioStream': MagicMock(read=lambda: b'audio data')
        }
        
        mock_s3 = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'polly': mock_polly,
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.generate_speech_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'completed')
        self.assertIn('output_url', body)
        
        # Verify DynamoDB, Polly, and S3 were called correctly
        mock_profiles_table.get_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
        mock_polly.synthesize_speech.assert_called_once()
        mock_s3.put_object.assert_called_once()
        mock_jobs_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_adjust_emotion_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return job data
        mock_dynamodb.Table.return_value = mock_jobs_table
        
        mock_jobs_table.get_item.return_value = {
            'Item': {
                'job_id': '12345',
                'profile_id': 'profile123',
                'text': 'Original text',
                'options': {
                    'voice_style': 'neutral',
                    'speed': 1.0,
                    'format': 'mp3'
                }
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.adjust_emotion_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'processing')
        self.assertEqual(body['original_job_id'], '12345')
        
        # Verify DynamoDB was called correctly
        mock_jobs_table.get_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_translate_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_profiles_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return profile data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-voice-profiles-table': mock_profiles_table,
            'test-voice-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_profiles_table.get_item.return_value = {
            'Item': {
                'profile_id': '12345',
                'name': 'Test Voice',
                'language': 'en-US'
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.translate_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'processing')
        self.assertEqual(body['source_language'], 'en')
        self.assertEqual(body['target_language'], 'es')
        
        # Verify DynamoDB was called correctly
        mock_profiles_table.get_item.assert_called_once()
        mock_jobs_table.put_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_batch_process_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB, S3, and Batch clients
        mock_profiles_table = MagicMock()
        mock_jobs_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return profile data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-voice-profiles-table': mock_profiles_table,
            'test-voice-jobs-table': mock_jobs_table
        }[table_name]
        
        mock_profiles_table.get_item.return_value = {
            'Item': {
                'profile_id': '12345',
                'name': 'Test Voice',
                'language': 'en-US'
            }
        }
        
        mock_s3 = MagicMock()
        mock_batch = MagicMock()
        mock_batch.submit_job.return_value = {'jobId': 'batch123'}
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'polly': MagicMock(),
            'batch': mock_batch
        }[service]
        
        # Call the handler
        response = lambda_handler(self.batch_process_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('batch_id', body)
        self.assertEqual(body['job_count'], 3)
        self.assertEqual(body['status'], 'submitted')
        
        # Verify DynamoDB, S3, and Batch were called correctly
        mock_profiles_table.get_item.assert_called_once()
        self.assertEqual(mock_jobs_table.put_item.call_count, 3)  # One for each text
        mock_s3.put_object.assert_called_once()
        mock_batch.submit_job.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_profile_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return profile data
        mock_dynamodb.Table.return_value = mock_table
        
        mock_table.get_item.return_value = {
            'Item': {
                'profile_id': '12345',
                'name': 'Test Voice',
                'description': 'A test voice profile',
                'gender': 'female',
                'language': 'en-US',
                'status': 'ready'
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_profile_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['profile_id'], '12345')
        self.assertEqual(body['name'], 'Test Voice')
        self.assertEqual(body['gender'], 'female')
        self.assertEqual(body['language'], 'en-US')
        self.assertEqual(body['status'], 'ready')
        
        # Verify DynamoDB was called correctly
        mock_table.get_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_job_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return job data
        mock_dynamodb.Table.return_value = mock_table
        
        mock_table.get_item.return_value = {
            'Item': {
                'job_id': '12345',
                'profile_id': 'profile123',
                'text': 'This is a test',
                'status': 'completed',
                'options': {
                    'format': 'mp3'
                }
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_job_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['job_id'], '12345')
        self.assertEqual(body['profile_id'], 'profile123')
        self.assertEqual(body['text'], 'This is a test')
        self.assertEqual(body['status'], 'completed')
        self.assertIn('output_url', body)
        
        # Verify DynamoDB was called correctly
        mock_table.get_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_list_profiles_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return profiles
        mock_dynamodb.Table.return_value = mock_table
        
        mock_table.scan.return_value = {
            'Items': [
                {
                    'profile_id': '12345',
                    'name': 'Test Voice 1',
                    'language': 'en-US',
                    'gender': 'female'
                },
                {
                    'profile_id': '67890',
                    'name': 'Test Voice 2',
                    'language': 'en-US',
                    'gender': 'male'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': MagicMock(),
            'polly': MagicMock(),
            'batch': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.list_profiles_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('profiles', body)
        self.assertEqual(body['count'], 2)
        self.assertEqual(len(body['profiles']), 2)
        
        # Verify DynamoDB was called correctly
        mock_table.scan.assert_called_once()
    
    def test_missing_required_field(self):
        # Create test event with missing required field
        event = self.create_profile_event.copy()
        event['body'] = json.dumps({
            'name': 'Test Voice'
            # Missing sample_audio_urls
        })
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 400)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Missing required field: sample_audio_urls')
    
    def test_invalid_path(self):
        # Create test event with invalid path
        event = self.create_profile_event.copy()
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
