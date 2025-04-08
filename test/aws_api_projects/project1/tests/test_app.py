import unittest
import json
import os
import boto3
from unittest.mock import patch, MagicMock
from src.app import lambda_handler, build_response

class TestContentTransformationAPI(unittest.TestCase):
    
    def setUp(self):
        # Set up environment variables for testing
        os.environ['TRANSFORM_QUEUE_URL'] = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'
        os.environ['STORAGE_BUCKET_NAME'] = 'test-bucket'
        
        # Create mock event template
        self.event_template = {
            'httpMethod': 'POST',
            'path': '/transform/text-to-speech',
            'body': json.dumps({
                'text': 'Hello world'
            })
        }
    
    @patch('boto3.client')
    def test_text_to_speech_endpoint(self, mock_boto3_client):
        # Set up mock S3 and SQS clients
        mock_s3 = MagicMock()
        mock_sqs = MagicMock()
        
        # Configure boto3.client to return our mocks
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'sqs': mock_sqs
        }[service]
        
        # Create test event
        event = self.event_template.copy()
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'queued')
        self.assertIn('status_url', body)
        
        # Verify S3 and SQS were called correctly
        mock_s3.put_object.assert_called_once()
        mock_sqs.send_message.assert_called_once()
    
    @patch('boto3.client')
    def test_speech_to_text_endpoint(self, mock_boto3_client):
        # Set up mock S3 and SQS clients
        mock_s3 = MagicMock()
        mock_sqs = MagicMock()
        
        # Configure boto3.client to return our mocks
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'sqs': mock_sqs
        }[service]
        
        # Create test event
        event = self.event_template.copy()
        event['path'] = '/transform/speech-to-text'
        event['body'] = json.dumps({
            'audio_url': 'https://example.com/audio.mp3'
        })
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('job_id', body)
        self.assertEqual(body['status'], 'queued')
        self.assertIn('status_url', body)
        
        # Verify S3 and SQS were called correctly
        mock_s3.put_object.assert_called_once()
        mock_sqs.send_message.assert_called_once()
    
    @patch('boto3.client')
    def test_status_endpoint(self, mock_boto3_client):
        # Set up mock S3 client
        mock_s3 = MagicMock()
        
        # Configure mock S3 get_object response
        mock_s3.get_object.return_value = {
            'Body': MagicMock(
                read=MagicMock(
                    return_value=json.dumps({
                        'job_id': '123456',
                        'type': 'text-to-speech',
                        'status': 'completed',
                        'created_at': '2025-04-07T12:00:00Z'
                    }).encode('utf-8')
                )
            )
        }
        
        # Configure boto3.client to return our mock
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            's3': mock_s3,
            'sqs': MagicMock()
        }[service]
        
        # Create test event
        event = {
            'httpMethod': 'GET',
            'path': '/transform/status',
            'queryStringParameters': {
                'job_id': '123456'
            }
        }
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['job_id'], '123456')
        self.assertEqual(body['type'], 'text-to-speech')
        self.assertEqual(body['status'], 'completed')
        self.assertIn('created_at', body)
        self.assertIn('result_url', body)
        
        # Verify S3 was called correctly
        mock_s3.get_object.assert_called_once()
    
    @patch('boto3.client')
    def test_missing_required_field(self, mock_boto3_client):
        # Create test event with missing required field
        event = self.event_template.copy()
        event['body'] = json.dumps({})
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 400)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Missing required field: text')
    
    def test_invalid_path(self):
        # Create test event with invalid path
        event = self.event_template.copy()
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
        self.assertEqual(body['message'], 'Succcess')

if __name__ == '__main__':

    unittest.main()
