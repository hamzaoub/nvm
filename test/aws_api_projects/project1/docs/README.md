# Content Transformation API

## Overview

The Content Transformation API is a microservice that enables conversion between different content formats (text, audio, video, image) while preserving context. It provides a set of RESTful endpoints for submitting transformation jobs and checking their status.

## API Endpoints

### Text to Speech
- **Endpoint**: `POST /transform/text-to-speech`
- **Description**: Converts text to natural-sounding speech
- **Request Body**:
  ```json
  {
    "text": "Text to be converted to speech",
    "voice": "default",
    "speed": 1.0,
    "format": "mp3"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "queued",
    "status_url": "/transform/status?job_id=uuid"
  }
  ```

### Speech to Text
- **Endpoint**: `POST /transform/speech-to-text`
- **Description**: Transcribes audio to text
- **Request Body**:
  ```json
  {
    "audio_url": "https://example.com/audio.mp3",
    "language": "en-US",
    "format": "txt"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "queued",
    "status_url": "/transform/status?job_id=uuid"
  }
  ```

### Text to Image
- **Endpoint**: `POST /transform/text-to-image`
- **Description**: Generates images from text descriptions
- **Request Body**:
  ```json
  {
    "prompt": "A detailed description of the image to generate",
    "width": 512,
    "height": 512,
    "style": "realistic",
    "format": "png"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "queued",
    "status_url": "/transform/status?job_id=uuid"
  }
  ```

### Image to Text
- **Endpoint**: `POST /transform/image-to-text`
- **Description**: Extracts text and descriptions from images
- **Request Body**:
  ```json
  {
    "image_url": "https://example.com/image.jpg",
    "detail_level": "standard",
    "language": "en"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "queued",
    "status_url": "/transform/status?job_id=uuid"
  }
  ```

### Text to Video
- **Endpoint**: `POST /transform/text-to-video`
- **Description**: Creates video content from text scripts
- **Request Body**:
  ```json
  {
    "script": "Detailed script for the video",
    "duration": 30,
    "style": "standard",
    "resolution": "720p",
    "format": "mp4"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "queued",
    "status_url": "/transform/status?job_id=uuid"
  }
  ```

### Check Job Status
- **Endpoint**: `GET /transform/status?job_id=uuid`
- **Description**: Checks the status of a transformation job
- **Query Parameters**:
  - `job_id`: The ID of the job to check
- **Response (in progress)**:
  ```json
  {
    "job_id": "uuid",
    "type": "text-to-speech",
    "status": "processing",
    "created_at": "2025-04-07T12:00:00Z"
  }
  ```
- **Response (completed)**:
  ```json
  {
    "job_id": "uuid",
    "type": "text-to-speech",
    "status": "completed",
    "created_at": "2025-04-07T12:00:00Z",
    "result_url": "https://bucket-name.s3.amazonaws.com/jobs/uuid/result.mp3"
  }
  ```
- **Response (failed)**:
  ```json
  {
    "job_id": "uuid",
    "type": "text-to-speech",
    "status": "failed",
    "created_at": "2025-04-07T12:00:00Z",
    "error": "Error message"
  }
  ```

## Architecture

The Content Transformation API follows a microservice architecture pattern optimized for AWS deployment:

1. **API Gateway**: Routes client requests to Lambda functions
2. **Lambda Function**: Validates requests and places transformation jobs in SQS queue
3. **SQS Queue**: Decouples request handling from processing
4. **ECS Tasks**: Container-based workers that perform resource-intensive transformations
5. **S3 Storage**: Stores input and output files

## Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- S3 bucket for deployment artifacts
- Docker installed (for building container images)

### Deployment Steps

1. **Build and push the transformer container image**:
   ```bash
   # Build the image
   docker build -t content-transformation .
   
   # Tag the image
   docker tag content-transformation:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/content-transformation:latest
   
   # Login to ECR
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
   
   # Push the image
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/content-transformation:latest
   ```

2. **Package the Lambda function**:
   ```bash
   # Create a deployment package
   cd src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://${DEPLOYMENT_BUCKET}/${ENVIRONMENT}/content-transformation-api/lambda.zip
   ```

3. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name content-transformation-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

4. **Get the API endpoint**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name content-transformation-api-${ENVIRONMENT} \
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
# Submit a text-to-speech job
curl -X POST \
  ${API_ENDPOINT}/transform/text-to-speech \
  -H 'Content-Type: application/json' \
  -d '{"text": "Hello world", "voice": "default"}'

# Check job status
curl -X GET \
  "${API_ENDPOINT}/transform/status?job_id=${JOB_ID}"
```

## Monitoring

The API includes the following monitoring capabilities:

1. **CloudWatch Logs**: All Lambda and ECS logs are sent to CloudWatch
2. **CloudWatch Metrics**: Custom metrics for job processing time and success rates
3. **CloudWatch Alarms**: Alerts for queue depth and error rates
4. **X-Ray Tracing**: Distributed tracing for request flows

## Security

The API implements the following security measures:

1. **IAM Roles**: Least privilege access for all services
2. **S3 Bucket Policies**: Restricted access to storage
3. **SQS Access Policies**: Limited queue access
4. **API Gateway Throttling**: Rate limiting to prevent abuse

## Scaling

The API scales automatically based on load:

1. **Lambda Concurrency**: Automatic scaling for request handling
2. **ECS Auto Scaling**: Task count adjusts based on queue depth
3. **SQS Queue**: Buffers requests during traffic spikes

## Future Enhancements

Potential enhancements for future versions:

1. **Authentication**: Add JWT-based authentication
2. **Caching**: Implement result caching for common transformations
3. **Batch Processing**: Support for batch transformation jobs
4. **Custom Models**: Allow users to upload custom transformation models
5. **Real-time Transformations**: WebSocket support for real-time transformations
