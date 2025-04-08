import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GooeyEffectProps {
  className?: string;
}

export const GooeyEffect = ({ className = '' }: GooeyEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const circles = containerRef.current.querySelectorAll('.gooey-circle');
    
    circles.forEach((circle, index) => {
      // Create random animation parameters for each circle
      const duration = 10 + Math.random() * 15;
      const delay = Math.random() * 5;
      const xMovement = 30 + Math.random() * 40;
      const yMovement = 30 + Math.random() * 40;
      
      // Animate each circle
      gsap.to(circle, {
        x: `+=${xMovement * (index % 2 === 0 ? 1 : -1)}`,
        y: `+=${yMovement * (index % 3 === 0 ? 1 : -1)}`,
        duration: duration,
        delay: delay,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
    
    return () => {
      gsap.killTweensOf(circles);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        filter: 'url(#gooey)',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* SVG filter for gooey effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
              result="gooey" 
            />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>
      
      {/* Gooey circles */}
      <div 
        className="gooey-circle absolute rounded-full bg-[#00b4d8]/40" 
        style={{ width: '120px', height: '120px', top: '20%', left: '30%' }}
      />
      <div 
        className="gooey-circle absolute rounded-full bg-[#0077b6]/40" 
        style={{ width: '80px', height: '80px', top: '40%', left: '20%' }}
      />
      <div 
        className="gooey-circle absolute rounded-full bg-[#90e0ef]/40" 
        style={{ width: '100px', height: '100px', top: '30%', left: '50%' }}
      />
      <div 
        className="gooey-circle absolute rounded-full bg-[#00b4d8]/30" 
        style={{ width: '150px', height: '150px', top: '50%', left: '60%' }}
      />
      <div 
        className="gooey-circle absolute rounded-full bg-[#0077b6]/30" 
        style={{ width: '90px', height: '90px', top: '60%', left: '40%' }}
      />
    </div>
  );
};

export default GooeyEffect;
