import React, { useState, useEffect } from 'react';
import { FaOctopusDeploy } from 'react-icons/fa';

interface Position {
  x: number;
  y: number;
}

export const OctopusFollower: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setLastMouseMove(Date.now());
      setIsVisible(true);
      setIsMoving(true);
      
      // Add a slight delay to create a trailing effect
      setTimeout(() => {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
      }, 100);
    };

    // Check if mouse has been idle
    const checkIdle = setInterval(() => {
      if (Date.now() - lastMouseMove > 2000) {
        setIsMoving(false);
      }
    }, 500);

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(checkIdle);
    };
  }, [lastMouseMove]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50 transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className={`relative ${isMoving ? 'animate-followCursor' : 'animate-float'}`}>
        <FaOctopusDeploy 
          className="text-[#00b4d8] opacity-70"
          style={{ 
            fontSize: '2rem',
            filter: 'drop-shadow(0 0 8px rgba(0, 180, 216, 0.7))'
          }} 
        />
        
        {/* Tentacle trails */}
        {isMoving && (
          <>
            <div className="absolute w-1.5 h-8 rounded-full bg-[#00b4d8]/20 blur-sm"
                style={{ top: '50%', left: '30%', transform: 'rotate(45deg) translateY(10px)' }} />
            <div className="absolute w-1.5 h-6 rounded-full bg-[#00b4d8]/20 blur-sm"
                style={{ top: '50%', left: '60%', transform: 'rotate(-45deg) translateY(8px)' }} />
            <div className="absolute w-1.5 h-10 rounded-full bg-[#00b4d8]/20 blur-sm"
                style={{ top: '60%', left: '45%', transform: 'translateY(5px)' }} />
          </>
        )}
      </div>
    </div>
  );
};
