import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { ThumbsUp } from 'lucide-react';
import { Suggestion } from '@/types/dashboard';

interface UpdateCardProps {
  suggestion: Suggestion;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ suggestion }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#0077b6]/30 bg-[#0c2e44]/80 backdrop-blur-sm transition-all duration-300 hover:border-[#00b4d8]/50 hover:shadow-lg hover:shadow-[#00b4d8]/10">
      {/* Card header with status badge */}
      <div className="relative">
        {/* Status indicator badge */}
        <div className="absolute right-3 top-3 z-10">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            suggestion.status === 'implemented' ? 'bg-green-500/20 text-green-400' : 
            suggestion.status === 'planned' ? 'bg-blue-500/20 text-blue-400' : 
            suggestion.status === 'under-review' ? 'bg-amber-500/20 text-amber-400' : 
            'bg-purple-500/20 text-purple-400'
          }`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              suggestion.status === 'implemented' ? 'bg-green-400' : 
              suggestion.status === 'planned' ? 'bg-blue-400' : 
              suggestion.status === 'under-review' ? 'bg-amber-400' : 
              'bg-purple-400'
            }`}></span>
            {suggestion.status === 'implemented' ? 'Implemented' : 
             suggestion.status === 'planned' ? 'Planned' : 
             suggestion.status === 'under-review' ? 'Under Review' : 'New'}
          </span>
        </div>
        
        {/* Card header background - gradient overlay */}
        <div className={`h-1.5 w-full ${
          suggestion.status === 'implemented' ? 'bg-gradient-to-r from-green-500 to-green-400' : 
          suggestion.status === 'planned' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
          suggestion.status === 'under-review' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
          'bg-gradient-to-r from-purple-500 to-purple-400'
        }`}></div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white group-hover:text-[#00b4d8]">{suggestion.title}</h3>
        </div>
        
        <p className="mb-4 text-sm text-[#ade8f4] line-clamp-3">{suggestion.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#051e2f] text-[#90e0ef]">
              <FaLightbulb className="h-3 w-3" />
            </div>
            <span className="text-xs text-[#90e0ef]">{suggestion.author}</span>
          </div>
          
          {/* Vote button */}
          <button className="inline-flex items-center rounded-full bg-[#051e2f] px-2 py-1 text-sm text-[#ade8f4] hover:bg-[#0a3a5a]">
            <ThumbsUp className="mr-1 h-3 w-3" />
            <span>{suggestion.votes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCard;
