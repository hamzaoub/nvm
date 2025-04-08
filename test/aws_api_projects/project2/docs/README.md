# AI Meeting Assistant API

## Overview

The AI Meeting Assistant API is a microservice that provides services for meeting transcription, summarization, action item extraction, and follow-up. It helps users capture, analyze, and act on meeting content with minimal manual effort.

## API Endpoints

### Transcribe Meeting
- **Endpoint**: `POST /meetings/transcribe`
- **Description**: Initiates transcription of a meeting recording
- **Request Body**:
  ```json
  {
    "audio_url": "https://example.com/meeting.mp3",
    "title": "Weekly Team Meeting",
    "participants": ["John Doe", "Jane Smith", "Bob Johnson"],
    "media_format": "mp3",
    "language": "en-US",
    "metadata": {
      "team": "Engineering",
      "project": "Project X"
    }
  }
  ```
- **Response**:
  ```json
  {
    "meeting_id": "uuid",
    "status": "transcribing",
    "title": "Weekly Team Meeting"
  }
  ```

### Summarize Meeting
- **Endpoint**: `POST /meetings/summarize`
- **Description**: Generates a summary of a transcribed meeting
- **Request Body**:
  ```json
  {
    "meeting_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "meeting_id": "uuid",
    "summary": "Meeting summary text..."
  }
  ```

### Extract Action Items
- **Endpoint**: `POST /meetings/extract-actions`
- **Description**: Identifies and extracts action items from a meeting transcript
- **Request Body**:
  ```json
  {
    "meeting_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "meeting_id": "uuid",
    "action_items": [
      {
        "action_id": "uuid",
        "description": "Follow up with client about proposal",
        "assignee": "John Doe"
      },
      {
        "action_id": "uuid",
        "description": "Create project timeline",
        "assignee": "Jane Smith"
      }
    ],
    "count": 2
  }
  ```

### Generate Follow-up Messages
- **Endpoint**: `POST /meetings/generate-followup`
- **Description**: Creates follow-up messages for action items
- **Request Body**:
  ```json
  {
    "meeting_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "meeting_id": "uuid",
    "followups": [
      {
        "assignee": "John Doe",
        "message": "Follow-up message text...",
        "action_count": 1
      },
      {
        "assignee": "Jane Smith",
        "message": "Follow-up message text...",
        "action_count": 1
      }
    ]
  }
  ```

### Search Meetings
- **Endpoint**: `GET /meetings/search?query=keyword` or `GET /meetings/search?date=2025-04-07`
- **Description**: Searches for meetings by keyword or date
- **Query Parameters**:
  - `query`: Keyword to search for in meeting title, summary, or transcript
  - `date`: Date to filter meetings by (YYYY-MM-DD format)
- **Response**:
  ```json
  {
    "meetings": [
      {
        "meeting_id": "uuid",
        "title": "Weekly Team Meeting",
        "created_at": "2025-04-07T12:00:00Z",
        "status": "completed",
        "summary": "Meeting summary snippet..."
      }
    ],
    "count": 1
  }
  ```

### Get Meeting Details
- **Endpoint**: `GET /meetings/{meeting_id}`
- **Description**: Retrieves detailed information about a specific meeting
- **Path Parameters**:
  - `meeting_id`: ID of the meeting to retrieve
- **Response**:
  ```json
  {
    "meeting_id": "uuid",
    "title": "Weekly Team Meeting",
    "created_at": "2025-04-07T12:00:00Z",
    "status": "completed",
    "participants": ["John Doe", "Jane Smith", "Bob Johnson"],
    "summary": "Meeting summary text...",
    "transcript": {
      "full_text": "Complete meeting transcript...",
      "speaker_segments": [
        {
          "speaker": "John Doe",
          "text": "Speaker segment text..."
        }
      ]
    },
    "action_items": [
      {
        "action_id": "uuid",
        "description": "Action item description",
        "assignee": "John Doe",
        "status": "open"
      }
    ]
  }
  ```

## Architecture

The AI Meeting Assistant API follows a microservice architecture pattern optimized for AWS deployment:

1. **API Gateway**: Routes client requests to Lambda functions
2. **Lambda Function**: Handles business logic for meeting operations
3. **DynamoDB**: Stores meeting data, transcripts, and action items
4. **Amazon Transcribe**: Handles speech-to-text conversion
5. **Amazon Comprehend**: Extracts entities and action items
6. **Amazon EventBridge**: Schedules follow-up tasks and notifications

