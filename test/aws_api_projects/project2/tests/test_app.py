import unittest
import json
import os
import boto3
from unittest.mock import patch, MagicMock
from src.app import lambda_handler, build_response

class TestMeetingAssistantAPI(unittest.TestCase):
    
    def setUp(self):
        # Set up environment variables for testing
        os.environ['MEETINGS_TABLE'] = 'test-meetings-table'
        os.environ['TRANSCRIPTS_TABLE'] = 'test-transcripts-table'
        os.environ['ACTIONS_TABLE'] = 'test-actions-table'
        
        # Create mock event templates
        self.transcribe_event = {
            'httpMethod': 'POST',
            'path': '/meetings/transcribe',
            'body': json.dumps({
                'audio_url': 'https://example.com/meeting.mp3',
                'title': 'Test Meeting',
                'participants': ['John Doe', 'Jane Smith']
            })
        }
        
        self.summarize_event = {
            'httpMethod': 'POST',
            'path': '/meetings/summarize',
            'body': json.dumps({
                'meeting_id': '12345'
            })
        }
        
        self.extract_actions_event = {
            'httpMethod': 'POST',
            'path': '/meetings/extract-actions',
            'body': json.dumps({
                'meeting_id': '12345'
            })
        }
        
        self.generate_followup_event = {
            'httpMethod': 'POST',
            'path': '/meetings/generate-followup',
            'body': json.dumps({
                'meeting_id': '12345'
            })
        }
        
        self.search_event = {
            'httpMethod': 'GET',
            'path': '/meetings/search',
            'queryStringParameters': {
                'query': 'test'
            }
        }
        
        self.get_meeting_event = {
            'httpMethod': 'GET',
            'path': '/meetings/12345'
        }
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_transcribe_meeting_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and Transcribe clients
        mock_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_table
        
        mock_transcribe = MagicMock()
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'transcribe': mock_transcribe,
            'comprehend': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.transcribe_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 202)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('meeting_id', body)
        self.assertEqual(body['status'], 'transcribing')
        self.assertEqual(body['title'], 'Test Meeting')
        
        # Verify DynamoDB and Transcribe were called correctly
        mock_table.put_item.assert_called_once()
        mock_transcribe.start_transcription_job.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_summarize_meeting_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and Comprehend clients
        mock_meetings_table = MagicMock()
        mock_transcripts_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return transcript data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-meetings-table': mock_meetings_table,
            'test-transcripts-table': mock_transcripts_table
        }[table_name]
        
        mock_transcripts_table.get_item.return_value = {
            'Item': {
                'meeting_id': '12345',
                'full_text': 'This is a test transcript for the meeting.'
            }
        }
        
        # Configure Comprehend mock to return key phrases
        mock_comprehend = MagicMock()
        mock_comprehend.detect_key_phrases.return_value = {
            'KeyPhrases': [
                {'Text': 'test transcript'},
                {'Text': 'meeting'}
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'comprehend': mock_comprehend,
            'transcribe': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.summarize_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['meeting_id'], '12345')
        self.assertIn('summary', body)
        
        # Verify DynamoDB and Comprehend were called correctly
        mock_transcripts_table.get_item.assert_called_once()
        mock_comprehend.detect_key_phrases.assert_called_once()
        mock_meetings_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_extract_actions_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and Comprehend clients
        mock_meetings_table = MagicMock()
        mock_transcripts_table = MagicMock()
        mock_actions_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return transcript data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-meetings-table': mock_meetings_table,
            'test-transcripts-table': mock_transcripts_table,
            'test-actions-table': mock_actions_table
        }[table_name]
        
        mock_transcripts_table.get_item.return_value = {
            'Item': {
                'meeting_id': '12345',
                'full_text': 'John will follow up with the client. Jane needs to create a report.'
            }
        }
        
        # Configure Comprehend mock to return entities
        mock_comprehend = MagicMock()
        mock_comprehend.detect_entities.return_value = {
            'Entities': [
                {'Text': 'John', 'Type': 'PERSON'},
                {'Text': 'Jane', 'Type': 'PERSON'}
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'comprehend': mock_comprehend,
            'transcribe': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.extract_actions_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['meeting_id'], '12345')
        self.assertIn('action_items', body)
        self.assertIn('count', body)
        
        # Verify DynamoDB and Comprehend were called correctly
        mock_transcripts_table.get_item.assert_called_once()
        mock_comprehend.detect_entities.assert_called_once()
        self.assertGreater(mock_actions_table.put_item.call_count, 0)
        mock_meetings_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_generate_followup_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_meetings_table = MagicMock()
        mock_actions_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return meeting and action data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-meetings-table': mock_meetings_table,
            'test-actions-table': mock_actions_table,
            'test-transcripts-table': MagicMock()
        }[table_name]
        
        mock_meetings_table.get_item.return_value = {
            'Item': {
                'meeting_id': '12345',
                'title': 'Test Meeting'
            }
        }
        
        # Configure actions table to return query results
        mock_actions_table.query.return_value = {
            'Items': [
                {
                    'action_id': 'a1',
                    'meeting_id': '12345',
                    'description': 'Follow up with client',
                    'assignee': 'John Doe'
                },
                {
                    'action_id': 'a2',
                    'meeting_id': '12345',
                    'description': 'Create report',
                    'assignee': 'Jane Smith'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'comprehend': MagicMock(),
            'transcribe': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.generate_followup_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['meeting_id'], '12345')
        self.assertIn('followups', body)
        self.assertEqual(len(body['followups']), 2)  # One for each assignee
        
        # Verify DynamoDB was called correctly
        mock_actions_table.query.assert_called_once()
        mock_meetings_table.get_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_search_meetings_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_meetings_table = MagicMock()
        mock_transcripts_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return meeting data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-meetings-table': mock_meetings_table,
            'test-transcripts-table': mock_transcripts_table,
            'test-actions-table': MagicMock()
        }[table_name]
        
        mock_meetings_table.scan.return_value = {
            'Items': [
                {
                    'meeting_id': '12345',
                    'title': 'Test Meeting 1',
                    'summary': 'This is a test meeting'
                },
                {
                    'meeting_id': '67890',
                    'title': 'Another Meeting',
                    'summary': 'This is not relevant'
                }
            ]
        }
        
        mock_transcripts_table.scan.return_value = {
            'Items': []
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'comprehend': MagicMock(),
            'transcribe': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.search_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('meetings', body)
        self.assertIn('count', body)
        self.assertEqual(body['count'], 1)  # Only one meeting should match "test"
        
        # Verify DynamoDB was called correctly
        mock_meetings_table.scan.assert_called_once()
        mock_transcripts_table.scan.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_meeting_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_meetings_table = MagicMock()
        mock_transcripts_table = MagicMock()
        mock_actions_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return meeting data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-meetings-table': mock_meetings_table,
            'test-transcripts-table': mock_transcripts_table,
            'test-actions-table': mock_actions_table
        }[table_name]
        
        mock_meetings_table.get_item.return_value = {
            'Item': {
                'meeting_id': '12345',
                'title': 'Test Meeting',
                'status': 'completed'
            }
        }
        
        mock_transcripts_table.get_item.return_value = {
            'Item': {
                'meeting_id': '12345',
                'full_text': 'This is the meeting transcript.'
            }
        }
        
        mock_actions_table.query.return_value = {
            'Items': [
                {
                    'action_id': 'a1',
                    'meeting_id': '12345',
                    'description': 'Follow up with client',
                    'assignee': 'John Doe'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'comprehend': MagicMock(),
            'transcribe': MagicMock(),
            'events': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_meeting_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['meeting_id'], '12345')
        self.assertEqual(body['title'], 'Test Meeting')
        self.assertIn('transcript', body)
        self.assertIn('action_items', body)
        
        # Verify DynamoDB was called correctly
        mock_meetings_table.get_item.assert_called_once()
        mock_transcripts_table.get_item.assert_called_once()
        mock_actions_table.query.assert_called_once()
    
    def test_missing_required_field(self):
        # Create test event with missing required field
        event = self.transcribe_event.copy()
        event['body'] = json.dumps({})
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 400)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Missing required field: audio_url')
    
    def test_invalid_path(self):
        # Create test event with invalid path
        event = self.transcribe_event.copy()
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
