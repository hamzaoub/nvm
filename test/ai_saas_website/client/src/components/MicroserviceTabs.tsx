import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/FileUpload';
import { Loader2 } from 'lucide-react';

interface MicroserviceTabsProps {
  serviceType: 'transform' | 'meeting' | 'voice' | 'journey' | 'data';
  isLoading?: boolean;
  onSubmit?: (formData: any, tabId: string) => void;
  className?: string;
}

export const MicroserviceTabs: React.FC<MicroserviceTabsProps> = ({
  serviceType,
  isLoading = false,
  onSubmit,
  className = '',
}) => {
  // Define tabs based on service type
  const getTabs = () => {
    switch (serviceType) {
      case 'transform':
        return [
          { id: 'text-to-audio', label: 'Text to Audio' },
          { id: 'audio-to-text', label: 'Audio to Text' },
          { id: 'image-to-text', label: 'Image to Text' },
          { id: 'text-to-image', label: 'Text to Image' },
          { id: 'text-to-video', label: 'Text to Video' },
          { id: 'convert-document', label: 'Convert Document' },
        ];
      case 'meeting':
        return [
          { id: 'schedule', label: 'Schedule Meeting' },
          { id: 'join', label: 'Join Meeting' },
          { id: 'transcription', label: 'Get Transcription' },
          { id: 'summary', label: 'Get Summary' },
          { id: 'action-items', label: 'Action Items' },
          { id: 'follow-up', label: 'Send Follow-up' },
        ];
      case 'voice':
        return [
          { id: 'create-profile', label: 'Create Voice Profile' },
          { id: 'generate-speech', label: 'Generate Speech' },
          { id: 'list-profiles', label: 'Voice Profiles' },
          { id: 'update-profile', label: 'Update Profile' },
        ];
      case 'journey':
        return [
          { id: 'track-event', label: 'Track Event' },
          { id: 'user-journey', label: 'User Journey' },
          { id: 'touchpoints', label: 'Touchpoints' },
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'ab-test', label: 'A/B Testing' },
          { id: 'funnel', label: 'Funnel Analysis' },
          { id: 'churn', label: 'Churn Prediction' },
        ];
      case 'data':
        return [
          { id: 'create-schema', label: 'Create Schema' },
          { id: 'generate-tabular', label: 'Tabular Data' },
          { id: 'generate-time-series', label: 'Time Series' },
          { id: 'generate-text', label: 'Text Data' },
          { id: 'anonymize', label: 'Anonymize Data' },
          { id: 'datasets', label: 'Datasets' },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || '');
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData, activeTab);
    }
  };

  // Render form based on active tab
  const renderForm = () => {
    switch (serviceType) {
      case 'transform':
        return renderTransformForm();
      case 'meeting':
        return renderMeetingForm();
      case 'voice':
        return renderVoiceForm();
      case 'journey':
        return renderJourneyForm();
      case 'data':
        return renderDataForm();
      default:
        return <p>No form available</p>;
    }
  };

  // Form renderers for each service type
  const renderTransformForm = () => {
    switch (activeTab) {
      case 'text-to-audio':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text to Convert</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="Enter the text you want to convert to audio..."
                  className="min-h-32 bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select onValueChange={(value) => handleSelectChange('voice', value)}>
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="en-US-Neural2-F">English (US) - Female</SelectItem>
                    <SelectItem value="en-US-Neural2-M">English (US) - Male</SelectItem>
                    <SelectItem value="en-GB-Neural2-F">English (UK) - Female</SelectItem>
                    <SelectItem value="en-GB-Neural2-M">English (UK) - Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to Audio'
                )}
              </Button>
            </div>
          </form>
        );
      case 'audio-to-text':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="audio">Audio File</Label>
                <FileUpload
                  id="audio"
                  name="audio"
                  accept="audio/*"
                  onFileChange={(file) => handleFileChange('audio', file)}
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="diarization"
                  name="diarization"
                  className="rounded border-[#0077b6]/30 bg-[#051e2f]"
                  onChange={(e) => handleSelectChange('diarization', e.target.checked ? 'true' : 'false')}
                />
                <Label htmlFor="diarization">Enable speaker diarization</Label>
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  'Transcribe Audio'
                )}
              </Button>
            </div>
          </form>
        );
      case 'text-to-image':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Describe the image you want to generate..."
                  className="min-h-32 bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style (Optional)</Label>
                <Select onValueChange={(value) => handleSelectChange('style', value)}>
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="oil-painting">Oil Painting</SelectItem>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
            </div>
          </form>
        );
      // Add more cases for other transform tabs as needed
      default:
        return <p className="text-[#ade8f4]">Select a transformation type to get started</p>;
    }
  };

  const renderMeetingForm = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter meeting title"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="15"
                  step="15"
                  defaultValue="60"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">Participants (comma-separated emails)</Label>
                <Input
                  id="participants"
                  name="participants"
                  placeholder="email1@example.com, email2@example.com"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter meeting description..."
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Meeting'
                )}
              </Button>
            </div>
          </form>
        );
      // Add more cases for other meeting tabs as needed
      default:
        return <p className="text-[#ade8f4]">Select a meeting function to get started</p>;
    }
  };

  const renderVoiceForm = () => {
    switch (activeTab) {
      case 'generate-speech':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text to Speak</Label>
                <Textarea
                  id="text"
                  name="text"
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-32 bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_id">Voice Profile</Label>
                <Select onValueChange={(value) => handleSelectChange('profile_id', value)} required>
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select a voice profile" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="default">Default Voice</SelectItem>
                    <SelectItem value="professional">Professional Voice</SelectItem>
                    <SelectItem value="friendly">Friendly Voice</SelectItem>
                    <SelectItem value="custom1">Custom Voice 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice_style">Voice Style (Optional)</Label>
                <Select onValueChange={(value) => handleSelectChange('voice_style', value)}>
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="cheerful">Cheerful</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Speech'
                )}
              </Button>
            </div>
          </form>
        );
      // Add more cases for other voice tabs as needed
      default:
        return <p className="text-[#ade8f4]">Select a voice function to get started</p>;
    }
  };

  const renderJourneyForm = () => {
    switch (activeTab) {
      case 'track-event':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  name="user_id"
                  placeholder="Enter user ID"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select onValueChange={(value) => handleSelectChange('event_type', value)} required>
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="page_view">Page View</SelectItem>
                    <SelectItem value="button_click">Button Click</SelectItem>
                    <SelectItem value="form_submit">Form Submit</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="signup">Signup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="properties">Event Properties (JSON)</Label>
                <Textarea
                  id="properties"
                  name="properties"
                  placeholder='{"page": "homepage", "referrer": "google"}'
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  'Track Event'
                )}
              </Button>
            </div>
          </form>
        );
      // Add more cases for other journey tabs as needed
      default:
        return <p className="text-[#ade8f4]">Select a journey function to get started</p>;
    }
  };

  const renderDataForm = () => {
    switch (activeTab) {
      case 'generate-tabular':
        return (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Number of Rows</Label>
                <Input
                  id="rows"
                  name="rows"
                  type="number"
                  min="1"
                  max="10000"
                  defaultValue="100"
                  className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schema">Schema Definition (JSON)</Label>
                <Textarea
                  id="schema"
                  name="schema"
                  placeholder={`{
  "fields": [
    {
      "name": "id",
      "type": "id",
      "prefix": "TST",
      "length": 6
    },
    {
      "name": "age",
      "type": "integer",
      "min": 18,
      "max": 65
    }
  ]
}`}
                  className="min-h-32 bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4] placeholder-[#90e0ef]/50 font-mono text-sm"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select onValueChange={(value) => handleSelectChange('format', value)} defaultValue="csv">
                  <SelectTrigger className="bg-[#051e2f] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c2e44] border-[#0077b6]/30 text-[#ade8f4]">
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0077b6]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Data'
                )}
              </Button>
            </div>
          </form>
        );
      // Add more cases for other data tabs as needed
      default:
        return <p className="text-[#ade8f4]">Select a data function to get started</p>;
    }
  };

  return (
    <Tabs 
      defaultValue={tabs[0]?.id} 
      className={`w-full ${className}`}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-[#051e2f] border border-[#0077b6]/30">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="data-[state=active]:bg-[#0077b6] data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          <Card className="border border-[#0077b6]/30 bg-[#0c2e44]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">{tab.label}</CardTitle>
              <CardDescription className="text-[#ade8f4]">
                {getTabDescription(serviceType, tab.id)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderForm()}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Helper function to get tab descriptions
function getTabDescription(serviceType: string, tabId: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    transform: {
      'text-to-audio': 'Convert text to natural-sounding audio with various voice options.',
      'audio-to-text': 'Transcribe audio files to text with optional speaker diarization.',
      'image-to-text': 'Extract text and context from images using advanced AI.',
      'text-to-image': 'Generate images from text descriptions with style control.',
      'text-to-video': 'Create videos from text scripts with customizable options.',
      'convert-document': 'Convert documents between different formats while preserving layout.',
    },
    meeting: {
      'schedule': 'Schedule a meeting with AI assistant participation.',
      'join': 'Have the AI assistant join an existing meeting.',
      'transcription': 'Get detailed transcription of a recorded meeting.',
      'summary': 'Generate a concise summary of meeting content.',
      'action-items': 'Extract action items and assignments from meetings.',
      'follow-up': 'Send automated follow-up emails with action items.',
    },
    voice: {
      'create-profile': 'Create a custom voice profile from audio samples.',
      'generate-speech': 'Generate natural-sounding speech using selected voice profiles.',
      'list-profiles': 'View and manage your voice profiles.',
      'update-profile': 'Update an existing voice profile.',
    },
    journey: {
      'track-event': 'Track user events across different touchpoints.',
      'user-journey': 'Visualize the complete journey of a specific user.',
      'touchpoints': 'Analyze effectiveness of different customer touchpoints.',
      'recommendations': 'Get personalized recommendations for users.',
      'ab-test': 'Create and analyze A/B tests for customer experiences.',
      'funnel': 'Analyze conversion funnels to identify drop-off points.',
      'churn': 'Predict customer churn risk and get prevention recommendations.',
    },
    data: {
      'create-schema': 'Create a reusable schema for data generation.',
      'generate-tabular': 'Generate realistic tabular data with customizable fields.',
      'generate-time-series': 'Create time series data with patterns and seasonality.',
      'generate-text': 'Generate text data based on templates and variables.',
      'anonymize': 'Anonymize sensitive data while preserving patterns.',
      'datasets': 'View and manage your generated datasets.',
    },
  };

  return descriptions[serviceType]?.[tabId] || 'No description available';
}

export default MicroserviceTabs;
