# Synthetic Data Generation API

## Overview

The Synthetic Data Generation API is a microservice that enables the creation of realistic synthetic data for testing, development, and machine learning purposes. It provides capabilities for generating tabular data, time series data, and text data, as well as data anonymization.

## API Endpoints

### Create Schema
- **Endpoint**: `POST /data/create-schema`
- **Description**: Creates a reusable schema for tabular data generation
- **Request Body**:
  ```json
  {
    "name": "Customer Data Schema",
    "type": "tabular",
    "fields": [
      {
        "name": "customer_id",
        "type": "id",
        "prefix": "CUST",
        "length": 8
      },
      {
        "name": "age",
        "type": "integer",
        "min": 18,
        "max": 85
      },
      {
        "name": "income",
        "type": "float",
        "min": 20000,
        "max": 200000,
        "precision": 2
      },
      {
        "name": "is_active",
        "type": "boolean",
        "probability": 0.8
      },
      {
        "name": "customer_segment",
        "type": "categorical",
        "categories": ["Premium", "Standard", "Basic"],
        "weights": [0.2, 0.5, 0.3]
      },
      {
        "name": "registration_date",
        "type": "date",
        "start_date": "2020-01-01",
        "end_date": "2025-12-31"
      },
      {
        "name": "full_name",
        "type": "name",
        "full_name": true
      },
      {
        "name": "email",
        "type": "email"
      },
      {
        "name": "phone",
        "type": "phone",
        "format": "###-###-####"
      },
      {
        "name": "address",
        "type": "address"
      }
    ],
    "metadata": {
      "description": "Schema for generating synthetic customer data",
      "version": "1.0",
      "owner": "marketing"
    }
  }
  ```
- **Response**:
  ```json
  {
    "schema_id": "uuid",
    "name": "Customer Data Schema",
    "type": "tabular",
    "created_at": "2025-04-07T12:00:00Z"
  }
  ```

### Generate Tabular Data
- **Endpoint**: `POST /data/generate-tabular`
- **Description**: Generates tabular data based on a schema
- **Request Body**:
  ```json
  {
    "rows": 1000,
    "schema_id": "uuid",
    "format": "csv",
    "include_header": true,
    "seed": 42,
    "metadata": {
      "description": "Synthetic customer data for testing",
      "project": "Marketing Analytics"
    }
  }
  ```
  OR
  ```json
  {
    "rows": 1000,
    "schema": {
      "fields": [
        {
          "name": "customer_id",
          "type": "id",
          "prefix": "CUST",
          "length": 8
        },
        {
          "name": "age",
          "type": "integer",
          "min": 18,
          "max": 85
        }
      ]
    },
    "format": "csv",
    "include_header": true,
    "seed": 42
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "submitted",
    "type": "tabular"
  }
  ```

### Generate Time Series Data
- **Endpoint**: `POST /data/generate-time-series`
- **Description**: Generates time series data
- **Request Body**:
  ```json
  {
    "points": 1000,
    "start_date": "2025-01-01T00:00:00Z",
    "frequency": "hourly",
    "fields": [
      {
        "name": "temperature",
        "type": "sine_wave",
        "amplitude": 10,
        "period": 24,
        "phase": 0,
        "noise": 2
      },
      {
        "name": "humidity",
        "type": "random_walk",
        "start_value": 50,
        "step_size": 3
      },
      {
        "name": "pressure",
        "type": "trend",
        "start_value": 1000,
        "end_value": 1030,
        "noise": 5
      },
      {
        "name": "sales",
        "type": "seasonal",
        "base_value": 100,
        "trend": 0.1,
        "amplitude": 30,
        "period": 168,
        "noise": 10
      }
    ],
    "format": "csv",
    "seed": 42
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "submitted",
    "type": "time-series"
  }
  ```

### Generate Text Data
- **Endpoint**: `POST /data/generate-text`
- **Description**: Generates text data based on templates
- **Request Body**:
  ```json
  {
    "template": "Hello, my name is {name} and I am a {occupation} from {location}.",
    "count": 100,
    "variables": {
      "name": ["John", "Jane", "Michael", "Emily", "David", "Sarah"],
      "occupation": ["doctor", "engineer", "teacher", "artist", "scientist"],
      "location": ["New York", "London", "Tokyo", "Paris", "Sydney"]
    },
    "format": "txt",
    "seed": 42
  }
  ```
  OR
  ```json
  {
    "templates": [
      "Hello, my name is {name} and I am a {occupation} from {location}.",
      "I'm {name}, working as a {occupation} in {location}.",
      "{name} here, {occupation} based in {location}."
    ],
    "count": 100,
    "variables": {
      "name": ["John", "Jane", "Michael", "Emily", "David", "Sarah"],
      "occupation": ["doctor", "engineer", "teacher", "artist", "scientist"],
      "location": ["New York", "London", "Tokyo", "Paris", "Sydney"]
    },
    "format": "json",
    "seed": 42
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "submitted",
    "type": "text"
  }
  ```

