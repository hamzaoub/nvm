import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaOctopusDeploy, FaRocket, FaLightbulb } from 'react-icons/fa';
import { Search } from 'lucide-react';
import { OceanButton } from '@/components/OceanButton';
import { OceanSidebar } from '@/components/OceanSidebar';
import { useUserRole } from '@/hooks/useUserRole';
import '@/styles/animations.css';

// Import the new components
import UpdatesSection from '@/components/dashboard/UpdatesSection';
import SuggestionsSection from '@/components/dashboard/SuggestionsSection';
import EventsSection from '@/components/dashboard/EventsSection';
import AddSuggestionModal from '@/components/dashboard/AddSuggestionModal';

// Import types
import { Update, Suggestion, Event } from '@/types/dashboard';

const Dashboard: React.FC = () => {
  // State for dashboard content and filtering
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestVisible, setSuggestVisible] = useState(false);
  
  // Get user role information
  const { isAdmin } = useUserRole();
  
  // Mock data - in a real app, you would fetch this from an API
  const updates: Update[] = [
    {
      id: 1,
      title: 'New AI Model Released',
      description: 'We have released our new oceanic pattern recognition AI model. Try it out today!',
      date: '2025-03-10',
      type: 'release',
      link: '/ai-models/oceanic-v2'
    },
    {
      id: 2,
      title: 'Platform Maintenance',
      description: 'Scheduled maintenance will occur on March 15th from 2-4 AM EST. Limited functionality may be available during this time.',
      date: '2025-03-08',
      type: 'announcement'
    },
    {
      id: 3,
      title: 'Dashboard Redesign',
      description: "We've redesigned the dashboard to better showcase updates, announcements, and user suggestions.",
      date: '2025-03-05',
      type: 'update'
    }
  ];
  
  const suggestions: Suggestion[] = [
    {
      id: 1,
      title: 'Add Dark Mode Support',
      description: 'It would be great to have a dark mode option for the platform for better night-time viewing.',
      author: 'DeepDiver42',
      date: '2025-03-12',
      votes: 127,
      status: 'planned'
    },
    {
      id: 2,
      title: 'Mobile App',
      description: 'Please develop a mobile app version of the platform so we can access our projects on the go.',
      author: 'OceanTech',
      date: '2025-03-08',
      votes: 89,
      status: 'under-review'
    },
    {
      id: 3,
      title: 'Collaborative Editing',
      description: 'Add support for multiple users to edit the same project simultaneously.',
      author: 'WaveRider',
      date: '2025-03-01',
      votes: 215,
      status: 'implemented'
    }
  ];
  
  const events: Event[] = [
    {
      id: 1,
      title: 'Aquariza AI Conference',
      description: 'Join us for our annual conference showcasing the latest in oceanic AI technologies.',
      date: '2025-04-15',
      link: '/events/conference-2025'
    },
    {
      id: 2,
      title: 'Workshop: Building with Aquariza API',
      description: 'Learn how to integrate your applications with the Aquariza API in this hands-on workshop.',
      date: '2025-03-20',
      link: '/events/api-workshop'
    },
    {
      id: 3,
      title: 'Webinar: Deep Learning for Ocean Data',
      description: 'Expert panel discussing applications of deep learning in oceanic data analysis.',
      date: '2025-03-18',
      link: '/events/deep-learning-webinar'
    }
  ];
  
  // Filter updates based on search query
  const filteredUpdates = updates.filter(update => 
    searchQuery === '' || 
    update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    update.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter suggestions based on search query
  const filteredSuggestions = suggestions.filter(suggestion => 
    searchQuery === '' || 
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    searchQuery === '' || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Navigate to projects page
  const goToProjects = () => {
    navigate('/projects');
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden flex justify-center">
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90"></div>
      
      <OceanSidebar />
      
      <div className="container mx-auto px-4 pt-20 pb-16 sm:py-18 md:py-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FaOctopusDeploy className="text-3xl sm:text-3xl md:text-4xl text-[#00b4d8]" />
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
              Aquariza Updates
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <OceanButton onClick={goToProjects}>
              <FaRocket className="w-4 h-4 mr-2" />
              View Projects
            </OceanButton>
            {isAdmin && (
              <OceanButton onClick={() => setSuggestVisible(true)} variant="outline">
                <FaLightbulb className="w-4 h-4 mr-2" />
                Add Update
              </OceanButton>
            )}
          </div>
        </div>
        
        {/* Search input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-[#ade8f4]" />
          </div>
          <input
            type="text"
            className="w-full p-3 pl-10 bg-[#051e2f]/70 border border-[#0077b6]/30 rounded-lg text-[#ade8f4] placeholder-[#90e0ef]/70 focus:outline-none focus:border-[#00b4d8]"
            placeholder="Search updates, suggestions, and events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Section Cards - Now using the componentized sections */}
        <div className="space-y-10 my-6">
          {/* Updates & Announcements */}
          <UpdatesSection 
            filteredUpdates={filteredSuggestions} 
            clearSearch={clearSearch} 
          />
          
          {/* User Suggestions */}
          <SuggestionsSection 
            filteredSuggestions={filteredSuggestions} 
            clearSearch={clearSearch} 
            openSuggestionModal={() => setSuggestVisible(true)}
          />
          
          {/* Upcoming Events */}
          <EventsSection 
            filteredEvents={filteredEvents} 
            clearSearch={clearSearch}
            openSuggestionModal={() => setSuggestVisible(true)}
          />
        </div>
      </div>
      
      {/* Add Suggestion Modal - Now using the componentized modal */}
      <AddSuggestionModal 
        isVisible={suggestVisible} 
        onClose={() => setSuggestVisible(false)} 
      />
    </div>
  );
};

export { Dashboard };
export default Dashboard;
