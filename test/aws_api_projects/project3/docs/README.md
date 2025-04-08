# AI Voice Generation API

## Overview

The AI Voice Generation API is a microservice that enables the creation of custom voice profiles and generation of natural-sounding speech. It provides capabilities for voice cloning, emotion adjustment, translation, and batch processing of voice generation tasks.

## API Endpoints

### Create Voice Profile
- **Endpoint**: `POST /voice/create-profile`
- **Description**: Creates a new custom voice profile based on audio samples
- **Request Body**:
  ```json
  {
    "name": "John's Voice",
    "description": "Professional male voice for corporate videos",
    "sample_audio_urls": [
      "https://example.com/sample1.mp3",
      "https://example.com/sample2.mp3"
    ],
    "gender": "male",
    "language": "en-US",
    "metadata": {
      "owner": "marketing",
      "use_case": "corporate"
    }
  }
  ```
- **Response**:
  ```json
  {
    "profile_id": "uuid",
    "name": "John's Voice",
    "status": "ready"
  }
  ```

### Generate Speech
- **Endpoint**: `POST /voice/generate`
- **Description**: Generates speech using a voice profile
- **Request Body**:
  ```json
  {
    "profile_id": "uuid",
    "text": "Welcome to our company. We're excited to share our latest innovations with you.",
    "voice_style": "professional",
    "speed": 1.0,
    "pitch": 0,
    "format": "mp3"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "processing"
  }
  ```

### Adjust Emotion
- **Endpoint**: `POST /voice/adjust-emotion`
- **Description**: Adjusts the emotional tone of a previously generated speech
- **Request Body**:
  ```json
  {
    "job_id": "uuid",
    "emotion": "excited",
    "pitch": 1.2,
    "speed": 1.1
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "processing",
    "original_job_id": "uuid"
  }
  ```

### Translate and Generate
- **Endpoint**: `POST /voice/translate`
- **Description**: Translates text and generates speech in the target language
- **Request Body**:
  ```json
  {
    "profile_id": "uuid",
    "text": "Welcome to our company",
    "source_language": "en",
    "target_language": "es",
    "voice_style": "professional"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "processing",
    "source_language": "en",
    "target_language": "es"
  }
  ```

### Batch Process
- **Endpoint**: `POST /voice/batch-process`
- **Description**: Processes multiple text-to-speech conversions in a batch
- **Request Body**:
  ```json
  {
    "profile_id": "uuid",
    "texts": [
      "First paragraph to convert to speech.",
      "Second paragraph to convert to speech.",
      "Third paragraph to convert to speech."
    ],
    "voice_style": "professional",
    "format": "mp3"
  }
  ```
- **Response**:
  ```json
  {
    "batch_id": "uuid",
    "job_count": 3,
    "status": "submitted"
  }
  ```

### Get Profile
- **Endpoint**: `GET /voice/profiles/{profile_id}`
- **Description**: Retrieves details of a voice profile
- **Path Parameters**:
  - `profile_id`: ID of the voice profile to retrieve
- **Response**:
  ```json
  {
    "profile_id": "uuid",
    "name": "John's Voice",
    "description": "Professional male voice for corporate videos",
    "gender": "male",
    "language": "en-US",
    "status": "ready",
    "created_at": "2025-04-07T12:00:00Z",
    "sample_audio_urls": [
      "https://example.com/sample1.mp3",
      "https://example.com/sample2.mp3"
    ]
  }
  ```

