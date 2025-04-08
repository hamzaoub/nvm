import unittest
import json
import os
import boto3
from unittest.mock import patch, MagicMock
from src.app import lambda_handler, build_response

class TestCustomerJourneyAPI(unittest.TestCase):
    
    def setUp(self):
        # Set up environment variables for testing
        os.environ['USERS_TABLE'] = 'test-users-table'
        os.environ['JOURNEYS_TABLE'] = 'test-journeys-table'
        os.environ['TOUCHPOINTS_TABLE'] = 'test-touchpoints-table'
        os.environ['EVENTS_STREAM'] = 'test-events-stream'
        os.environ['PERSONALIZE_CAMPAIGN_ARN'] = 'test-campaign-arn'
        
        # Create mock event templates
        self.track_event_event = {
            'httpMethod': 'POST',
            'path': '/journey/track-event',
            'body': json.dumps({
                'user_id': 'user123',
                'event_type': 'page_view',
                'properties': {
                    'page': 'homepage',
                    'referrer': 'google'
                }
            })
        }
        
        self.create_user_event = {
            'httpMethod': 'POST',
            'path': '/journey/create-user',
            'body': json.dumps({
                'user_id': 'user123',
                'attributes': {
                    'name': 'John Doe',
                    'email': 'john@example.com'
                },
                'segments': ['new_customer', 'high_value']
            })
        }
        
        self.create_journey_event = {
            'httpMethod': 'POST',
            'path': '/journey/create-journey',
            'body': json.dumps({
                'user_id': 'user123',
                'name': 'Onboarding Journey',
                'description': 'Guide new users through product features',
                'goal': 'Complete product tour'
            })
        }
        
        self.add_touchpoint_event = {
            'httpMethod': 'POST',
            'path': '/journey/add-touchpoint',
            'body': json.dumps({
                'journey_id': 'journey123',
                'channel': 'email',
                'content': 'Welcome to our product!',
                'scheduled_for': '2025-04-10T10:00:00Z',
                'status': 'pending'
            })
        }
        
        self.get_recommendations_event = {
            'httpMethod': 'POST',
            'path': '/journey/get-recommendations',
            'body': json.dumps({
                'user_id': 'user123',
                'num_results': 3,
                'context': {
                    'current_page': 'product_page'
                }
            })
        }
        
        self.analyze_journey_event = {
            'httpMethod': 'POST',
            'path': '/journey/analyze',
            'body': json.dumps({
                'journey_id': 'journey123'
            })
        }
        
        self.get_user_event = {
            'httpMethod': 'GET',
            'path': '/journey/users/user123'
        }
        
        self.get_journey_event = {
            'httpMethod': 'GET',
            'path': '/journey/journeys/journey123'
        }
        
        self.list_users_event = {
            'httpMethod': 'GET',
            'path': '/journey/users',
            'queryStringParameters': {
                'segment': 'high_value'
            }
        }
        
        self.list_journeys_event = {
            'httpMethod': 'GET',
            'path': '/journey/journeys',
            'queryStringParameters': {
                'user_id': 'user123',
                'status': 'active'
            }
        }
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_track_event_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB and Kinesis clients
        mock_users_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_users_table
        
        mock_kinesis = MagicMock()
        mock_kinesis.put_record.return_value = {
            'SequenceNumber': '12345'
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': mock_kinesis,
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.track_event_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('event_id', body)
        self.assertIn('timestamp', body)
        self.assertIn('kinesis_sequence_number', body)
        
        # Verify Kinesis and DynamoDB were called correctly
        mock_kinesis.put_record.assert_called_once()
        mock_users_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_create_user_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_users_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_users_table
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.create_user_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['user_id'], 'user123')
        self.assertIn('created_at', body)
        
        # Verify DynamoDB was called correctly
        mock_users_table.put_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_create_journey_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_journeys_table = MagicMock()
        mock_dynamodb = MagicMock()
        mock_dynamodb.Table.return_value = mock_journeys_table
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.create_journey_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('journey_id', body)
        self.assertEqual(body['user_id'], 'user123')
        self.assertEqual(body['name'], 'Onboarding Journey')
        self.assertIn('created_at', body)
        
        # Verify DynamoDB was called correctly
        mock_journeys_table.put_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_add_touchpoint_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_journeys_table = MagicMock()
        mock_touchpoints_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return journey data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-journeys-table': mock_journeys_table,
            'test-touchpoints-table': mock_touchpoints_table
        }[table_name]
        
        mock_journeys_table.get_item.return_value = {
            'Item': {
                'journey_id': 'journey123',
                'user_id': 'user123',
                'name': 'Onboarding Journey',
                'touchpoint_count': 0
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.add_touchpoint_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 201)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('touchpoint_id', body)
        self.assertEqual(body['journey_id'], 'journey123')
        self.assertEqual(body['channel'], 'email')
        self.assertEqual(body['sequence'], 1)
        self.assertIn('created_at', body)
        
        # Verify DynamoDB was called correctly
        mock_journeys_table.get_item.assert_called_once()
        mock_touchpoints_table.put_item.assert_called_once()
        mock_journeys_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_recommendations_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock Personalize and Kinesis clients
        mock_personalize_runtime = MagicMock()
        mock_kinesis = MagicMock()
        
        # Configure Personalize mock to return recommendations
        mock_personalize_runtime.get_recommendations.return_value = {
            'itemList': [
                {'itemId': 'item1', 'score': 0.9},
                {'itemId': 'item2', 'score': 0.8},
                {'itemId': 'item3', 'score': 0.7}
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = MagicMock()
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': mock_kinesis,
            'personalize': MagicMock(),
            'personalize-runtime': mock_personalize_runtime
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_recommendations_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['user_id'], 'user123')
        self.assertIn('recommendations', body)
        self.assertEqual(len(body['recommendations']), 3)
        self.assertEqual(body['recommendations'][0]['item_id'], 'item1')
        self.assertIn('timestamp', body)
        
        # Verify Personalize and Kinesis were called correctly
        mock_personalize_runtime.get_recommendations.assert_called_once()
        mock_kinesis.put_record.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_analyze_journey_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_journeys_table = MagicMock()
        mock_touchpoints_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return journey and touchpoint data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-journeys-table': mock_journeys_table,
            'test-touchpoints-table': mock_touchpoints_table,
            'test-users-table': MagicMock()
        }[table_name]
        
        mock_journeys_table.get_item.return_value = {
            'Item': {
                'journey_id': 'journey123',
                'user_id': 'user123',
                'name': 'Onboarding Journey',
                'touchpoint_count': 2
            }
        }
        
        mock_touchpoints_table.query.return_value = {
            'Items': [
                {
                    'journey_id': 'journey123',
                    'touchpoint_id': 'touchpoint1',
                    'channel': 'email',
                    'sequence': 1,
                    'interaction_count': 1
                },
                {
                    'journey_id': 'journey123',
                    'touchpoint_id': 'touchpoint2',
                    'channel': 'push',
                    'sequence': 2,
                    'interaction_count': 0
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.analyze_journey_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['journey_id'], 'journey123')
        self.assertEqual(body['user_id'], 'user123')
        self.assertEqual(body['name'], 'Onboarding Journey')
        self.assertEqual(body['total_touchpoints'], 2)
        self.assertEqual(body['interacted_touchpoints'], 1)
        self.assertEqual(body['completion_percentage'], 50.0)
        self.assertIn('channel_breakdown', body)
        self.assertIn('touchpoint_performance', body)
        
        # Verify DynamoDB was called correctly
        mock_journeys_table.get_item.assert_called_once()
        mock_touchpoints_table.query.assert_called_once()
        mock_journeys_table.update_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_user_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_users_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return user data
        mock_dynamodb.Table.return_value = mock_users_table
        
        mock_users_table.get_item.return_value = {
            'Item': {
                'user_id': 'user123',
                'created_at': '2025-04-07T12:00:00Z',
                'attributes': {
                    'name': 'John Doe',
                    'email': 'john@example.com'
                },
                'segments': ['new_customer', 'high_value']
            }
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_user_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['user_id'], 'user123')
        self.assertEqual(body['created_at'], '2025-04-07T12:00:00Z')
        self.assertEqual(body['attributes']['name'], 'John Doe')
        self.assertEqual(body['segments'], ['new_customer', 'high_value'])
        
        # Verify DynamoDB was called correctly
        mock_users_table.get_item.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_get_journey_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB clients
        mock_journeys_table = MagicMock()
        mock_touchpoints_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return journey and touchpoint data
        mock_dynamodb.Table.side_effect = lambda table_name: {
            'test-journeys-table': mock_journeys_table,
            'test-touchpoints-table': mock_touchpoints_table,
            'test-users-table': MagicMock()
        }[table_name]
        
        mock_journeys_table.get_item.return_value = {
            'Item': {
                'journey_id': 'journey123',
                'user_id': 'user123',
                'name': 'Onboarding Journey',
                'description': 'Guide new users through product features',
                'created_at': '2025-04-07T12:00:00Z',
                'status': 'active'
            }
        }
        
        mock_touchpoints_table.query.return_value = {
            'Items': [
                {
                    'journey_id': 'journey123',
                    'touchpoint_id': 'touchpoint1',
                    'channel': 'email',
                    'content': 'Welcome email',
                    'sequence': 1
                },
                {
                    'journey_id': 'journey123',
                    'touchpoint_id': 'touchpoint2',
                    'channel': 'push',
                    'content': 'Feature announcement',
                    'sequence': 2
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.get_journey_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertEqual(body['journey_id'], 'journey123')
        self.assertEqual(body['user_id'], 'user123')
        self.assertEqual(body['name'], 'Onboarding Journey')
        self.assertEqual(body['created_at'], '2025-04-07T12:00:00Z')
        self.assertEqual(body['status'], 'active')
        self.assertIn('touchpoints', body)
        self.assertEqual(len(body['touchpoints']), 2)
        
        # Verify DynamoDB was called correctly
        mock_journeys_table.get_item.assert_called_once()
        mock_touchpoints_table.query.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_list_users_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_users_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return users
        mock_dynamodb.Table.return_value = mock_users_table
        
        mock_users_table.scan.return_value = {
            'Items': [
                {
                    'user_id': 'user123',
                    'attributes': {'name': 'John Doe'},
                    'segments': ['high_value']
                },
                {
                    'user_id': 'user456',
                    'attributes': {'name': 'Jane Smith'},
                    'segments': ['high_value', 'returning']
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.list_users_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('users', body)
        self.assertEqual(body['count'], 2)
        self.assertEqual(len(body['users']), 2)
        
        # Verify DynamoDB was called correctly
        mock_users_table.scan.assert_called_once()
    
    @patch('boto3.resource')
    @patch('boto3.client')
    def test_list_journeys_endpoint(self, mock_boto3_client, mock_boto3_resource):
        # Set up mock DynamoDB client
        mock_journeys_table = MagicMock()
        mock_dynamodb = MagicMock()
        
        # Configure DynamoDB mock to return journeys
        mock_dynamodb.Table.return_value = mock_journeys_table
        
        mock_journeys_table.scan.return_value = {
            'Items': [
                {
                    'journey_id': 'journey123',
                    'user_id': 'user123',
                    'name': 'Onboarding Journey',
                    'status': 'active'
                }
            ]
        }
        
        # Configure boto3 mocks
        mock_boto3_resource.return_value = mock_dynamodb
        mock_boto3_client.side_effect = lambda service, **kwargs: {
            'kinesis': MagicMock(),
            'personalize': MagicMock(),
            'personalize-runtime': MagicMock()
        }[service]
        
        # Call the handler
        response = lambda_handler(self.list_journeys_event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 200)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify response contains expected fields
        self.assertIn('journeys', body)
        self.assertEqual(body['count'], 1)
        self.assertEqual(len(body['journeys']), 1)
        
        # Verify DynamoDB was called correctly
        mock_journeys_table.scan.assert_called_once()
    
    def test_missing_required_field(self):
        # Create test event with missing required field
        event = self.track_event_event.copy()
        event['body'] = json.dumps({
            'event_type': 'page_view'
            # Missing user_id
        })
        
        # Call the handler
        response = lambda_handler(event, {})
        
        # Verify the response
        self.assertEqual(response['statusCode'], 400)
        
        # Parse the response body
        body = json.loads(response['body'])
        
        # Verify error message
        self.assertIn('error', body)
        self.assertEqual(body['error'], 'Missing required field: user_id')
    
    def test_invalid_path(self):
        # Create test event with invalid path
        event = self.track_event_event.copy()
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
