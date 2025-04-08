import React from 'react';
import { FaBullhorn } from 'react-icons/fa';
import { Bell } from 'lucide-react';
import { OceanButton } from '@/components/OceanButton';
import UpdateCard from './UpdateCard';
import { Suggestion } from '@/types/dashboard';

interface UpdatesSectionProps {
  filteredUpdates: Suggestion[];
  clearSearch: () => void;
}

const UpdatesSection: React.FC<UpdatesSectionProps> = ({ filteredUpdates, clearSearch }) => {
  return (
    <div className="transform translate-x-full opacity-0 animate-slideInFromRight border border-[#0077b6]/30 bg-[#0c2e44]/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg shadow-[#0077b6]/10">
      <div className="flex items-center border-b border-[#0077b6]/30 bg-gradient-to-r from-[#051e2f] to-[#0c4c74] p-4">
        <FaBullhorn className="text-[#00b4d8] h-6 w-6 mr-3" />
        <h2 className="text-xl font-bold text-white">Updates & Announcements</h2>
      </div>
      
      <div className="p-4">
        {filteredUpdates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpdates.map(suggestion => (
              <UpdateCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#0077b6]/30 bg-[#0c2e44]/50 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#051e2f]">
              <Bell className="h-8 w-8 text-[#90e0ef]" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No updates found</h3>
            <p className="mb-6 text-[#ade8f4]">There are no updates matching your search criteria.</p>
            <OceanButton onClick={clearSearch} variant="outline">
              Clear search
            </OceanButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatesSection;
