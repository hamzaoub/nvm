# Customer Journey Optimization API

## Overview

The Customer Journey Optimization API is a microservice that enables tracking, analysis, and optimization of customer journeys across multiple touchpoints. It provides capabilities for event tracking, journey creation, touchpoint management, personalized recommendations, and journey analytics.

## API Endpoints

### Track Event
- **Endpoint**: `POST /journey/track-event`
- **Description**: Tracks user events and interactions
- **Request Body**:
  ```json
  {
    "user_id": "user123",
    "event_type": "page_view",
    "properties": {
      "page": "product_detail",
      "product_id": "prod456",
      "referrer": "search"
    },
    "journey_id": "journey789",
    "touchpoint_id": "touchpoint123",
    "session_id": "session456"
  }
  ```
- **Response**:
  ```json
  {
    "event_id": "uuid",
    "timestamp": "2025-04-07T12:00:00Z",
    "kinesis_sequence_number": "49615115722111144582369464"
  }
  ```

### Create User
- **Endpoint**: `POST /journey/create-user`
- **Description**: Creates a new user profile
- **Request Body**:
  ```json
  {
    "user_id": "user123",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 35,
      "location": "New York"
    },
    "segments": ["new_customer", "high_value"],
    "preferences": {
      "communication": {
        "email": true,
        "sms": false,
        "push": true
      },
      "interests": ["technology", "sports"]
    }
  }
  ```
- **Response**:
  ```json
  {
    "user_id": "user123",
    "created_at": "2025-04-07T12:00:00Z"
  }
  ```

### Create Journey
- **Endpoint**: `POST /journey/create-journey`
- **Description**: Creates a new customer journey
- **Request Body**:
  ```json
  {
    "user_id": "user123",
    "name": "Product Onboarding",
    "description": "Guide new users through product features",
    "goal": "Complete product tour and first task",
    "metadata": {
      "category": "onboarding",
      "priority": "high"
    }
  }
  ```
- **Response**:
  ```json
  {
    "journey_id": "uuid",
    "user_id": "user123",
    "name": "Product Onboarding",
    "created_at": "2025-04-07T12:00:00Z"
  }
  ```

### Add Touchpoint
- **Endpoint**: `POST /journey/add-touchpoint`
- **Description**: Adds a touchpoint to a journey
- **Request Body**:
  ```json
  {
    "journey_id": "journey123",
    "channel": "email",
    "content": "Welcome to our product! Here's how to get started...",
    "scheduled_for": "2025-04-10T10:00:00Z",
    "status": "pending",
    "sequence": 1,
    "metadata": {
      "template_id": "welcome_email",
      "subject": "Welcome to Our Product"
    }
  }
  ```
- **Response**:
  ```json
  {
    "touchpoint_id": "uuid",
    "journey_id": "journey123",
    "channel": "email",
    "sequence": 1,
    "created_at": "2025-04-07T12:00:00Z"
  }
  ```

### Get Recommendations
- **Endpoint**: `POST /journey/get-recommendations`
- **Description**: Gets personalized recommendations for a user
- **Request Body**:
  ```json
  {
    "user_id": "user123",
    "num_results": 5,
    "context": {
      "current_page": "product_detail",
      "product_id": "prod456",
      "device": "mobile"
    }
  }
  ```
- **Response**:
  ```json
  {
    "user_id": "user123",
    "recommendations": [
      {
        "item_id": "prod789",
        "score": 0.95
      },
      {
        "item_id": "prod234",
        "score": 0.87
      }
    ],
    "timestamp": "2025-04-07T12:00:00Z"
  }
  ```

### Analyze Journey
- **Endpoint**: `POST /journey/analyze`
- **Description**: Analyzes a customer journey
- **Request Body**:
  ```json
  {
    "journey_id": "journey123"
  }
  ```
- **Response**:
  ```json
  {
    "journey_id": "journey123",
    "user_id": "user123",
    "name": "Product Onboarding",
    "total_touchpoints": 3,
    "interacted_touchpoints": 2,
    "completion_percentage": 66.7,
    "channel_breakdown": {
      "email": {
        "count": 2,
        "interactions": 2
      },
      "push": {
        "count": 1,
        "interactions": 0
      }
    },
    "touchpoint_performance": [
      {
        "touchpoint_id": "touchpoint1",
        "channel": "email",
        "sequence": 1,
        "interaction_count": 1,
        "last_interaction": "2025-04-07T14:30:00Z"
      },
      {
        "touchpoint_id": "touchpoint2",
        "channel": "email",
        "sequence": 2,
        "interaction_count": 1,
        "last_interaction": "2025-04-08T09:15:00Z"
      },
      {
        "touchpoint_id": "touchpoint3",
        "channel": "push",
        "sequence": 3,
        "interaction_count": 0,
        "last_interaction": null
      }
    ]
  }
  ```

