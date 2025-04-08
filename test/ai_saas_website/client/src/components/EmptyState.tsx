import React from 'react';
import { FaOctopusDeploy } from 'react-icons/fa';
import { OceanButton } from '@/components/OceanButton';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Projects Found',
  description = 'You haven\'t created any AI projects yet. Start by creating your first project.',
  actionLabel = 'Create Project',
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 bg-[#051e2f]/60 rounded-xl sm:rounded-2xl border border-[#0077b6]/30 backdrop-blur-sm relative">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0077b6]/20 to-[#00b4d8]/20 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#0077b6]/30 to-[#00b4d8]/30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#0077b6]/40 to-[#00b4d8]/40 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <FaOctopusDeploy className="absolute inset-0 m-auto text-3xl sm:text-4xl text-[#00b4d8]" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{title}</h3>
      
      <p className="text-sm sm:text-base text-[#ade8f4] max-w-md mb-5 sm:mb-8 px-2">{description}</p>
      
      {onAction && (
        <OceanButton 
          onClick={onAction}
          className="text-sm sm:text-base py-1.5 px-4 sm:py-2 sm:px-5"
        >
          {actionLabel}
        </OceanButton>
      )}
      
      {/* Animated water bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(10)].map((_, i) => {
          // Generate deterministic but varied values based on index
          const size = 5 + ((i * 7) % 15);
          const leftPos = ((i * 17) % 100);
          const bottomPos = ((i * 13) % 30);
          const duration = 3 + ((i * 3) % 5);
          const delay = (i * 0.3) % 2;
          
          return (
            <div 
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${leftPos}%`,
                bottom: `${bottomPos}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default EmptyState;
