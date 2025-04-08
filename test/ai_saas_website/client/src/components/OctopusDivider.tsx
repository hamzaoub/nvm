import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaOctopusDeploy } from 'react-icons/fa';

interface OctopusDividerProps {
  id?: string;
  direction?: 'down' | 'up';
  color?: string;
  className?: string;
}

export const OctopusDivider: React.FC<OctopusDividerProps> = ({
  id,
  direction = 'down',
  color = '#00b4d8',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Create more complex movement patterns for the octopus
  const xMovement = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    direction === 'down' ? ['0%', '-5%', '0%'] : ['0%', '5%', '0%']
  );
  
  // Y movement depends on scroll position and direction
  const yPosition = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'down' ? ['0%', '100%'] : ['100%', '0%']
  );
  
  // Rotation effect based on direction and scroll
  const rotation = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    direction === 'down' ? [0, -15, 15, 0] : [0, 15, -15, 0]
  );
  
  // Scale effect for "swimming" motion
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [1, 1.1, 0.9, 1.1, 0.9, 1]
  );

  // Observe element to check if it's in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById(id || 'octopus-divider');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [id]);

  return (
    <div 
      id={id || 'octopus-divider'} 
      className={`relative w-full h-40 overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${direction === 'down' ? '180deg' : '0deg'}, #051e2f 0%, #0a3a5a 100%)`,
      }}
    >
      {/* Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => {
          const size = Math.random() * 20 + 10;
          const delay = Math.random() * 2;
          const duration = Math.random() * 3 + 3;
          const leftPos = Math.random() * 100;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: size,
                height: size,
                left: `${leftPos}%`,
                bottom: '-20px',
                boxShadow: 'inset 0 0 5px rgba(255,255,255,0.5)',
              }}
              initial={{ y: '100%', opacity: 0 }}
              animate={isVisible ? { 
                y: '-100%', 
                opacity: [0, 0.7, 0] 
              } : {}}
              transition={{
                duration: duration,
                delay: delay,
                ease: 'easeOut',
                repeat: Infinity,
                repeatDelay: delay
              }}
            />
          );
        })}
      </div>
      
      {/* Octopus */}
      <motion.div
        className="absolute z-10 transform -translate-x-1/2"
        style={{
          x: xMovement,
          y: yPosition,
          rotateZ: rotation,
          scale: scale,
          left: '50%',
        }}
      >
        <div className="relative">
          <FaOctopusDeploy 
            style={{ color, fontSize: '4rem' }}
            className="filter drop-shadow-lg"
          />
          
          {/* Tentacle trails */}
          <motion.div 
            className="absolute w-1.5 h-10 rounded-full opacity-70"
            style={{ 
              backgroundColor: color,
              top: '60%',
              left: '30%',
              filter: 'blur(2px)',
              transformOrigin: 'top'
            }}
            animate={{
              scaleY: [1, 1.2, 0.8, 1],
              rotate: direction === 'down' ? [0, 10, -10, 0] : [0, -10, 10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-1.5 h-8 rounded-full opacity-70"
            style={{ 
              backgroundColor: color,
              top: '60%',
              left: '70%',
              filter: 'blur(2px)',
              transformOrigin: 'top'
            }}
            animate={{
              scaleY: [1, 0.8, 1.2, 1],
              rotate: direction === 'down' ? [0, -10, 10, 0] : [0, 10, -10, 0]
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
      
      {/* Wave overlay */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          width="100%" 
          height="30" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 74"
          className={direction === 'down' ? '' : 'rotate-180'}
        >
          <path 
            d="M0 20L60 27.3C120 34.7 240 49.3 360 57.7C480 66 600 68 720 65.3C840 62.7 960 55.3 1080 49.7C1200 44 1320 40 1380 38L1440 36V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V20Z" 
            fill={direction === 'down' ? '#0c2e44' : '#051e2f'} 
          />
        </svg>
      </div>
    </div>
  );
};