### Get User
- **Endpoint**: `GET /journey/users/{user_id}`
- **Description**: Gets user details
- **Path Parameters**:
  - `user_id`: ID of the user to retrieve
- **Response**:
  ```json
  {
    "user_id": "user123",
    "created_at": "2025-04-01T10:00:00Z",
    "last_activity": "2025-04-07T12:00:00Z",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "segments": ["new_customer", "high_value"],
    "preferences": {
      "communication": {
        "email": true,
        "sms": false
      }
    }
  }
  ```

### Get Journey
- **Endpoint**: `GET /journey/journeys/{journey_id}`
- **Description**: Gets journey details including touchpoints
- **Path Parameters**:
  - `journey_id`: ID of the journey to retrieve
- **Response**:
  ```json
  {
    "journey_id": "journey123",
    "user_id": "user123",
    "name": "Product Onboarding",
    "description": "Guide new users through product features",
    "created_at": "2025-04-01T10:00:00Z",
    "updated_at": "2025-04-07T12:00:00Z",
    "status": "active",
    "goal": "Complete product tour",
    "touchpoint_count": 3,
    "completion_percentage": 66.7,
    "touchpoints": [
      {
        "touchpoint_id": "touchpoint1",
        "channel": "email",
        "content": "Welcome email",
        "sequence": 1,
        "status": "completed",
        "interaction_count": 1
      },
      {
        "touchpoint_id": "touchpoint2",
        "channel": "email",
        "content": "Feature highlight",
        "sequence": 2,
        "status": "completed",
        "interaction_count": 1
      },
      {
        "touchpoint_id": "touchpoint3",
        "channel": "push",
        "content": "Reminder notification",
        "sequence": 3,
        "status": "pending",
        "interaction_count": 0
      }
    ]
  }
  ```

### List Users
- **Endpoint**: `GET /journey/users?segment=high_value`
- **Description**: Lists users with optional filtering
- **Query Parameters**:
  - `segment` (optional): Filter users by segment
- **Response**:
  ```json
  {
    "users": [
      {
        "user_id": "user123",
        "attributes": {
          "name": "John Doe"
        },
        "segments": ["high_value", "new_customer"]
      },
      {
        "user_id": "user456",
        "attributes": {
          "name": "Jane Smith"
        },
        "segments": ["high_value", "returning"]
      }
    ],
    "count": 2
  }
  ```

### List Journeys
- **Endpoint**: `GET /journey/journeys?user_id=user123&status=active`
- **Description**: Lists journeys with optional filtering
- **Query Parameters**:
  - `user_id` (optional): Filter journeys by user ID
  - `status` (optional): Filter journeys by status
- **Response**:
  ```json
  {
    "journeys": [
      {
        "journey_id": "journey123",
        "user_id": "user123",
        "name": "Product Onboarding",
        "status": "active",
        "created_at": "2025-04-01T10:00:00Z",
        "touchpoint_count": 3,
        "completion_percentage": 66.7
      },
      {
        "journey_id": "journey456",
        "user_id": "user123",
        "name": "Feature Adoption",
        "status": "active",
        "created_at": "2025-04-05T14:00:00Z",
        "touchpoint_count": 2,
        "completion_percentage": 50.0
      }
    ],
    "count": 2
  }
  ```

## Architecture

The Customer Journey Optimization API follows a microservice architecture pattern optimized for AWS deployment:

1. **API Gateway**: Routes client requests to Lambda functions
2. **Lambda Function**: Handles business logic for journey operations
3. **DynamoDB**: Stores user profiles, journeys, and touchpoints
4. **Kinesis Stream**: Captures real-time event data
5. **Amazon Personalize**: Provides personalized recommendations
6. **Kinesis Firehose**: Delivers event data to S3 for analytics

## Data Model

### Users Table
- **Primary Key**: `user_id` (String)
- **Attributes**:
  - `created_at` (String): ISO 8601 timestamp
  - `last_activity` (String): ISO 8601 timestamp
  - `attributes` (Map): User attributes
  - `segments` (List): User segments
  - `preferences` (Map): User preferences
  - `ttl` (Number): Time-to-live for data expiration

