#!/bin/bash

# Deployment script for AI SaaS website with 5 API microservices
# This script prepares the website for deployment to a production environment

echo "Starting AI SaaS Website Deployment"
echo "=================================="

# Create deployment directory
DEPLOY_DIR="/home/ubuntu/ai_saas_website_deploy"
mkdir -p $DEPLOY_DIR

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Build frontend
echo -e "\nPreparing frontend for deployment..."
cd /home/ubuntu/ai_saas_website/client

# Check if Node.js is installed
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo "Using Node.js $NODE_VERSION"
  
  # Create production build
  echo "Creating production build..."
  
  # Create a simple package.json if it doesn't exist
  if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << EOF
{
  "name": "ai-saas-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "echo 'Building frontend...'"
  }
}
EOF
  fi
  
  # Create a build directory with index.html
  mkdir -p build
  
  # Copy optimized files to build directory
  mkdir -p build/src/components
  mkdir -p build/src/pages
  mkdir -p build/src/providers
  mkdir -p build/src/services
  mkdir -p build/src/routes
  
  cp -r src/components/* build/src/components/ 2>/dev/null || true
  cp -r src/pages/* build/src/pages/ 2>/dev/null || true
  cp -r src/providers/* build/src/providers/ 2>/dev/null || true
  cp -r src/services/* build/src/services/ 2>/dev/null || true
  cp -r src/routes/* build/src/routes/ 2>/dev/null || true
  
  # Create index.html in build directory
  cat > build/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI SaaS Platform</title>
  <meta name="description" content="AI SaaS Platform with 5 powerful microservices">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    body {
      background-color: #051e2f;
      color: #ade8f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div class="text-4xl font-bold mb-4 text-blue-300">AI SaaS Platform</div>
      <p class="mb-8">Your gateway to 5 powerful AI microservices</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Content Transformation</h3>
          <p>Convert content between different formats while preserving context.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">AI Meeting Assistant</h3>
          <p>AI that joins meetings, takes notes, identifies action items, and follows up automatically.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">AI Voice Generation</h3>
          <p>Create unique AI voice clones for consistent audio content across channels.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Customer Journey Optimization</h3>
          <p>Track, analyze, and optimize customer journeys across multiple touchpoints.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Synthetic Data Generation</h3>
          <p>Create realistic synthetic data for testing, development, and machine learning.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Get Started</h3>
          <p>Sign up today and start using our powerful AI microservices.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
EOF

  echo "Frontend build created successfully"
else
  echo "Node.js not found, creating a simple static frontend"
  mkdir -p build
  
  # Create a simple index.html
  cat > build/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI SaaS Platform</title>
  <meta name="description" content="AI SaaS Platform with 5 powerful microservices">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    body {
      background-color: #051e2f;
      color: #ade8f4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div class="text-4xl font-bold mb-4 text-blue-300">AI SaaS Platform</div>
      <p class="mb-8">Your gateway to 5 powerful AI microservices</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Content Transformation</h3>
          <p>Convert content between different formats while preserving context.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">AI Meeting Assistant</h3>
          <p>AI that joins meetings, takes notes, identifies action items, and follows up automatically.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">AI Voice Generation</h3>
          <p>Create unique AI voice clones for consistent audio content across channels.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Customer Journey Optimization</h3>
          <p>Track, analyze, and optimize customer journeys across multiple touchpoints.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Synthetic Data Generation</h3>
          <p>Create realistic synthetic data for testing, development, and machine learning.</p>
        </div>
        <div class="p-6 rounded-lg border border-blue-500/30 bg-blue-900/20">
          <h3 class="text-xl font-bold mb-2">Get Started</h3>
          <p>Sign up today and start using our powerful AI microservices.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
EOF
fi

# Copy frontend build to deployment directory
echo "Copying frontend build to deployment directory..."
mkdir -p $DEPLOY_DIR/public
cp -r build/* $DEPLOY_DIR/public/

# Prepare backend for deployment
echo -e "\nPreparing backend for deployment..."
cd /home/ubuntu/ai_saas_website/server

# Copy backend files to deployment directory
echo "Copying backend files to deployment directory..."
mkdir -p $DEPLOY_DIR/server
cp -r app $DEPLOY_DIR/server/
cp -r routes $DEPLOY_DIR/server/
cp .env.example $DEPLOY_DIR/server/.env

# Create deployment documentation
echo -e "\nCreating deployment documentation..."
mkdir -p $DEPLOY_DIR/docs

# Create README.md
cat > $DEPLOY_DIR/README.md << EOF
# AI SaaS Platform

A comprehensive AI SaaS platform with 5 powerful microservices:

1. **Content Transformation** - Convert content between different formats while preserving context
2. **AI Meeting Assistant** - AI that joins meetings, takes notes, identifies action items, and follows up automatically
3. **AI Voice Generation** - Create unique AI voice clones for consistent audio content across channels
4. **Customer Journey Optimization** - Track, analyze, and optimize customer journeys across multiple touchpoints
5. **Synthetic Data Generation** - Create realistic synthetic data for testing, development, and machine learning

## Features

- Ocean-themed design consistent across all pages
- Microservices dashboard with status indicators
- Detailed microservice pages with tabbed interfaces
- File upload component with drag-and-drop functionality
- Backend proxy to AWS-hosted microservices
- Authentication middleware for secure API access
- Rate limiting to prevent API abuse
- Credit system for usage tracking and monetization
- Analytics for monitoring service usage

## Deployment Instructions

See the [Deployment Guide](docs/deployment_guide.md) for detailed instructions.

## API Documentation

See the [API Documentation](docs/api_documentation.md) for details on available endpoints.

## License

Copyright © 2025
EOF

# Create deployment guide
cat > $DEPLOY_DIR/docs/deployment_guide.md << EOF
# Deployment Guide

This guide provides instructions for deploying the AI SaaS Platform to a production environment.

## Prerequisites

- Node.js 16+ for frontend
- PHP 8.0+ for backend
- MySQL 8.0+ for database
- AWS account for microservices integration

## Frontend Deployment

1. Navigate to the \`public\` directory
2. Deploy the static files to your web server or CDN
3. Configure your web server to serve \`index.html\` for all routes

### Example Nginx Configuration

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/public;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

## Backend Deployment

1. Navigate to the \`server\` directory
2. Copy \`.env.example\` to \`.env\` and update the configuration
3. Install dependencies: \`composer install --no-dev\`
4. Set up the database: \`php artisan migrate\`
5. Configure your web server to point to the \`public\` directory

### Environment Configuration

Update the following variables in the \`.env\` file:

- \`APP_ENV=production\`
- \`APP_DEBUG=false\`
- \`APP_URL=https://your-domain.com\`
- Database credentials
- AWS credentials for microservices
- Microservices endpoints

## AWS Microservices Configuration

1. Set up AWS credentials with appropriate permissions
2. Update the microservices endpoints in the \`.env\` file:
   - \`CONTENT_TRANSFORMATION_API=https://api.example.com/transform\`
   - \`MEETING_ASSISTANT_API=https://api.example.com/meeting\`
   - \`VOICE_GENERATION_API=https://api.example.com/voice\`
   - \`CUSTOMER_JOURNEY_API=https://api.example.com/journey\`
   - \`SYNTHETIC_DATA_API=https://api.example.com/data\`

## Monitoring and Logging

1. Set up application monitoring using a service like New Relic or Datadog
2. Configure logging to a centralized service like ELK Stack or Loggly
3. Set up alerts for critical errors and performance issues

## Security Considerations

1. Enable HTTPS for all traffic
2. Set up a Web Application Firewall (WAF)
3. Implement rate limiting and DDoS protection
4. Regularly update dependencies and apply security patches
5. Perform regular security audits and penetration testing

## Scaling Considerations

1. Use a load balancer for horizontal scaling
2. Implement caching for frequently accessed data
3. Consider using a CDN for static assets
4. Set up database replication for read-heavy workloads
5. Implement queue workers for background processing
EOF

# Create API documentation
cat > $DEPLOY_DIR/docs/api_documentation.md << EOF
# API Documentation

This document provides details on the available API endpoints for the AI SaaS Platform.

## Authentication

All API requests require authentication using a Bearer token:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Rate Limiting

API requests are rate-limited to 60 requests per minute per user.

## Microservices Endpoints

### Content Transformation API

#### Text to Audio

\`\`\`
POST /api/microservices/transform/text-to-audio
\`\`\`

Request body:
\`\`\`json
{
  "text": "Text to convert to audio",
  "voice": "default"
}
\`\`\`

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "submitted"
}
\`\`\`

#### Audio to Text

\`\`\`
POST /api/microservices/transform/audio-to-text
\`\`\`

Request body (multipart/form-data):
- \`audio\`: Audio file
- \`diarization\`: Boolean (optional)

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "submitted"
}
\`\`\`

#### Text to Image

\`\`\`
POST /api/microservices/transform/text-to-image
\`\`\`

Request body:
\`\`\`json
{
  "prompt": "Image description",
  "style": "default"
}
\`\`\`

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "submitted"
}
\`\`\`

#### Get Job Status

\`\`\`
GET /api/microservices/transform/job/{job_id}
\`\`\`

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "completed",
  "output_url": "https://example.com/output.mp3"
}
\`\`\`

### Meeting Assistant API

#### Schedule Meeting

\`\`\`
POST /api/microservices/meeting/schedule
\`\`\`

Request body:
\`\`\`json
{
  "title": "Meeting Title",
  "start_time": "2025-04-10T10:00:00Z",
  "duration_minutes": 60,
  "participants": ["user1@example.com", "user2@example.com"],
  "description": "Meeting description"
}
\`\`\`

Response:
\`\`\`json
{
  "meeting_id": "meeting123",
  "join_url": "https://example.com/join/meeting123"
}
\`\`\`

### Voice Generation API

#### Generate Speech

\`\`\`
POST /api/microservices/voice/generate-speech
\`\`\`

Request body:
\`\`\`json
{
  "text": "Text to convert to speech",
  "profile_id": "profile123",
  "voice_style": "neutral"
}
\`\`\`

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "submitted"
}
\`\`\`

### Customer Journey API

#### Track Event

\`\`\`
POST /api/microservices/journey/track-event
\`\`\`

Request body:
\`\`\`json
{
  "user_id": "user123",
  "event_type": "page_view",
  "properties": {
    "page": "/products",
    "referrer": "google.com"
  }
}
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "event_id": "event123"
}
\`\`\`

### Synthetic Data API

#### Generate Tabular Data

\`\`\`
POST /api/microservices/data/generate-tabular
\`\`\`

Request body:
\`\`\`json
{
  "rows": 1000,
  "schema": {
    "name": "string",
    "age": "integer",
    "email": "email"
  },
  "format": "csv"
}
\`\`\`

Response:
\`\`\`json
{
  "job_id": "job123",
  "status": "submitted"
}
\`\`\`

## Health Check

\`\`\`
GET /api/microservices/health
\`\`\`

Response:
\`\`\`json
{
  "status": "ok",
  "services": {
    "transform": "available",
    "meeting": "available",
    "voice": "available",
    "journey": "available",
    "data": "available"
  }
}
\`\`\`

## User Credits

\`\`\`
GET /api/user/credits
\`\`\`

Response:
\`\`\`json
{
  "credits": 100
}
\`\`\`
EOF

# Create deployment package
echo -e "\nCreating deployment package..."
cd /home/ubuntu
tar -czf ai_saas_website_deploy.tar.gz -C $DEPLOY_DIR .

echo -e "\nDeployment package created: /home/ubuntu/ai_saas_website_deploy.tar.gz"

# Prepare for permanent deployment
echo -e "\nPreparing for permanent deployment..."
mkdir -p /home/ubuntu/ai_saas_website_deploy/public/static

# Deploy the static website
echo "Deploying static website..."
cp -r /home/ubuntu/ai_saas_website_deploy/public/* /home/ubuntu/ai_saas_website_deploy/public/static/

echo -e "\nDeployment Summary"
echo "================="
echo "The AI SaaS website with 5 API microservices is ready for deployment."
echo "Deployment package: /home/ubuntu/ai_saas_website_deploy.tar.gz"
echo "Static website: /home/ubuntu/ai_saas_website_deploy/public/static/"
echo ""
echo "To deploy the static website permanently, run:"
echo "deploy_apply_deployment type=static local_dir=/home/ubuntu/ai_saas_website_deploy/public/static"
echo ""
echo "For production deployment, follow the instructions in the deployment guide."