### Get Job Status
- **Endpoint**: `GET /voice/jobs/{job_id}`
- **Description**: Retrieves status and details of a voice generation job
- **Path Parameters**:
  - `job_id`: ID of the job to retrieve
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "profile_id": "uuid",
    "text": "Welcome to our company",
    "status": "completed",
    "created_at": "2025-04-07T12:00:00Z",
    "output_url": "https://bucket-name.s3.amazonaws.com/jobs/uuid/output.mp3",
    "options": {
      "voice_style": "professional",
      "speed": 1.0,
      "pitch": 0,
      "format": "mp3"
    }
  }
  ```

### List Profiles
- **Endpoint**: `GET /voice/profiles?language=en-US&gender=female`
- **Description**: Lists available voice profiles with optional filtering
- **Query Parameters**:
  - `language` (optional): Filter by language code
  - `gender` (optional): Filter by gender (male, female, neutral)
- **Response**:
  ```json
  {
    "profiles": [
      {
        "profile_id": "uuid",
        "name": "Sarah's Voice",
        "description": "Professional female voice",
        "gender": "female",
        "language": "en-US",
        "status": "ready"
      },
      {
        "profile_id": "uuid",
        "name": "Emma's Voice",
        "description": "Friendly female voice",
        "gender": "female",
        "language": "en-US",
        "status": "ready"
      }
    ],
    "count": 2
  }
  ```

## Architecture

The AI Voice Generation API follows a microservice architecture pattern optimized for AWS deployment:

1. **API Gateway**: Routes client requests to Lambda functions
2. **Lambda Function**: Handles business logic for voice operations
3. **DynamoDB**: Stores voice profiles and job metadata
4. **S3 Storage**: Stores voice samples and generated audio files
5. **Amazon Polly**: Provides fallback voice generation capabilities
6. **AWS Batch**: Processes resource-intensive batch voice generation jobs

## Data Model

### Voice Profiles Table
- **Primary Key**: `profile_id` (String)
- **Attributes**:
  - `name` (String): Profile name
  - `description` (String): Profile description
  - `sample_audio_urls` (List): URLs to sample audio files
  - `status` (String): Profile status (processing, ready, failed)
  - `created_at` (String): ISO 8601 timestamp
  - `gender` (String): Voice gender (male, female, neutral)
  - `language` (String): Language code (e.g., en-US)
  - `metadata` (Map): Additional profile metadata
  - `ttl` (Number): Time-to-live for data expiration

### Voice Jobs Table
- **Primary Key**: `job_id` (String)
- **GSI**: `batch_id` (String)
- **Attributes**:
  - `profile_id` (String): Associated voice profile ID
  - `text` (String): Text to convert to speech
  - `status` (String): Job status (queued, processing, completed, failed)
  - `created_at` (String): ISO 8601 timestamp
  - `options` (Map): Voice generation options
    - `voice_style` (String): Emotional style
    - `speed` (Number): Speech rate
    - `pitch` (Number): Voice pitch adjustment
    - `format` (String): Output format (mp3, wav)
  - `output_url` (String): URL to generated audio file
  - `batch_id` (String): Associated batch ID (if part of batch)
  - `parent_job_id` (String): Original job ID (for emotion adjustments)
  - `translation` (Map): Translation details (if applicable)
    - `source_language` (String): Source language code
    - `target_language` (String): Target language code
  - `ttl` (Number): Time-to-live for data expiration

## Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- S3 bucket for deployment artifacts
- ECR repository for container images

### Deployment Steps

1. **Build and push the batch processing container image**:
   ```bash
   # Build the image
   docker build -t voice-generation .
   
   # Tag the image
   docker tag voice-generation:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
   
   # Login to ECR
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
   
   # Push the image
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
   ```

2. **Package the Lambda function**:
   ```bash
   # Create a deployment package
   cd src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://${DEPLOYMENT_BUCKET}/${ENVIRONMENT}/voice-generation-api/lambda.zip
   ```

3. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name voice-generation-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

4. **Get the API endpoint**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name voice-generation-api-${ENVIRONMENT} \
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
# Create a voice profile
curl -X POST \
  ${API_ENDPOINT}/voice/create-profile \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Voice",
    "description": "A test voice profile",
    "sample_audio_urls": ["https://example.com/sample1.mp3"],
    "gender": "female",
    "language": "en-US"
  }'

# Generate speech
curl -X POST \
  ${API_ENDPOINT}/voice/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "profile_id": "${PROFILE_ID}",
    "text": "This is a test of voice generation.",
    "voice_style": "professional"
  }'

# Check job status
curl -X GET \
  "${API_ENDPOINT}/voice/jobs/${JOB_ID}"
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
2. **S3 Bucket Policies**: Restricted access to storage
3. **DynamoDB Encryption**: Server-side encryption for all tables
4. **API Gateway Throttling**: Rate limiting to prevent abuse

## Scaling

The API scales automatically based on load:

1. **Lambda Concurrency**: Automatic scaling for request handling
2. **DynamoDB On-Demand**: Pay-per-request billing mode for automatic scaling
3. **Batch Compute Environment**: Auto-scaling for batch processing jobs
4. **S3 Performance**: High throughput for audio storage and retrieval

## Future Enhancements

Potential enhancements for future versions:

1. **Real-time Voice Generation**: WebSocket support for real-time voice generation
2. **Voice Mixing**: Combine multiple voice profiles for duets or ensembles
3. **Voice Analytics**: Analyze voice characteristics and provide recommendations
4. **Voice Marketplace**: Allow users to share and monetize voice profiles
5. **Advanced Emotion Control**: More granular control over emotional expressions
