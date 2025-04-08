import React from 'react';

interface BubbleAnimationProps {
  className?: string;
  count?: number;
  size?: 'small' | 'medium' | 'large' | 'mixed';
  opacity?: number;
}

export const BubbleAnimation: React.FC<BubbleAnimationProps> = ({ 
  className = '',
  count = 15,
  size = 'mixed',
  opacity = 0.2
}) => {
  const getBubbleSize = (index: number) => {
    switch (size) {
      case 'small':
        return {
          width: `${Math.random() * 20 + 5}px`,
          height: `${Math.random() * 20 + 5}px`,
        };
      case 'medium':
        return {
          width: `${Math.random() * 30 + 20}px`,
          height: `${Math.random() * 30 + 20}px`,
        };
      case 'large':
        return {
          width: `${Math.random() * 50 + 40}px`,
          height: `${Math.random() * 50 + 40}px`,
        };
      case 'mixed':
      default:
        // Create different size groups
        if (index % 3 === 0) {
          return {
            width: `${Math.random() * 50 + 30}px`,
            height: `${Math.random() * 50 + 30}px`,
          };
        } else if (index % 3 === 1) {
          return {
            width: `${Math.random() * 30 + 15}px`,
            height: `${Math.random() * 30 + 15}px`,
          };
        } else {
          return {
            width: `${Math.random() * 15 + 5}px`,
            height: `${Math.random() * 15 + 5}px`,
          };
        }
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => {
        const bubbleSize = getBubbleSize(i);
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        return (
          <div 
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              ...bubbleSize,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(144, 224, 239, ${opacity})`,
              boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(0, 180, 216, 0.3)',
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
    </div>
  );
};