## Data Model

### Meetings Table
- **Primary Key**: `meeting_id` (String)
- **Attributes**:
  - `title` (String): Meeting title
  - `created_at` (String): ISO 8601 timestamp
  - `status` (String): Meeting status (transcribing, transcribed, summarizing, summarized)
  - `participants` (List): List of participant names
  - `audio_url` (String): URL to the meeting audio file
  - `summary` (String): Generated meeting summary
  - `action_count` (Number): Number of action items
  - `metadata` (Map): Additional meeting metadata
  - `ttl` (Number): Time-to-live for data expiration

### Transcripts Table
- **Primary Key**: `meeting_id` (String)
- **Attributes**:
  - `full_text` (String): Complete meeting transcript
  - `speaker_segments` (List): List of speaker segments
  - `created_at` (String): ISO 8601 timestamp
  - `ttl` (Number): Time-to-live for data expiration

### Actions Table
- **Primary Key**: `action_id` (String)
- **GSI**: `meeting_id` (String)
- **Attributes**:
  - `meeting_id` (String): Associated meeting ID
  - `description` (String): Action item description
  - `assignee` (String): Person assigned to the action
  - `status` (String): Action status (open, completed)
  - `created_at` (String): ISO 8601 timestamp
  - `due_date` (String): Optional due date
  - `ttl` (Number): Time-to-live for data expiration

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
   aws s3 cp lambda.zip s3://${DEPLOYMENT_BUCKET}/${ENVIRONMENT}/meeting-assistant-api/lambda.zip
   ```

2. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name meeting-assistant-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

3. **Get the API endpoint**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name meeting-assistant-api-${ENVIRONMENT} \
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
# Transcribe a meeting
curl -X POST \
  ${API_ENDPOINT}/meetings/transcribe \
  -H 'Content-Type: application/json' \
  -d '{
    "audio_url": "https://example.com/meeting.mp3",
    "title": "Test Meeting",
    "participants": ["John Doe", "Jane Smith"]
  }'

# Get meeting details
curl -X GET \
  "${API_ENDPOINT}/meetings/${MEETING_ID}"

# Summarize a meeting
curl -X POST \
  ${API_ENDPOINT}/meetings/summarize \
  -H 'Content-Type: application/json' \
  -d '{
    "meeting_id": "${MEETING_ID}"
  }'

# Extract action items
curl -X POST \
  ${API_ENDPOINT}/meetings/extract-actions \
  -H 'Content-Type: application/json' \
  -d '{
    "meeting_id": "${MEETING_ID}"
  }'

# Generate follow-up messages
curl -X POST \
  ${API_ENDPOINT}/meetings/generate-followup \
  -H 'Content-Type: application/json' \
  -d '{
    "meeting_id": "${MEETING_ID}"
  }'

# Search meetings
curl -X GET \
  "${API_ENDPOINT}/meetings/search?query=test"
```

## Monitoring

The API includes the following monitoring capabilities:

1. **CloudWatch Logs**: All Lambda logs are sent to CloudWatch
2. **CloudWatch Metrics**: Custom metrics for API calls and processing time
3. **CloudWatch Alarms**: Alerts for error rates and processing failures
4. **X-Ray Tracing**: Distributed tracing for request flows

## Security

The API implements the following security measures:

1. **IAM Roles**: Least privilege access for all services
2. **DynamoDB Encryption**: Server-side encryption for all tables
3. **API Gateway Throttling**: Rate limiting to prevent abuse

## Scaling

The API scales automatically based on load:

1. **Lambda Concurrency**: Automatic scaling for request handling
2. **DynamoDB On-Demand**: Pay-per-request billing mode for automatic scaling
3. **API Gateway Scaling**: Handles thousands of requests per second

## Future Enhancements

Potential enhancements for future versions:

1. **Real-time Transcription**: WebSocket support for real-time meeting transcription
2. **Speaker Diarization**: Improved speaker identification and attribution
3. **Meeting Analytics**: Insights on meeting effectiveness and participation
4. **Integration with Calendar**: Automatic scheduling of follow-up meetings
5. **Custom Action Detection**: Train custom models for domain-specific action item detection