### Journeys Table
- **Primary Key**: `journey_id` (String)
- **GSI**: `user_id` (String)
- **Attributes**:
  - `user_id` (String): Associated user ID
  - `name` (String): Journey name
  - `description` (String): Journey description
  - `created_at` (String): ISO 8601 timestamp
  - `updated_at` (String): ISO 8601 timestamp
  - `status` (String): Journey status (active, completed, abandoned)
  - `goal` (String): Journey goal
  - `touchpoint_count` (Number): Number of touchpoints
  - `completion_percentage` (Number): Journey completion percentage
  - `metadata` (Map): Additional journey metadata
  - `ttl` (Number): Time-to-live for data expiration

### Touchpoints Table
- **Primary Key**: `journey_id` (String), `touchpoint_id` (String)
- **Attributes**:
  - `channel` (String): Communication channel
  - `content` (String): Touchpoint content
  - `created_at` (String): ISO 8601 timestamp
  - `scheduled_for` (String): ISO 8601 timestamp for scheduled delivery
  - `status` (String): Touchpoint status (pending, delivered, completed)
  - `sequence` (Number): Touchpoint sequence in journey
  - `interaction_count` (Number): Number of interactions
  - `last_interaction` (String): ISO 8601 timestamp of last interaction
  - `metadata` (Map): Additional touchpoint metadata
  - `ttl` (Number): Time-to-live for data expiration

## Event Stream

The API uses a Kinesis stream to capture all events, which can be used for:

1. **Real-time Analytics**: Monitor user behavior and journey progress
2. **Personalization**: Feed data to Amazon Personalize for recommendations
3. **Reporting**: Generate insights on journey effectiveness
4. **Alerting**: Trigger notifications for journey milestones

Event types include:
- `page_view`: User viewed a page
- `click`: User clicked on an element
- `form_submit`: User submitted a form
- `touchpoint_delivered`: Touchpoint was delivered to user
- `touchpoint_interaction`: User interacted with a touchpoint
- `journey_started`: User started a journey
- `journey_completed`: User completed a journey
- `recommendation_served`: Recommendations were served to user
- `recommendation_click`: User clicked on a recommendation

## Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- S3 bucket for deployment artifacts

### Deployment Steps

1. **Package the Lambda function**:
   ```bash
   # Create a deployment package
   cd src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://${DEPLOYMENT_BUCKET}/${ENVIRONMENT}/customer-journey-api/lambda.zip
   ```

2. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name customer-journey-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

3. **Get the API endpoint**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name customer-journey-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   ```

## Testing

### Unit Tests

Run the unit tests with:

```bash
cd tests
python -m unittest test_app.py
```

### Integration Tests

Test the deployed API with:

```bash
# Create a user
curl -X POST \
  ${API_ENDPOINT}/journey/create-user \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test_user",
    "attributes": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "segments": ["test"]
  }'

# Create a journey
curl -X POST \
  ${API_ENDPOINT}/journey/create-journey \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test_user",
    "name": "Test Journey",
    "description": "A test journey"
  }'

# Track an event
curl -X POST \
  ${API_ENDPOINT}/journey/track-event \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test_user",
    "event_type": "page_view",
    "properties": {
      "page": "home"
    }
  }'
```

## Monitoring

The API includes the following monitoring capabilities:

1. **CloudWatch Logs**: All Lambda logs are sent to CloudWatch
2. **CloudWatch Metrics**: Custom metrics for API calls and event processing
3. **CloudWatch Alarms**: Alerts for error rates and processing failures
4. **X-Ray Tracing**: Distributed tracing for request flows
5. **Kinesis Analytics**: Real-time analytics on event stream

## Security

The API implements the following security measures:

1. **IAM Roles**: Least privilege access for all services
2. **DynamoDB Encryption**: Server-side encryption for all tables
3. **Kinesis Encryption**: Server-side encryption for event stream
4. **API Gateway Throttling**: Rate limiting to prevent abuse

## Scaling

The API scales automatically based on load:

1. **Lambda Concurrency**: Automatic scaling for request handling
2. **DynamoDB On-Demand**: Pay-per-request billing mode for automatic scaling
3. **Kinesis Shards**: Can be scaled to handle high event volumes
4. **API Gateway Scaling**: Handles thousands of requests per second

## Future Enhancements

Potential enhancements for future versions:

1. **A/B Testing**: Support for testing different journey paths
2. **Machine Learning**: Advanced journey optimization using ML models
3. **Multi-channel Orchestration**: Coordinated messaging across channels
4. **Journey Templates**: Pre-defined journey templates for common scenarios
5. **Real-time Dashboards**: Visual monitoring of journey performance
