# AWS Microservices Deployment Guide

This comprehensive guide provides instructions for deploying the five API microservices to AWS. Each microservice is designed to be deployed independently, but they can also work together as part of a larger AI SaaS platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Overview](#deployment-overview)
3. [Individual Microservice Deployment](#individual-microservice-deployment)
   - [Content Transformation API](#content-transformation-api)
   - [AI Meeting Assistant API](#ai-meeting-assistant-api)
   - [AI Voice Generation API](#ai-voice-generation-api)
   - [Customer Journey Optimization API](#customer-journey-optimization-api)
   - [Synthetic Data Generation API](#synthetic-data-generation-api)
4. [Integrated Deployment](#integrated-deployment)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Security Best Practices](#security-best-practices)
8. [Cost Optimization](#cost-optimization)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying any of the microservices, ensure you have the following:

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with appropriate credentials
   ```bash
   aws configure
   ```
3. **AWS SAM CLI**: For local testing (optional)
   ```bash
   pip install aws-sam-cli
   ```
4. **Docker**: For building container images
   ```bash
   # Verify installation
   docker --version
   ```
5. **Python 3.9+**: For local development and testing
   ```bash
   # Verify installation
   python3 --version
   ```
6. **Node.js 14+**: For some deployment scripts
   ```bash
   # Verify installation
   node --version
   ```
7. **jq**: For JSON processing in scripts
   ```bash
   # Install on Ubuntu
   apt-get install jq
   ```

## Deployment Overview

Each microservice follows a similar deployment pattern:

1. **Infrastructure as Code**: CloudFormation templates define all required AWS resources
2. **Lambda Deployment**: Python code packaged and deployed to AWS Lambda
3. **Container Deployment**: Docker images built and pushed to Amazon ECR for batch processing
4. **Database Setup**: DynamoDB tables created with appropriate indexes
5. **API Gateway Configuration**: REST APIs configured with appropriate endpoints
6. **Storage Configuration**: S3 buckets created for data storage
7. **IAM Setup**: Roles and policies configured for secure access

The deployment process can be executed manually or automated through CI/CD pipelines.

## Individual Microservice Deployment

### Content Transformation API

The Content Transformation API enables conversion between different content formats (text, image, audio, video) while preserving context.

#### Deployment Steps

1. **Create S3 buckets**:
   ```bash
   # Create deployment bucket
   aws s3 mb s3://content-transformation-deployment-${AWS_ACCOUNT_ID}
   
   # Create storage bucket
   aws s3 mb s3://content-transformation-storage-${AWS_ACCOUNT_ID}
   ```

2. **Build and package Lambda function**:
   ```bash
   cd project1/src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://content-transformation-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/content-transformation-api/lambda.zip
   ```

3. **Deploy CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name content-transformation-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

4. **Verify deployment**:
   ```bash
   # Get API endpoint
   aws cloudformation describe-stacks \
     --stack-name content-transformation-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   
   # Test API
   curl -X POST \
     ${API_ENDPOINT}/transform/text-to-audio \
     -H 'Content-Type: application/json' \
     -d '{"text": "Hello world", "voice": "en-US-Neural2-F"}'
   ```

### AI Meeting Assistant API

The AI Meeting Assistant API provides capabilities for joining meetings, taking notes, identifying action items, and following up automatically.

#### Deployment Steps

1. **Create S3 buckets**:
   ```bash
   # Create deployment bucket
   aws s3 mb s3://meeting-assistant-deployment-${AWS_ACCOUNT_ID}
   
   # Create storage bucket
   aws s3 mb s3://meeting-assistant-storage-${AWS_ACCOUNT_ID}
   ```

2. **Build and package Lambda function**:
   ```bash
   cd project2/src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://meeting-assistant-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/meeting-assistant-api/lambda.zip
   ```

3. **Deploy CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name meeting-assistant-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

4. **Verify deployment**:
   ```bash
   # Get API endpoint
   aws cloudformation describe-stacks \
     --stack-name meeting-assistant-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   
   # Test API
   curl -X POST \
     ${API_ENDPOINT}/meeting/schedule \
     -H 'Content-Type: application/json' \
     -d '{
       "title": "Project Planning",
       "start_time": "2025-04-10T10:00:00Z",
       "duration_minutes": 60,
       "participants": ["john@example.com", "jane@example.com"]
     }'
   ```

### AI Voice Generation API

The AI Voice Generation API enables the creation of custom voice profiles and generation of natural-sounding speech.

#### Deployment Steps

1. **Create S3 buckets**:
   ```bash
   # Create deployment bucket
   aws s3 mb s3://voice-generation-deployment-${AWS_ACCOUNT_ID}
   
   # Create storage bucket
   aws s3 mb s3://voice-generation-storage-${AWS_ACCOUNT_ID}
   ```

2. **Build and push container image**:
   ```bash
   # Build the image
   docker build -t voice-generation .
   
   # Create ECR repository
   aws ecr create-repository --repository-name voice-generation
   
   # Tag the image
   docker tag voice-generation:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
   
   # Login to ECR
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
   
   # Push the image
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
   ```

3. **Build and package Lambda function**:
   ```bash
   cd project3/src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://voice-generation-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/voice-generation-api/lambda.zip
   ```

4. **Deploy CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name voice-generation-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

5. **Verify deployment**:
   ```bash
   # Get API endpoint
   aws cloudformation describe-stacks \
     --stack-name voice-generation-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   
   # Test API
   curl -X POST \
     ${API_ENDPOINT}/voice/generate \
     -H 'Content-Type: application/json' \
     -d '{
       "profile_id": "default",
       "text": "Welcome to our AI voice generation service.",
       "voice_style": "professional"
     }'
   ```

### Customer Journey Optimization API

The Customer Journey Optimization API enables tracking, analysis, and optimization of customer journeys across multiple touchpoints.

#### Deployment Steps

1. **Create S3 buckets**:
   ```bash
   # Create deployment bucket
   aws s3 mb s3://customer-journey-deployment-${AWS_ACCOUNT_ID}
   
   # Create analytics bucket
   aws s3 mb s3://customer-journey-analytics-${AWS_ACCOUNT_ID}
   ```

2. **Create Personalize campaign parameter**:
   ```bash
   # Create SSM parameter for Personalize campaign ARN
   aws ssm put-parameter \
     --name /customer-journey/${ENVIRONMENT}/personalize-campaign-arn \
     --type String \
     --value arn:aws:personalize:${AWS_REGION}:${AWS_ACCOUNT_ID}:campaign/customer-journey-campaign
   ```

3. **Build and package Lambda function**:
   ```bash
   cd project4/src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://customer-journey-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/customer-journey-api/lambda.zip
   ```

4. **Deploy CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name customer-journey-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

5. **Verify deployment**:
   ```bash
   # Get API endpoint
   aws cloudformation describe-stacks \
     --stack-name customer-journey-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   
   # Test API
   curl -X POST \
     ${API_ENDPOINT}/journey/track-event \
     -H 'Content-Type: application/json' \
     -d '{
       "user_id": "user123",
       "event_type": "page_view",
       "properties": {
         "page": "homepage"
       }
     }'
   ```

### Synthetic Data Generation API

The Synthetic Data Generation API enables the creation of realistic synthetic data for testing, development, and machine learning purposes.

#### Deployment Steps

1. **Create S3 buckets**:
   ```bash
   # Create deployment bucket
   aws s3 mb s3://synthetic-data-deployment-${AWS_ACCOUNT_ID}
   
   # Create storage bucket
   aws s3 mb s3://synthetic-data-storage-${AWS_ACCOUNT_ID}
   ```

2. **Build and push container image**:
   ```bash
   # Build the image
   docker build -t synthetic-data .
   
   # Create ECR repository
   aws ecr create-repository --repository-name synthetic-data
   
   # Tag the image
   docker tag synthetic-data:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
   
   # Login to ECR
   aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
   
   # Push the image
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
   ```

3. **Build and package Lambda function**:
   ```bash
   cd project5/src
   pip install -r requirements.txt -t .
   zip -r ../lambda.zip .
   cd ..
   
   # Upload to S3
   aws s3 cp lambda.zip s3://synthetic-data-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/synthetic-data-api/lambda.zip
   ```

4. **Deploy CloudFormation stack**:
   ```bash
   aws cloudformation deploy \
     --template-file infrastructure/cloudformation.yaml \
     --stack-name synthetic-data-api-${ENVIRONMENT} \
     --parameter-overrides Environment=${ENVIRONMENT} \
     --capabilities CAPABILITY_IAM
   ```

5. **Verify deployment**:
   ```bash
   # Get API endpoint
   aws cloudformation describe-stacks \
     --stack-name synthetic-data-api-${ENVIRONMENT} \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
     --output text
   
   # Test API
   curl -X POST \
     ${API_ENDPOINT}/data/generate-tabular \
     -H 'Content-Type: application/json' \
     -d '{
       "rows": 100,
       "schema": {
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
       },
       "format": "csv"
     }'
   ```

## Integrated Deployment

For deploying all microservices together, you can use the following master deployment script:

```bash
#!/bin/bash
# Master deployment script for all microservices

# Set environment variables
export AWS_REGION="us-east-1"  # Change as needed
export ENVIRONMENT="dev"        # Change as needed
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# Create deployment buckets
echo "Creating deployment buckets..."
aws s3 mb s3://content-transformation-deployment-${AWS_ACCOUNT_ID}
aws s3 mb s3://meeting-assistant-deployment-${AWS_ACCOUNT_ID}
aws s3 mb s3://voice-generation-deployment-${AWS_ACCOUNT_ID}
aws s3 mb s3://customer-journey-deployment-${AWS_ACCOUNT_ID}
aws s3 mb s3://synthetic-data-deployment-${AWS_ACCOUNT_ID}

# Create storage buckets
echo "Creating storage buckets..."
aws s3 mb s3://content-transformation-storage-${AWS_ACCOUNT_ID}
aws s3 mb s3://meeting-assistant-storage-${AWS_ACCOUNT_ID}
aws s3 mb s3://voice-generation-storage-${AWS_ACCOUNT_ID}
aws s3 mb s3://customer-journey-analytics-${AWS_ACCOUNT_ID}
aws s3 mb s3://synthetic-data-storage-${AWS_ACCOUNT_ID}

# Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name voice-generation || true
aws ecr create-repository --repository-name synthetic-data || true

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build and push container images
echo "Building and pushing container images..."
# Voice Generation API
cd project3
docker build -t voice-generation .
docker tag voice-generation:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/voice-generation:latest
cd ..

# Synthetic Data API
cd project5
docker build -t synthetic-data .
docker tag synthetic-data:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/synthetic-data:latest
cd ..

# Create SSM parameter for Personalize
echo "Creating SSM parameter..."
aws ssm put-parameter \
  --name /customer-journey/${ENVIRONMENT}/personalize-campaign-arn \
  --type String \
  --value arn:aws:personalize:${AWS_REGION}:${AWS_ACCOUNT_ID}:campaign/customer-journey-campaign \
  --overwrite

# Package and deploy each microservice
echo "Packaging and deploying microservices..."

# Content Transformation API
echo "Deploying Content Transformation API..."
cd project1/src
pip install -r requirements.txt -t .
zip -r ../lambda.zip .
cd ..
aws s3 cp lambda.zip s3://content-transformation-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/content-transformation-api/lambda.zip
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name content-transformation-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM
cd ..

# AI Meeting Assistant API
echo "Deploying AI Meeting Assistant API..."
cd project2/src
pip install -r requirements.txt -t .
zip -r ../lambda.zip .
cd ..
aws s3 cp lambda.zip s3://meeting-assistant-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/meeting-assistant-api/lambda.zip
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name meeting-assistant-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM
cd ..

# AI Voice Generation API
echo "Deploying AI Voice Generation API..."
cd project3/src
pip install -r requirements.txt -t .
zip -r ../lambda.zip .
cd ..
aws s3 cp lambda.zip s3://voice-generation-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/voice-generation-api/lambda.zip
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name voice-generation-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM
cd ..

# Customer Journey Optimization API
echo "Deploying Customer Journey Optimization API..."
cd project4/src
pip install -r requirements.txt -t .
zip -r ../lambda.zip .
cd ..
aws s3 cp lambda.zip s3://customer-journey-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/customer-journey-api/lambda.zip
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name customer-journey-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM
cd ..

# Synthetic Data Generation API
echo "Deploying Synthetic Data Generation API..."
cd project5/src
pip install -r requirements.txt -t .
zip -r ../lambda.zip .
cd ..
aws s3 cp lambda.zip s3://synthetic-data-deployment-${AWS_ACCOUNT_ID}/${ENVIRONMENT}/synthetic-data-api/lambda.zip
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name synthetic-data-api-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM
cd ..

# Get API endpoints
echo "Retrieving API endpoints..."
CONTENT_TRANSFORM_API=$(aws cloudformation describe-stacks --stack-name content-transformation-api-${ENVIRONMENT} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
MEETING_ASSISTANT_API=$(aws cloudformation describe-stacks --stack-name meeting-assistant-api-${ENVIRONMENT} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
VOICE_GENERATION_API=$(aws cloudformation describe-stacks --stack-name voice-generation-api-${ENVIRONMENT} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
CUSTOMER_JOURNEY_API=$(aws cloudformation describe-stacks --stack-name customer-journey-api-${ENVIRONMENT} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
SYNTHETIC_DATA_API=$(aws cloudformation describe-stacks --stack-name synthetic-data-api-${ENVIRONMENT} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)

echo "Deployment complete!"
echo "Content Transformation API: ${CONTENT_TRANSFORM_API}"
echo "AI Meeting Assistant API: ${MEETING_ASSISTANT_API}"
echo "AI Voice Generation API: ${VOICE_GENERATION_API}"
echo "Customer Journey Optimization API: ${CUSTOMER_JOURNEY_API}"
echo "Synthetic Data Generation API: ${SYNTHETIC_DATA_API}"
```

Save this script as `deploy-all.sh`, make it executable with `chmod +x deploy-all.sh`, and run it to deploy all microservices.

## CI/CD Pipeline Setup

For automated deployments, you can set up CI/CD pipelines using AWS CodePipeline or GitHub Actions.

### AWS CodePipeline Example

1. **Create a CodePipeline for each microservice**:
   ```bash
   aws codepipeline create-pipeline \
     --pipeline-name content-transformation-pipeline \
     --pipeline-definition file://pipeline-definition.json \
     --role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/CodePipelineServiceRole
   ```

2. **Sample pipeline definition (pipeline-definition.json)**:
   ```json
   {
     "pipeline": {
       "name": "content-transformation-pipeline",
       "roleArn": "arn:aws:iam::ACCOUNT_ID:role/CodePipelineServiceRole",
       "artifactStore": {
         "type": "S3",
         "location": "content-transformation-deployment-ACCOUNT_ID"
       },
       "stages": [
         {
           "name": "Source",
           "actions": [
             {
               "name": "Source",
               "actionTypeId": {
                 "category": "Source",
                 "owner": "AWS",
                 "provider": "CodeStarSourceConnection",
                 "version": "1"
               },
               "configuration": {
                 "ConnectionArn": "arn:aws:codestar-connections:REGION:ACCOUNT_ID:connection/CONNECTION_ID",
                 "FullRepositoryId": "owner/repo",
                 "BranchName": "main"
               },
               "outputArtifacts": [
                 {
                   "name": "SourceCode"
                 }
               ]
             }
           ]
         },
         {
           "name": "Build",
           "actions": [
             {
               "name": "BuildAndPackage",
               "actionTypeId": {
                 "category": "Build",
                 "owner": "AWS",
                 "provider": "CodeBuild",
                 "version": "1"
               },
               "configuration": {
                 "ProjectName": "content-transformation-build"
               },
               "inputArtifacts": [
                 {
                   "name": "SourceCode"
                 }
               ],
               "outputArtifacts": [
                 {
                   "name": "BuildOutput"
                 }
               ]
             }
           ]
         },
         {
           "name": "Deploy",
           "actions": [
             {
               "name": "DeployToCloudFormation",
               "actionTypeId": {
                 "category": "Deploy",
                 "owner": "AWS",
                 "provider": "CloudFormation",
                 "version": "1"
               },
               "configuration": {
                 "ActionMode": "CREATE_UPDATE",
                 "StackName": "content-transformation-api-dev",
                 "Capabilities": "CAPABILITY_IAM",
                 "TemplatePath": "BuildOutput::infrastructure/cloudformation.yaml",
                 "ParameterOverrides": "{\"Environment\": \"dev\"}"
               },
               "inputArtifacts": [
                 {
                   "name": "BuildOutput"
                 }
               ]
             }
           ]
         }
       ]
     }
   }
   ```

### GitHub Actions Example

Create a `.github/workflows/deploy.yml` file in each microservice repository:

```yaml
name: Deploy Microservice

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r src/requirements.txt
    
    - name: Package Lambda function
      run: |
        cd src
        pip install -r requirements.txt -t .
        zip -r ../lambda.zip .
        cd ..
    
    - name: Upload to S3
      run: |
        aws s3 cp lambda.zip s3://content-transformation-deployment-${{ secrets.AWS_ACCOUNT_ID }}/dev/content-transformation-api/lambda.zip
    
    - name: Deploy CloudFormation stack
      run: |
        aws cloudformation deploy \
          --template-file infrastructure/cloudformation.yaml \
          --stack-name content-transformation-api-dev \
          --parameter-overrides Environment=dev \
          --capabilities CAPABILITY_IAM
```

## Monitoring and Logging

### CloudWatch Dashboards

Create a CloudWatch dashboard for each microservice:

```bash
aws cloudwatch put-dashboard \
  --dashboard-name content-transformation-dashboard \
  --dashboard-body file://dashboard.json
```

Sample dashboard.json:
```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/Lambda", "Invocations", "FunctionName", "content-transformation-api-dev" ],
          [ ".", "Errors", ".", "." ],
          [ ".", "Duration", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "period": 300,
        "stat": "Sum"
      }
    },
    {
      "type": "log",
      "x": 0,
      "y": 6,
      "width": 24,
      "height": 6,
      "properties": {
        "query": "SOURCE '/aws/lambda/content-transformation-api-dev' | fields @timestamp, @message\n| sort @timestamp desc\n| limit 20",
        "region": "us-east-1",
        "stacked": false,
        "view": "table"
      }
    }
  ]
}
```

### CloudWatch Alarms

Set up alarms for critical metrics:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name content-transformation-errors \
  --alarm-description "Alarm when error count exceeds threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 60 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=content-transformation-api-dev \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:${AWS_ACCOUNT_ID}:alerts
```

## Security Best Practices

1. **IAM Roles**: Use least privilege principle for all service roles
2. **API Authentication**: Implement API Gateway authorizers
   ```bash
   aws apigateway create-authorizer \
     --rest-api-id API_ID \
     --name cognito-authorizer \
     --type COGNITO_USER_POOLS \
     --provider-arns arn:aws:cognito-idp:REGION:ACCOUNT_ID:userpool/USER_POOL_ID \
     --identity-source method.request.header.Authorization
   ```

3. **Encryption**: Enable encryption for all data at rest and in transit
   ```bash
   # Enable S3 bucket encryption
   aws s3api put-bucket-encryption \
     --bucket content-transformation-storage-${AWS_ACCOUNT_ID} \
     --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
   
   # Enable DynamoDB encryption
   aws dynamodb update-table \
     --table-name content-transformation-jobs-dev \
     --sse-specification Enabled=true
   ```

4. **VPC Configuration**: Deploy sensitive services within a VPC
   ```bash
   # Update Lambda function to use VPC
   aws lambda update-function-configuration \
     --function-name content-transformation-api-dev \
     --vpc-config SubnetIds=subnet-12345,subnet-67890,SecurityGroupIds=sg-12345
   ```

5. **WAF Integration**: Set up AWS WAF for API Gateway
   ```bash
   # Create WAF web ACL
   aws wafv2 create-web-acl \
     --name api-protection \
     --scope REGIONAL \
     --default-action Allow={} \
     --rules file://waf-rules.json \
     --region us-east-1
   
   # Associate with API Gateway
   aws wafv2 associate-web-acl \
     --web-acl-arn arn:aws:wafv2:us-east-1:${AWS_ACCOUNT_ID}:regional/webacl/api-protection/12345 \
     --resource-arn arn:aws:apigateway:us-east-1::/restapis/API_ID/stages/dev
   ```

## Cost Optimization

1. **Lambda Provisioned Concurrency**: For predictable workloads
   ```bash
   aws lambda put-provisioned-concurrency-config \
     --function-name content-transformation-api-dev \
     --qualifier ALIAS_OR_VERSION \
     --provisioned-concurrent-executions 10
   ```

2. **DynamoDB Auto Scaling**: For variable workloads
   ```bash
   aws application-autoscaling register-scalable-target \
     --service-namespace dynamodb \
     --resource-id table/content-transformation-jobs-dev \
     --scalable-dimension dynamodb:table:WriteCapacityUnits \
     --min-capacity 5 \
     --max-capacity 100
   
   aws application-autoscaling put-scaling-policy \
     --service-namespace dynamodb \
     --resource-id table/content-transformation-jobs-dev \
     --scalable-dimension dynamodb:table:WriteCapacityUnits \
     --policy-name WriteAutoScalingPolicy \
     --policy-type TargetTrackingScaling \
     --target-tracking-scaling-policy-configuration file://scaling-policy.json
   ```

3. **S3 Lifecycle Policies**: For cost-effective storage
   ```bash
   aws s3api put-bucket-lifecycle-configuration \
     --bucket content-transformation-storage-${AWS_ACCOUNT_ID} \
     --lifecycle-configuration file://lifecycle-policy.json
   ```

## Troubleshooting

### Common Issues and Solutions

1. **CloudFormation Deployment Failures**:
   - Check CloudFormation events: `aws cloudformation describe-stack-events --stack-name STACK_NAME`
   - Validate template: `aws cloudformation validate-template --template-body file://template.yaml`

2. **Lambda Function Errors**:
   - Check CloudWatch Logs: `aws logs get-log-events --log-group-name /aws/lambda/FUNCTION_NAME --log-stream-name STREAM_NAME`
   - Test function locally: `aws lambda invoke --function-name FUNCTION_NAME --payload '{}' output.json`

3. **API Gateway Issues**:
   - Test API directly: `aws apigateway test-invoke-method --rest-api-id API_ID --resource-id RESOURCE_ID --http-method POST --path-with-query-string '' --body '{}'`
   - Check API Gateway logs: Enable execution logging in API Gateway console

4. **Permission Issues**:
   - Check IAM policies: `aws iam get-policy --policy-arn POLICY_ARN`
   - Verify role permissions: `aws iam get-role --role-name ROLE_NAME`

5. **Container Issues**:
   - Check ECR repository: `aws ecr describe-images --repository-name REPO_NAME`
   - Verify Batch job status: `aws batch describe-jobs --jobs JOB_ID`
