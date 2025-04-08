import React from 'react';

interface TentacleAnimationProps {
  className?: string;
  count?: number;
  position?: 'left' | 'right' | 'bottom';
}

export const TentacleAnimation: React.FC<TentacleAnimationProps> = ({ 
  className = '',
  count = 6,
  position = 'bottom'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full w-1/3';
      case 'right':
        return 'right-0 top-0 h-full w-1/3';
      case 'bottom':
      default:
        return 'bottom-0 left-0 w-full h-1/3';
    }
  };

  return (
    <div className={`absolute overflow-hidden ${getPositionStyles()} ${className}`}>
      {[...Array(count)].map((_, i) => {
        // Calculate different heights based on position
        const height = position === 'bottom' 
          ? `${Math.random() * 200 + 150}px`
          : `${Math.random() * 300 + 200}px`;
        
        // Calculate different positions based on position type
        const positionStyle = position === 'bottom'
          ? { 
              bottom: 0,
              left: `${(i * (100 / count)) + Math.random() * 5}%`,
              transformOrigin: 'bottom'
            }
          : position === 'left'
            ? {
                left: 0,
                top: `${(i * (100 / count)) + Math.random() * 5}%`,
                transformOrigin: 'left center'
              }
            : {
                right: 0,
                top: `${(i * (100 / count)) + Math.random() * 5}%`,
                transformOrigin: 'right center'
              };
        
        // Different animation for different positions
        const animationClass = position === 'bottom'
          ? 'animate-tentacle'
          : 'animate-tentacle-sway';
        
        return (
          <div 
            key={i}
            className={`absolute bg-gradient-to-t from-ocean-highlight to-transparent rounded-full ${animationClass}`}
            style={{
              width: `${Math.random() * 30 + 20}px`,
              height: height,
              ...positionStyle,
              animationDuration: `${Math.random() * 8 + 4}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        );
      })}
    </div>
  );
};