### Anonymize Data
- **Endpoint**: `POST /data/anonymize`
- **Description**: Anonymizes sensitive data in an existing dataset
- **Request Body**:
  ```json
  {
    "dataset_id": "uuid",
    "fields_to_anonymize": ["name", "email", "phone", "address", "ssn"],
    "anonymization_method": "mask",
    "format": "csv"
  }
  ```
  OR
  ```json
  {
    "source_location": "s3://bucket-name/path/to/data.csv",
    "fields_to_anonymize": ["name", "email", "phone", "address", "ssn"],
    "anonymization_method": "hash",
    "format": "csv"
  }
  ```
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "status": "submitted",
    "type": "anonymize"
  }
  ```

### Get Dataset
- **Endpoint**: `GET /data/datasets/{dataset_id}`
- **Description**: Retrieves dataset details and download URL
- **Path Parameters**:
  - `dataset_id`: ID of the dataset to retrieve
- **Response**:
  ```json
  {
    "dataset_id": "uuid",
    "name": "Synthetic Customer Data",
    "type": "tabular",
    "created_at": "2025-04-07T12:00:00Z",
    "status": "available",
    "rows": 1000,
    "schema_id": "uuid",
    "storage_location": "s3://bucket-name/data/uuid/output.csv",
    "download_url": "https://presigned-url.example.com",
    "format": "csv",
    "metadata": {
      "description": "Synthetic customer data for testing",
      "project": "Marketing Analytics"
    }
  }
  ```

### Get Job
- **Endpoint**: `GET /data/jobs/{job_id}`
- **Description**: Retrieves job status and details
- **Path Parameters**:
  - `job_id`: ID of the job to retrieve
- **Response**:
  ```json
  {
    "job_id": "uuid",
    "type": "tabular",
    "status": "completed",
    "created_at": "2025-04-07T12:00:00Z",
    "updated_at": "2025-04-07T12:05:00Z",
    "completed_at": "2025-04-07T12:05:00Z",
    "parameters": {
      "rows": 1000,
      "schema_id": "uuid",
      "format": "csv"
    },
    "output_location": "s3://bucket-name/data/uuid/output.csv",
    "download_url": "https://presigned-url.example.com",
    "dataset_id": "uuid"
  }
  ```

### List Datasets
- **Endpoint**: `GET /data/datasets?type=tabular&include_schemas=false`
- **Description**: Lists available datasets with optional filtering
- **Query Parameters**:
  - `type` (optional): Filter by data type (tabular, time-series, text)
  - `include_schemas` (optional): Whether to include schemas in results
- **Response**:
  ```json
  {
    "datasets": [
      {
        "dataset_id": "uuid1",
        "name": "Synthetic Customer Data",
        "type": "tabular",
        "created_at": "2025-04-07T12:00:00Z",
        "status": "available",
        "rows": 1000
      },
      {
        "dataset_id": "uuid2",
        "name": "Synthetic Sales Data",
        "type": "tabular",
        "created_at": "2025-04-06T10:00:00Z",
        "status": "available",
        "rows": 5000
      }
    ],
    "count": 2
  }
  ```

### List Jobs
- **Endpoint**: `GET /data/jobs?type=tabular&status=completed`
- **Description**: Lists jobs with optional filtering
- **Query Parameters**:
  - `type` (optional): Filter by job type (tabular, time-series, text, anonymize)
  - `status` (optional): Filter by job status (submitted, processing, completed, failed)
- **Response**:
  ```json
  {
    "jobs": [
      {
        "job_id": "uuid1",
        "type": "tabular",
        "status": "completed",
        "created_at": "2025-04-07T12:00:00Z",
        "completed_at": "2025-04-07T12:05:00Z"
      },
      {
        "job_id": "uuid2",
        "type": "tabular",
        "status": "completed",
        "created_at": "2025-04-06T10:00:00Z",
        "completed_at": "2025-04-06T10:03:00Z"
      }
    ],
    "count": 2
  }
  ```

## Data Generation Capabilities

### Tabular Data Types

The API supports the following field types for tabular data:

| Type | Description | Parameters |
|------|-------------|------------|
| `integer` | Integer values | `min`, `max` |
| `float` | Floating-point values | `min`, `max`, `precision` |
| `boolean` | Boolean values | `probability` |
| `categorical` | Values from a predefined set | `categories`, `weights` |
| `date` | Date values | `start_date`, `end_date` |
| `name` | Person names | `full_name` |
| `email` | Email addresses | - |
| `phone` | Phone numbers | `format` |
| `address` | Physical addresses | - |
| `id` | Identifiers | `prefix`, `length` |
| `string` | Generic string values | `options` |

### Time Series Data Types

The API supports the following field types for time series data:

| Type | Description | Parameters |
|------|-------------|------------|
| `random_walk` | Random walk process | `start_value`, `step_size` |
| `sine_wave` | Sinusoidal pattern | `amplitude`, `period`, `phase`, `noise` |
| `trend` | Linear trend with noise | `start_value`, `end_value`, `noise` |
| `seasonal` | Seasonal pattern with trend | `base_value`, `trend`, `amplitude`, `period`, `noise` |

### Text Data Generation

The API supports template-based text generation with variable substitution. Multiple templates can be provided for variety, and variables can be defined with lists of possible values.

### Anonymization Methods

The API supports the following anonymization methods:

| Method | Description |
|--------|-------------|
| `mask` | Replaces characters with asterisks or X's |
| `hash` | Replaces values with hash codes |
| `redact` | Completely removes the values |
| `pseudonymize` | Replaces values with consistent alternatives |

## Architecture

The Synthetic Data Generation API follows a microservice architecture pattern optimized for AWS deployment:

1. **API Gateway**: Routes client requests to Lambda functions
2. **Lambda Function**: Handles business logic for data generation
3. **DynamoDB**: Stores dataset metadata and job information
4. **S3 Storage**: Stores generated datasets
5. **AWS Batch**: Processes large data generation jobs

## Data Model

### Datasets Table
- **Primary Key**: `dataset_id` (String)
- **Attributes**:
  - `name` (String): Dataset name
  - `type` (String): Dataset type (tabular, time-series, text)
  - `created_at` (String): ISO 8601 timestamp
  - `updated_at` (String): ISO 8601 timestamp
  - `status` (String): Dataset status (available, generating, failed)
  - `storage_location` (String): S3 location of the dataset
  - `format` (String): File format (csv, json, txt)
  - `is_schema` (Boolean): Whether this record is a schema
  - `schema_id` (String): Associated schema ID (for tabular datasets)
  - `job_id` (String): Job that created this dataset
  - `rows` (Number): Number of rows (for tabular datasets)
  - `points` (Number): Number of points (for time series datasets)
  - `count` (Number): Number of texts (for text datasets)
  - `metadata` (Map): Additional dataset metadata
  - `ttl` (Number): Time-to-live for data expiration

### Jobs Table
- **Primary Key**: `job_id` (String)
- **Attributes**:
  - `type` (String): Job type (tabular, time-series, text, anonymize)
  - `status` (String): Job status (submitted, processing, completed, failed)
  - `created_at` (String): ISO 8601 timestamp
  - `updated_at` (String): ISO 8601 timestamp
  - `completed_at` (String): ISO 8601 timestamp
  - `parameters` (Map): Job parameters
  - `output_location` (String): S3 location of the output
  - `dataset_id` (String): ID of the generated dataset
  - `batch_job_id` (String): AWS Batch job ID
  - `error` (String): Error message if job failed
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
   docker build -t synthetic-data .
   
   # Tag the image
   docker tag synthetic-data:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
   
   # Login to ECR
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
   
   # Push the image
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
   ```

