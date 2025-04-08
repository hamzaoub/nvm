import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Event } from '@/types/dashboard';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#0077b6]/30 bg-[#0c2e44]/80 backdrop-blur-sm transition-all duration-300 hover:border-[#00b4d8]/50 hover:shadow-lg hover:shadow-[#00b4d8]/10">
      {/* Live badge for upcoming events */}
      <div className="absolute right-3 top-3 z-10">
        <span className="inline-flex items-center rounded-full bg-[#0077b6]/20 px-2 py-0.5 text-xs font-medium text-[#00b4d8]">
          <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-[#00b4d8]"></span>
          Upcoming
        </span>
      </div>
      
      {/* Card image section with date overlay */}
      <div className="relative h-40 w-full bg-gradient-to-b from-[#051e2f] to-[#0c4c74]">
        {/* Calendar date display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">
              {event.date.split('-')[2]}
            </div>
            <div className="text-sm font-medium uppercase text-[#ade8f4]">
              {new Date(event.date).toLocaleString('default', { month: 'short' })}
            </div>
            <div className="mt-1 text-xs text-[#90e0ef]">
              {event.date.split('-')[0]}
            </div>
          </div>
        </div>
        
        {/* Floating bubbles animation - decorative */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute h-3 w-3 rounded-full bg-[#00b4d8] opacity-50 animate-float" style={{ left: '20%', top: '30%' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-[#90e0ef] opacity-70 animate-float" style={{ left: '40%', top: '60%' }}></div>
          <div className="absolute h-4 w-4 rounded-full bg-[#0077b6] opacity-60 animate-float" style={{ left: '70%', top: '20%' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-[#ade8f4] opacity-50 animate-float" style={{ left: '85%', top: '70%' }}></div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-[#00b4d8]">{event.title}</h3>
        <p className="mb-4 text-sm text-[#ade8f4] line-clamp-2">{event.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-[#90e0ef]">
            <Calendar className="mr-1.5 h-4 w-4" />
            <span className="text-xs">{event.date}</span>
          </div>
          
          {event.link && (
            <Link to={event.link} className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-3 py-1 text-sm text-[#00b4d8] transition-colors hover:bg-[#00b4d8]/20">
              RSVP <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
