import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegCalendarAlt, FaLightbulb } from 'react-icons/fa';
import { MessageSquare } from 'lucide-react';
import { OceanButton } from '@/components/OceanButton';
import EventCard from './EventCard';
import { Event } from '@/types/dashboard';

interface EventsSectionProps {
  filteredEvents: Event[];
  clearSearch: () => void;
  openSuggestionModal: () => void;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  filteredEvents,
  clearSearch,
  openSuggestionModal
}) => {
  return (
    <div className="transform translate-x-full opacity-0 animate-slideInFromRight delay-300 border border-[#0077b6]/30 bg-[#0c2e44]/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg shadow-[#0077b6]/10">
      <div className="flex items-center border-b border-[#0077b6]/30 bg-gradient-to-r from-[#051e2f] to-[#0c4c74] p-4">
        <FaRegCalendarAlt className="text-[#00b4d8] h-6 w-6 mr-3" />
        <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
      </div>
      
      <div className="p-4">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#0077b6]/30 bg-[#0c2e44]/50 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#051e2f]">
              <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-[#90e0ef]" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">No events found</h3>
            <p className="mb-6 text-sm sm:text-base text-[#ade8f4]">There are no events matching your search criteria.</p>
            <OceanButton onClick={clearSearch} variant="outline">
              Clear search
            </OceanButton>
          </div>
        )}
        
        {/* Add suggestion button for all users */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <button 
            onClick={openSuggestionModal}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-[#00b4d8] hover:to-[#0077b6] hover:shadow-lg"
          >
            <FaLightbulb className="mr-2 h-4 w-4" />
            Share your idea
          </button>
        </div>
        
        {/* View all events button */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <Link to="/events" className="inline-flex items-center rounded-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-[#00b4d8] hover:to-[#0077b6] hover:shadow-lg">
            <FaRegCalendarAlt className="mr-2 h-4 w-4" />
            View all events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