2. **Package the Lambda function**:
   ```bash
   # Create a deployment package
   cd src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://${DEPLOYMENT_BUCKET}/${ENVIRONMENT}/synthetic-data-api/lambda.zip
   ```

3. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name synthetic-data-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

4. **Get the API endpoint**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name synthetic-data-api-${ENVIRONMENT} \
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
# Create a schema
curl -X POST \
  ${API_ENDPOINT}/data/create-schema \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Schema",
    "type": "tabular",
    "fields": [
      {
        "name": "id",
        "type": "id",
        "prefix": "TST",
        "length": 6
      },
      {
        "name": "value",
        "type": "integer",
        "min": 1,
        "max": 100
      }
    ]
  }'

# Generate tabular data
curl -X POST \
  ${API_ENDPOINT}/data/generate-tabular \
  -H 'Content-Type: application/json' \
  -d '{
    "rows": 100,
    "schema_id": "${SCHEMA_ID}",
    "format": "csv"
  }'

# Check job status
curl -X GET \
  "${API_ENDPOINT}/data/jobs/${JOB_ID}"
```

## Monitoring

The API includes the following monitoring capabilities:

1. **CloudWatch Logs**: All Lambda logs are sent to CloudWatch
2. **CloudWatch Metrics**: Custom metrics for API calls and data generation
3. **CloudWatch Alarms**: Alerts for error rates and job failures
4. **X-Ray Tracing**: Distributed tracing for request flows

## Security

The API implements the following security measures:

1. **IAM Roles**: Least privilege access for all services
2. **S3 Bucket Policies**: Restricted access to generated data
3. **DynamoDB Encryption**: Server-side encryption for all tables
4. **API Gateway Throttling**: Rate limiting to prevent abuse

## Scaling

The API scales automatically based on load:

1. **Lambda Concurrency**: Automatic scaling for request handling
2. **DynamoDB On-Demand**: Pay-per-request billing mode for automatic scaling
3. **Batch Compute Environment**: Auto-scaling for large data generation jobs
4. **S3 Performance**: High throughput for data storage and retrieval

## Future Enhancements

Potential enhancements for future versions:

1. **Advanced Data Types**: Support for more complex data types like geospatial and hierarchical data
2. **ML-Based Generation**: Use machine learning models for more realistic data generation
3. **Data Relationships**: Support for generating related datasets with referential integrity
4. **Custom Distributions**: Support for custom probability distributions
5. **Data Quality Metrics**: Provide metrics on the quality and realism of generated data
