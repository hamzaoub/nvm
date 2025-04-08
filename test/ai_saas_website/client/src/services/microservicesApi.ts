// Optimized microservicesApi.ts with better error handling and caching

import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: '/api/microservices',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Response cache for frequently accessed data
const responseCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          window.location.href = '/auth';
          break;
        case 402:
          // Payment required - insufficient credits
          console.error('Insufficient credits for this operation');
          break;
        case 429:
          // Too many requests - rate limit exceeded
          console.error('Rate limit exceeded. Please try again later');
          break;
      }
    } else if (error.request) {
      // Network error
      console.error('Network error. Please check your connection');
    }
    return Promise.reject(error);
  }
);

// Helper function to get cached data or fetch new data
const getCachedOrFetch = async (key, fetchFunction) => {
  const now = Date.now();
  if (responseCache.has(key)) {
    const { data, timestamp } = responseCache.get(key);
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetchFunction();
  responseCache.set(key, { data: response.data, timestamp: now });
  return response.data;
};

// Content Transformation API
const contentTransformation = {
  textToAudio: async (text, voice = 'default') => {
    const response = await apiClient.post('/transform/text-to-audio', { text, voice });
    return response.data;
  },
  
  audioToText: async (audioFile, options = {}) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    if (options.diarization) {
      formData.append('diarization', options.diarization.toString());
    }
    
    const response = await apiClient.post('/transform/audio-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  textToImage: async (prompt, style = 'default') => {
    const response = await apiClient.post('/transform/text-to-image', { prompt, style });
    return response.data;
  },
  
  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`/transform/job/${jobId}`);
    return response.data;
  },
};

// Meeting Assistant API
const meetingAssistant = {
  scheduleMeeting: async (meetingData) => {
    const response = await apiClient.post('/meeting/schedule', meetingData);
    return response.data;
  },
  
  joinMeeting: async (meetingId) => {
    const response = await apiClient.post(`/meeting/join/${meetingId}`);
    return response.data;
  },
  
  getMeetingTranscription: async (meetingId) => {
    const response = await apiClient.get(`/meeting/transcription/${meetingId}`);
    return response.data;
  },
  
  getMeetingSummary: async (meetingId) => {
    const response = await apiClient.get(`/meeting/summary/${meetingId}`);
    return response.data;
  },
};

// Voice Generation API
const voiceGeneration = {
  createVoiceProfile: async (name, audioSamples) => {
    const formData = new FormData();
    formData.append('name', name);
    
    // Append audio samples
    audioSamples.forEach((sample, index) => {
      formData.append(`sample_${index}`, sample);
    });
    
    const response = await apiClient.post('/voice/create-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  generateSpeech: async (text, options = {}) => {
    const response = await apiClient.post('/voice/generate-speech', {
      text,
      profile_id: options.profile_id || 'default',
      voice_style: options.voice_style || 'neutral',
    });
    return response.data;
  },
  
  listVoiceProfiles: async () => {
    return getCachedOrFetch('voice_profiles', () => apiClient.get('/voice/profiles'));
  },
  
  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`/voice/job/${jobId}`);
    return response.data;
  },
};

// Customer Journey API
const customerJourney = {
  trackEvent: async (eventData) => {
    const response = await apiClient.post('/journey/track-event', eventData);
    return response.data;
  },
  
  getUserJourney: async (userId) => {
    const response = await apiClient.get(`/journey/user/${userId}`);
    return response.data;
  },
  
  getTouchpointEffectiveness: async () => {
    return getCachedOrFetch('touchpoint_effectiveness', () => 
      apiClient.get('/journey/touchpoints')
    );
  },
  
  getRecommendations: async (userId) => {
    const response = await apiClient.get(`/journey/recommendations/${userId}`);
    return response.data;
  },
};

// Synthetic Data API
const syntheticData = {
  createSchema: async (schema) => {
    const response = await apiClient.post('/data/create-schema', { schema });
    return response.data;
  },
  
  generateTabularData: async (options) => {
    const response = await apiClient.post('/data/generate-tabular', options);
    return response.data;
  },
  
  generateTimeSeriesData: async (options) => {
    const response = await apiClient.post('/data/generate-time-series', options);
    return response.data;
  },
  
  listDatasets: async () => {
    return getCachedOrFetch('datasets', () => apiClient.get('/data/datasets'));
  },
  
  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`/data/job/${jobId}`);
    return response.data;
  },
};

// Health check for all services
const getServiceHealth = async () => {
  return getCachedOrFetch('service_health', () => apiClient.get('/health'));
};

// Export all API functions
const microservicesApi = {
  contentTransformation,
  meetingAssistant,
  voiceGeneration,
  customerJourney,
  syntheticData,
  getServiceHealth,
};

export default microservicesApi;
