import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API services for the 5 microservices
const apiServices = {
  // Content Transformation API
  contentTransformation: {
    // Text to audio conversion
    textToAudio: (text: string, voice: string) => 
      apiClient.post('/transform/text-to-audio', { text, voice }),
    
    // Audio to text transcription
    audioToText: (audioFile: File, options?: { diarization?: boolean }) => {
      const formData = new FormData();
      formData.append('audio', audioFile);
      if (options?.diarization) {
        formData.append('diarization', 'true');
      }
      return apiClient.post('/transform/audio-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    // Image to text extraction
    imageToText: (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return apiClient.post('/transform/image-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    // Text to image generation
    textToImage: (prompt: string, style?: string) => 
      apiClient.post('/transform/text-to-image', { prompt, style }),
    
    // Video generation from text
    textToVideo: (script: string, options?: { duration?: number, style?: string }) => 
      apiClient.post('/transform/text-to-video', { script, ...options }),
    
    // Document format conversion
    convertDocument: (documentFile: File, targetFormat: string) => {
      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('targetFormat', targetFormat);
      return apiClient.post('/transform/convert-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    // Get transformation job status
    getJobStatus: (jobId: string) => 
      apiClient.get(`/transform/jobs/${jobId}`),
    
    // List recent transformations
    listTransformations: (page = 1, limit = 10) => 
      apiClient.get(`/transform/history?page=${page}&limit=${limit}`),
  },
  
  // AI Meeting Assistant API
  meetingAssistant: {
    // Schedule a meeting with AI assistant
    scheduleMeeting: (meetingData: {
      title: string,
      start_time: string,
      duration_minutes: number,
      participants: string[],
      description?: string,
      platform?: string,
    }) => apiClient.post('/meeting/schedule', meetingData),
    
    // Join an existing meeting
    joinMeeting: (meetingId: string, platform: string, meetingUrl: string) => 
      apiClient.post('/meeting/join', { meeting_id: meetingId, platform, meeting_url }),
    
    // Get meeting transcription
    getTranscription: (meetingId: string) => 
      apiClient.get(`/meeting/${meetingId}/transcription`),
    
    // Get meeting summary
    getSummary: (meetingId: string) => 
      apiClient.get(`/meeting/${meetingId}/summary`),
    
    // Get action items from meeting
    getActionItems: (meetingId: string) => 
      apiClient.get(`/meeting/${meetingId}/action-items`),
    
    // Send follow-up emails
    sendFollowUp: (meetingId: string, customMessage?: string) => 
      apiClient.post(`/meeting/${meetingId}/follow-up`, { custom_message: customMessage }),
    
    // List recent meetings
    listMeetings: (page = 1, limit = 10) => 
      apiClient.get(`/meeting/history?page=${page}&limit=${limit}`),
  },
  
  // AI Voice Generation API
  voiceGeneration: {
    // Create a voice profile
    createVoiceProfile: (name: string, audioSamples: File[]) => {
      const formData = new FormData();
      formData.append('name', name);
      audioSamples.forEach((sample, index) => {
        formData.append(`sample_${index}`, sample);
      });
      return apiClient.post('/voice/profiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    // Generate speech from text
    generateSpeech: (text: string, options: {
      profile_id: string,
      voice_style?: string,
      speed?: number,
      pitch?: number,
    }) => apiClient.post('/voice/generate', { text, ...options }),
    
    // List voice profiles
    listVoiceProfiles: () => 
      apiClient.get('/voice/profiles'),
    
    // Get voice profile details
    getVoiceProfile: (profileId: string) => 
      apiClient.get(`/voice/profiles/${profileId}`),
    
    // Update voice profile
    updateVoiceProfile: (profileId: string, name: string) => 
      apiClient.put(`/voice/profiles/${profileId}`, { name }),
    
    // Delete voice profile
    deleteVoiceProfile: (profileId: string) => 
      apiClient.delete(`/voice/profiles/${profileId}`),
    
    // Get generation job status
    getJobStatus: (jobId: string) => 
      apiClient.get(`/voice/jobs/${jobId}`),
  },
  
  // Customer Journey Optimization API
  customerJourney: {
    // Track user event
    trackEvent: (eventData: {
      user_id: string,
      event_type: string,
      properties: Record<string, any>,
      timestamp?: string,
    }) => apiClient.post('/journey/track-event', eventData),
    
    // Get user journey visualization
    getUserJourney: (userId: string, startDate?: string, endDate?: string) => 
      apiClient.get(`/journey/users/${userId}?${startDate ? `start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`),
    
    // Get touchpoint effectiveness
    getTouchpointEffectiveness: (touchpointType?: string, startDate?: string, endDate?: string) => 
      apiClient.get(`/journey/touchpoints/effectiveness?${touchpointType ? `type=${touchpointType}` : ''}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`),
    
    // Get personalized recommendations
    getRecommendations: (userId: string, context?: string) => 
      apiClient.get(`/journey/recommendations/${userId}${context ? `?context=${context}` : ''}`),
    
    // Create A/B test
    createAbTest: (testData: {
      name: string,
      description?: string,
      variants: Array<{
        name: string,
        content: any,
      }>,
      target_audience?: Record<string, any>,
      start_date?: string,
      end_date?: string,
    }) => apiClient.post('/journey/ab-tests', testData),
    
    // Get A/B test results
    getAbTestResults: (testId: string) => 
      apiClient.get(`/journey/ab-tests/${testId}/results`),
    
    // Get conversion funnel analysis
    getFunnelAnalysis: (funnelId: string, startDate?: string, endDate?: string) => 
      apiClient.get(`/journey/funnels/${funnelId}/analysis?${startDate ? `start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`),
    
    // Get churn prediction
    getChurnPrediction: (userId: string) => 
      apiClient.get(`/journey/churn-prediction/${userId}`),
  },
  
  // Synthetic Data Generation API
  syntheticData: {
    // Create data schema
    createSchema: (schemaData: {
      name: string,
      type: string,
      fields: Array<Record<string, any>>,
      metadata?: Record<string, any>,
    }) => apiClient.post('/data/create-schema', schemaData),
    
    // Generate tabular data
    generateTabularData: (generationData: {
      rows: number,
      schema_id?: string,
      schema?: {
        fields: Array<Record<string, any>>,
      },
      format?: string,
      include_header?: boolean,
      seed?: number,
      metadata?: Record<string, any>,
    }) => apiClient.post('/data/generate-tabular', generationData),
    
    // Generate time series data
    generateTimeSeriesData: (generationData: {
      points: number,
      start_date: string,
      frequency: string,
      fields: Array<Record<string, any>>,
      format?: string,
      seed?: number,
    }) => apiClient.post('/data/generate-time-series', generationData),
    
    // Generate text data
    generateTextData: (generationData: {
      template?: string,
      templates?: string[],
      count: number,
      variables: Record<string, string[]>,
      format?: string,
      seed?: number,
    }) => apiClient.post('/data/generate-text', generationData),
    
    // Anonymize data
    anonymizeData: (anonymizationData: {
      dataset_id?: string,
      source_location?: string,
      fields_to_anonymize: string[],
      anonymization_method: string,
      format?: string,
    }) => apiClient.post('/data/anonymize', anonymizationData),
    
    // Get dataset details
    getDataset: (datasetId: string) => 
      apiClient.get(`/data/datasets/${datasetId}`),
    
    // Get job status
    getJobStatus: (jobId: string) => 
      apiClient.get(`/data/jobs/${jobId}`),
    
    // List datasets
    listDatasets: (type?: string, includeSchemas = false) => 
      apiClient.get(`/data/datasets?${type ? `type=${type}` : ''}${includeSchemas ? '&include_schemas=true' : ''}`),
    
    // List jobs
    listJobs: (type?: string, status?: string) => 
      apiClient.get(`/data/jobs?${type ? `type=${type}` : ''}${status ? `&status=${status}` : ''}`),
  },
};

export default apiServices;
