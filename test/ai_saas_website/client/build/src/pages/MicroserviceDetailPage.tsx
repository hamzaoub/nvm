import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaOctopusDeploy } from 'react-icons/fa';
import { ArrowLeft, FileText, Headphones, Users, BarChart3, Database, Loader2 } from 'lucide-react';
import { OceanSidebar } from '@/components/OceanSidebar';
import MicroserviceTabs from '@/components/MicroserviceTabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import microservicesApi from '@/services/microservicesApi';
import { useAuth } from '@/hooks/useAuth';
import { useMicroservices } from '@/providers/MicroservicesProvider';

const MicroserviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceStatus, userCredits, refreshCredits } = useMicroservices();
  const [isLoading, setIsLoading] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [jobStatus, setJobStatus] = React.useState<string | null>(null);
  const [jobResult, setJobResult] = React.useState<any>(null);

  // Map service ID to service type
  const getServiceType = (id: string) => {
    switch (id) {
      case 'content-transformation':
        return 'transform';
      case 'meeting-assistant':
        return 'meeting';
      case 'voice-generation':
        return 'voice';
      case 'customer-journey':
        return 'journey';
      case 'synthetic-data':
        return 'data';
      default:
        return 'transform';
    }
  };

  // Map service ID to status key
  const getServiceStatusKey = (id: string) => {
    switch (id) {
      case 'content-transformation':
        return 'contentTransformation';
      case 'meeting-assistant':
        return 'meetingAssistant';
      case 'voice-generation':
        return 'voiceGeneration';
      case 'customer-journey':
        return 'customerJourney';
      case 'synthetic-data':
        return 'syntheticData';
      default:
        return 'contentTransformation';
    }
  };

  // Get service details based on ID
  const getServiceDetails = (id: string) => {
    const services = {
      'content-transformation': {
        title: 'Content Transformation',
        description: 'Convert content between different formats while preserving context.',
        icon: <FileText className="h-6 w-6" />,
      },
      'meeting-assistant': {
        title: 'AI Meeting Assistant',
        description: 'AI that joins meetings, takes notes, identifies action items, and follows up automatically.',
        icon: <Users className="h-6 w-6" />,
      },
      'voice-generation': {
        title: 'AI Voice Generation',
        description: 'Create unique AI voice clones for consistent audio content across channels.',
        icon: <Headphones className="h-6 w-6" />,
      },
      'customer-journey': {
        title: 'Customer Journey Optimization',
        description: 'Track, analyze, and optimize customer journeys across multiple touchpoints.',
        icon: <BarChart3 className="h-6 w-6" />,
      },
      'synthetic-data': {
        title: 'Synthetic Data Generation',
        description: 'Create realistic synthetic data for testing, development, and machine learning.',
        icon: <Database className="h-6 w-6" />,
      },
    };

    return services[id as keyof typeof services] || services['content-transformation'];
  };

  const serviceType = getServiceType(id || '');
  const serviceStatusKey = getServiceStatusKey(id || '');
  const serviceDetails = getServiceDetails(id || '');
  const currentServiceStatus = serviceStatus[serviceStatusKey as keyof typeof serviceStatus];

  // Check if service is available
  useEffect(() => {
    if (currentServiceStatus === 'unavailable') {
      toast.error(`${serviceDetails.title} is currently unavailable. Please try again later.`);
    } else if (currentServiceStatus === 'maintenance') {
      toast.warning(`${serviceDetails.title} is currently under maintenance. Some features may be limited.`);
    }
  }, [currentServiceStatus, serviceDetails.title]);

  // Handle form submission
  const handleSubmit = async (formData: any, tabId: string) => {
    setIsLoading(true);
    setJobId(null);
    setJobStatus(null);
    setJobResult(null);

    try {
      let response;

      // Call appropriate API based on service type and tab ID
      switch (serviceType) {
        case 'transform':
          switch (tabId) {
            case 'text-to-audio':
              response = await microservicesApi.contentTransformation.textToAudio(formData.text, formData.voice);
              break;
            case 'audio-to-text':
              response = await microservicesApi.contentTransformation.audioToText(formData.audio, {
                diarization: formData.diarization === 'true',
              });
              break;
            case 'text-to-image':
              response = await microservicesApi.contentTransformation.textToImage(formData.prompt, formData.style);
              break;
            // Add other transform cases as needed
          }
          break;
        case 'meeting':
          switch (tabId) {
            case 'schedule':
              // Parse participants string into array
              const participants = formData.participants.split(',').map((email: string) => email.trim());
              response = await microservicesApi.meetingAssistant.scheduleMeeting({
                title: formData.title,
                start_time: formData.start_time,
                duration_minutes: parseInt(formData.duration_minutes),
                participants,
                description: formData.description,
              });
              break;
            // Add other meeting cases as needed
          }
          break;
        case 'voice':
          switch (tabId) {
            case 'generate-speech':
              response = await microservicesApi.voiceGeneration.generateSpeech(formData.text, {
                profile_id: formData.profile_id,
                voice_style: formData.voice_style,
              });
              break;
            // Add other voice cases as needed
          }
          break;
        case 'journey':
          switch (tabId) {
            case 'track-event':
              // Parse properties JSON string into object
              const properties = JSON.parse(formData.properties);
              response = await microservicesApi.customerJourney.trackEvent({
                user_id: formData.user_id,
                event_type: formData.event_type,
                properties,
              });
              break;
            // Add other journey cases as needed
          }
          break;
        case 'data':
          switch (tabId) {
            case 'generate-tabular':
              // Parse schema JSON string into object
              const schema = JSON.parse(formData.schema);
              response = await microservicesApi.syntheticData.generateTabularData({
                rows: parseInt(formData.rows),
                schema,
                format: formData.format,
                include_header: true,
              });
              break;
            // Add other data cases as needed
          }
          break;
      }

      if (response && response.job_id) {
        setJobId(response.job_id);
        setJobStatus('submitted');
        toast.success('Request submitted successfully');
        
        // Start polling for job status
        pollJobStatus(response.job_id, serviceType);
      } else {
        setJobResult(response);
        toast.success('Request completed successfully');
      }
      
      // Refresh user credits after operation
      refreshCredits();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      
      // Handle specific error cases
      if (error.response && error.response.status === 402) {
        toast.error('Insufficient credits for this operation. Please purchase more credits.');
      } else if (error.response && error.response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to process request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for job status
  const pollJobStatus = async (jobId: string, serviceType: string) => {
    const interval = setInterval(async () => {
      try {
        let response;
        
        switch (serviceType) {
          case 'transform':
            response = await microservicesApi.contentTransformation.getJobStatus(jobId);
            break;
          case 'voice':
            response = await microservicesApi.voiceGeneration.getJobStatus(jobId);
            break;
          case 'data':
            response = await microservicesApi.syntheticData.getJobStatus(jobId);
            break;
          // Add other service types as needed
        }
        
        if (response) {
          setJobStatus(response.status);
          
          if (response.status === 'completed') {
            clearInterval(interval);
            setJobResult(response);
            toast.success('Job completed successfully');
            
            // Refresh user credits after job completion
            refreshCredits();
          } else if (response.status === 'failed') {
            clearInterval(interval);
            toast.error(`Job failed: ${response.error || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(interval);
        toast.error('Failed to get job status');
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  };

  // Render job result based on service type and job status
  const renderJobResult = () => {
    if (!jobResult) return null;

    switch (serviceType) {
      case 'transform':
        if (jobResult.output_url && jobResult.output_url.endsWith('.mp3')) {
          return (
            <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30">
              <h3 className="text-white text-lg font-medium mb-3">Generated Audio</h3>
              <audio controls className="w-full">
                <source src={jobResult.output_url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <a 
                href={jobResult.output_url} 
                download 
                className="mt-3 inline-block text-[#00b4d8] hover:text-[#ade8f4]"
              >
                Download Audio
              </a>
            </div>
          );
        } else if (jobResult.output_url && (jobResult.output_url.endsWith('.jpg') || jobResult.output_url.endsWith('.png'))) {
          return (
            <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30">
              <h3 className="text-white text-lg font-medium mb-3">Generated Image</h3>
              <img 
                src={jobResult.output_url} 
                alt="Generated image" 
                className="max-w-full rounded-lg border border-[#0077b6]/30"
              />
              <a 
                href={jobResult.output_url} 
                download 
                className="mt-3 inline-block text-[#00b4d8] hover:text-[#ade8f4]"
              >
                Download Image
              </a>
            </div>
          );
        } else if (jobResult.transcript) {
          return (
            <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30">
              <h3 className="text-white text-lg font-medium mb-3">Transcription Result</h3>
              <div className="max-h-80 overflow-y-auto text-[#ade8f4] whitespace-pre-wrap">
                {jobResult.transcript}
              </div>
            </div>
          );
        }
        break;
      
      case 'meeting':
        if (jobResult.meeting_id) {
          return (
            <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30">
              <h3 className="text-white text-lg font-medium mb-3">Meeting Scheduled</h3>
              <div className="text-[#ade8f4]">
                <p><span className="text-[#90e0ef]">Meeting ID:</span> {jobResult.meeting_id}</p>
                <p><span className="text-[#90e0ef]">Title:</span> {jobResult.title}</p>
                <p><span className="text-[#90e0ef]">Start Time:</span> {new Date(jobResult.start_time).toLocaleString()}</p>
                <p><span className="text-[#90e0ef]">Duration:</span> {jobResult.duration_minutes} minutes</p>
                {jobResult.join_url && (
                  <p>
                    <span className="text-[#90e0ef]">Join URL:</span> 
                    <a 
                      href={jobResult.join_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-[#00b4d8] hover:text-[#ade8f4]"
                    >
                      {jobResult.join_url}
                    </a>
                  </p>
                )}
              </div>
            </div>
          );
        }
        break;
      
      // Add cases for other service types
      
      default:
        return (
          <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30">
            <h3 className="text-white text-lg font-medium mb-3">Result</h3>
            <pre className="text-[#ade8f4] whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(jobResult, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden flex justify-center">
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90"></div>
      
      {/* Sidebar */}
      <OceanSidebar />
      
      <div className="container mx-auto px-4 pt-20 pb-16 md:py-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#00b4d8] hover:text-[#ade8f4] hover:bg-[#0077b6]/20"
              onClick={() => navigate('/microservices')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-[#00b4d8] p-2 rounded-lg bg-[#00b4d8]/10 border border-[#00b4d8]/20">
                {serviceDetails.icon}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
                {serviceDetails.title}
              </h1>
            </div>
          </div>
          
          {/* Credits display */}
          <div className="bg-[#0c2e44]/80 px-4 py-2 rounded-lg border border-[#0077b6]/30 backdrop-blur-sm">
            <div className="text-[#ade8f4] text-sm">
              <span className="font-medium">Available Credits:</span> {userCredits}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-[#ade8f4] text-lg">
            {serviceDetails.description}
          </p>
        </div>
        
        {/* Service status warning */}
        {currentServiceStatus !== 'available' && (
          <div className={`mb-6 p-4 rounded-lg ${
            currentServiceStatus === 'maintenance' 
              ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            <p className="font-medium">
              {currentServiceStatus === 'maintenance'
                ? 'This service is currently under maintenance. Some features may be limited.'
                : 'This service is currently unavailable. Please try again later.'}
            </p>
          </div>
        )}
        
        <MicroserviceTabs 
          serviceType={serviceType as any} 
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
        
        {/* Job status indicator */}
        {jobId && jobStatus && jobStatus !== 'completed' && (
          <div className="mt-6 p-4 bg-[#051e2f] rounded-lg border border-[#0077b6]/30 flex items-center">
            <Loader2 className="h-5 w-5 text-[#00b4d8] animate-spin mr-3" />
            <div>
              <p className="text-white font-medium">Processing your request</p>
              <p className="text-[#90e0ef] text-sm">Job ID: {jobId} | Status: {jobStatus}</p>
            </div>
          </div>
        )}
        
        {/* Job result */}
        {renderJobResult()}
      </div>
    </div>
  );
};

export default MicroserviceDetailPage;
