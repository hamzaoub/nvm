# API Documentation

This document provides details on the available API endpoints for the AI SaaS Platform.

## Authentication

All API requests require authentication using a Bearer token:

```
Authorization: Bearer <token>
```

## Rate Limiting

API requests are rate-limited to 60 requests per minute per user.

## Microservices Endpoints

### Content Transformation API

#### Text to Audio

```
POST /api/microservices/transform/text-to-audio
```

Request body:
```json
{
  "text": "Text to convert to audio",
  "voice": "default"
}
```

Response:
```json
{
  "job_id": "job123",
  "status": "submitted"
}
```

#### Audio to Text

```
POST /api/microservices/transform/audio-to-text
```

Request body (multipart/form-data):
- `audio`: Audio file
- `diarization`: Boolean (optional)

Response:
```json
{
  "job_id": "job123",
  "status": "submitted"
}
```

#### Text to Image

```
POST /api/microservices/transform/text-to-image
```

Request body:
```json
{
  "prompt": "Image description",
  "style": "default"
}
```

Response:
```json
{
  "job_id": "job123",
  "status": "submitted"
}
```

#### Get Job Status

```
GET /api/microservices/transform/job/{job_id}
```

Response:
```json
{
  "job_id": "job123",
  "status": "completed",
  "output_url": "https://example.com/output.mp3"
}
```

### Meeting Assistant API

#### Schedule Meeting

```
POST /api/microservices/meeting/schedule
```

Request body:
```json
{
  "title": "Meeting Title",
  "start_time": "2025-04-10T10:00:00Z",
  "duration_minutes": 60,
  "participants": ["user1@example.com", "user2@example.com"],
  "description": "Meeting description"
}
```

Response:
```json
{
  "meeting_id": "meeting123",
  "join_url": "https://example.com/join/meeting123"
}
```

### Voice Generation API

#### Generate Speech

```
POST /api/microservices/voice/generate-speech
```

Request body:
```json
{
  "text": "Text to convert to speech",
  "profile_id": "profile123",
  "voice_style": "neutral"
}
```

Response:
```json
{
  "job_id": "job123",
  "status": "submitted"
}
```

### Customer Journey API

#### Track Event

```
POST /api/microservices/journey/track-event
```

Request body:
```json
{
  "user_id": "user123",
  "event_type": "page_view",
  "properties": {
    "page": "/products",
    "referrer": "google.com"
  }
}
```

Response:
```json
{
  "success": true,
  "event_id": "event123"
}
```

### Synthetic Data API

#### Generate Tabular Data

```
POST /api/microservices/data/generate-tabular
```

Request body:
```json
{
  "rows": 1000,
  "schema": {
    "name": "string",
    "age": "integer",
    "email": "email"
  },
  "format": "csv"
}
```

Response:
```json
{
  "job_id": "job123",
  "status": "submitted"
}
```

## Health Check

```
GET /api/microservices/health
```

Response:
```json
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
```

## User Credits

```
GET /api/user/credits
```

Response:
```json
{
  "credits": 100
}
```
