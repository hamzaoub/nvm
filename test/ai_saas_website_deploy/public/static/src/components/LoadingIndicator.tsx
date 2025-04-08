import React from 'react';
import { Loader2 } from 'lucide-react';
import { FaOctopusDeploy } from 'react-icons/fa';

interface LoadingIndicatorProps {
  text?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  text = 'Loading', 
  className = '',
  size = 'medium'
}) => {
  // Determine size classes based on the size prop
  const sizeClasses = {
    small: {
      container: 'p-3 sm:p-4',
      loader: 'h-6 w-6 sm:h-8 sm:w-8',
      icon: 'text-sm',
      text: 'text-xs sm:text-sm mt-2',
      bubbleCount: 4
    },
    medium: {
      container: 'p-4 sm:p-6',
      loader: 'h-8 w-8 sm:h-12 sm:w-12',
      icon: 'text-base sm:text-lg',
      text: 'text-sm sm:text-base mt-2 sm:mt-3',
      bubbleCount: 6
    },
    large: {
      container: 'p-6 sm:p-8',
      loader: 'h-12 w-12 sm:h-16 sm:w-16',
      icon: 'text-lg sm:text-xl',
      text: 'text-base sm:text-lg mt-3 sm:mt-4',
      bubbleCount: 8
    }
  };

  const { container, loader, icon, text: textClass, bubbleCount } = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${container} ${className} relative`}>
      <div className="relative">
        <Loader2 className={`${loader} animate-spin text-[#00b4d8]`} aria-hidden="true" />
        <FaOctopusDeploy className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${icon} text-[#ade8f4]`} aria-hidden="true" />
      </div>
      {text && <p className={`${textClass} text-[#90e0ef] animate-pulse`} aria-live="polite">{text}</p>}
      
      {/* Bubbles for oceanic effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(bubbleCount)].map((_, i) => {
          // Generate random properties but with a stable key for React
          const width = (Math.sin(i * 3.14159) * 15 + 5) + (i % 3) * 5;
          const height = width; // Keep bubbles perfectly round
          const left = ((i * 17) % 100);
          const top = ((i * 23) % 100);
          const duration = (i % 5) + 3;
          const delay = (i % 3) * 0.6;
          
          return (
            <div 
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}%`,
                top: `${top}%`,
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

export default LoadingIndicator;
