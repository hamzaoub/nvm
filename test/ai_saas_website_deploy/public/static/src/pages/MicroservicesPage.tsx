import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaOctopusDeploy } from 'react-icons/fa';
import { Waves, FileText, Headphones, Users, BarChart3, Database } from 'lucide-react';
import { OceanSidebar } from '@/components/OceanSidebar';
import MicroserviceCard from '@/components/MicroserviceCard';
import { useAuth } from '@/hooks/useAuth';
import { useMicroservices } from '@/providers/MicroservicesProvider';

const MicroservicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceStatus, userCredits } = useMicroservices();

  // Microservices data
  const microservices = [
    {
      id: 'content-transformation',
      title: 'Content Transformation',
      description: 'Convert content between different formats while preserving context.',
      icon: <FileText className="h-6 w-6" />,
      status: serviceStatus.contentTransformation,
      features: [
        'Text to audio conversion with natural voices',
        'Audio to text transcription with speaker diarization',
        'Image to text extraction with context awareness',
        'Text to image generation with style control',
        'Video generation from text scripts',
        'Document format conversion'
      ],
    },
    {
      id: 'meeting-assistant',
      title: 'AI Meeting Assistant',
      description: 'AI that joins meetings, takes notes, identifies action items, and follows up automatically.',
      icon: <Users className="h-6 w-6" />,
      status: serviceStatus.meetingAssistant,
      features: [
        'Join virtual meetings via conferencing platforms',
        'Transcribe meeting conversations in real-time',
        'Identify speakers and create structured notes',
        'Extract action items and decisions',
        'Generate meeting summaries',
        'Send follow-up emails with action items'
      ],
    },
    {
      id: 'voice-generation',
      title: 'AI Voice Generation',
      description: 'Create unique AI voice clones for consistent audio content across channels.',
      icon: <Headphones className="h-6 w-6" />,
      status: serviceStatus.voiceGeneration,
      features: [
        'Voice profile creation from audio samples',
        'Text-to-speech generation with custom voices',
        'Emotion and tone control',
        'Multi-language support',
        'Voice style transfer',
        'Batch processing for long-form content'
      ],
    },
    {
      id: 'customer-journey',
      title: 'Customer Journey Optimization',
      description: 'Track, analyze, and optimize customer journeys across multiple touchpoints.',
      icon: <BarChart3 className="h-6 w-6" />,
      status: serviceStatus.customerJourney,
      features: [
        'Event tracking across channels',
        'Customer journey visualization',
        'Touchpoint effectiveness analysis',
        'Personalized recommendation generation',
        'A/B testing of customer experiences',
        'Conversion funnel optimization',
        'Churn prediction and prevention'
      ],
    },
    {
      id: 'synthetic-data',
      title: 'Synthetic Data Generation',
      description: 'Create realistic synthetic data for testing, development, and machine learning.',
      icon: <Database className="h-6 w-6" />,
      status: serviceStatus.syntheticData,
      features: [
        'Tabular data generation with realistic distributions',
        'Time series data generation with patterns',
        'Text data generation based on templates',
        'Data anonymization and masking',
        'Schema creation and management',
        'Large-scale data generation via batch processing'
      ],
    },
  ];

  const handleCardClick = (id: string) => {
    navigate(`/microservices/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden flex justify-center">
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90"></div>
      
      {/* Animated bubbles with fully random placement across the dashboard */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051e2f] via-[#00131f] to-[#0c1630] opacity-90"></div>
      
      {/* Sidebar */}
      <OceanSidebar />
      
      <div className="container mx-auto px-4 pt-20 pb-16 md:py-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FaOctopusDeploy className="text-3xl sm:text-4xl text-[#00b4d8]" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
              AI Microservices
            </h1>
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
            Explore our powerful AI microservices hosted on AWS. Each service provides a unique set of capabilities to enhance your applications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {microservices.map((service) => (
            <MicroserviceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              status={service.status}
              features={service.features}
              onClick={() => handleCardClick(service.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MicroservicesPage;
