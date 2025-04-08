import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure AWS microservice endpoints
const CONTENT_TRANSFORMATION_API = process.env.CONTENT_TRANSFORMATION_API || 'https://api.example.com/transform';
const MEETING_ASSISTANT_API = process.env.MEETING_ASSISTANT_API || 'https://api.example.com/meeting';
const VOICE_GENERATION_API = process.env.VOICE_GENERATION_API || 'https://api.example.com/voice';
const CUSTOMER_JOURNEY_API = process.env.CUSTOMER_JOURNEY_API || 'https://api.example.com/journey';
const SYNTHETIC_DATA_API = process.env.SYNTHETIC_DATA_API || 'https://api.example.com/data';

// Proxy middleware options
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/api/transform': '/',
    '^/api/meeting': '/',
    '^/api/voice': '/',
    '^/api/journey': '/',
    '^/api/data': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add authentication headers if needed
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
  logLevel: 'warn'
};

// Set up proxy routes to AWS microservices
app.use('/api/transform', createProxyMiddleware({ 
  ...proxyOptions, 
  target: CONTENT_TRANSFORMATION_API 
}));

app.use('/api/meeting', createProxyMiddleware({ 
  ...proxyOptions, 
  target: MEETING_ASSISTANT_API 
}));

app.use('/api/voice', createProxyMiddleware({ 
  ...proxyOptions, 
  target: VOICE_GENERATION_API 
}));

app.use('/api/journey', createProxyMiddleware({ 
  ...proxyOptions, 
  target: CUSTOMER_JOURNEY_API 
}));

app.use('/api/data', createProxyMiddleware({ 
  ...proxyOptions, 
  target: SYNTHETIC_DATA_API 
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    services: {
      contentTransformation: CONTENT_TRANSFORMATION_API,
      meetingAssistant: MEETING_ASSISTANT_API,
      voiceGeneration: VOICE_GENERATION_API,
      customerJourney: CUSTOMER_JOURNEY_API,
      syntheticData: SYNTHETIC_DATA_API
    }
  });
});

// Fallback route for API requests
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Proxying to the following microservices:');
  console.log(`- Content Transformation API: ${CONTENT_TRANSFORMATION_API}`);
  console.log(`- Meeting Assistant API: ${MEETING_ASSISTANT_API}`);
  console.log(`- Voice Generation API: ${VOICE_GENERATION_API}`);
  console.log(`- Customer Journey API: ${CUSTOMER_JOURNEY_API}`);
  console.log(`- Synthetic Data API: ${SYNTHETIC_DATA_API}`);
});

export default app;
