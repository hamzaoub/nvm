import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MouseReactiveEffectProps {
  className?: string;
}

export const MouseReactiveEffect = ({ className = '' }: MouseReactiveEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      // Get container position
      const containerRect = container.getBoundingClientRect();
      
      // Calculate mouse position relative to container
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      // Calculate center of container
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      // Calculate distance from mouse to center (normalized)
      const distanceX = (mouseX - centerX) / centerX;
      const distanceY = (mouseY - centerY) / centerY;
      
      // Animate each element based on mouse position
      elementsRef.current.forEach((element, index) => {
        const depth = index + 1;
        const moveX = distanceX * 20 * depth;
        const moveY = distanceY * 20 * depth;
        const rotateX = -distanceY * 10;
        const rotateY = distanceX * 10;
        
        gsap.to(element, {
          x: moveX,
          y: moveY,
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.8,
          ease: "power2.out"
        });
      });
    };
    
    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Function to add elements to the ref array
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative perspective-[1000px] ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div 
        ref={addToRefs}
        className="reactive-element absolute bg-[#051e2f]/20 rounded-full"
        style={{ 
          width: '200px', 
          height: '200px', 
          top: '20%', 
          left: '30%',
          backdropFilter: 'blur(5px)',
          transformStyle: 'preserve-3d'
        }}
      />
      <div 
        ref={addToRefs}
        className="reactive-element absolute bg-[#0a3a5a]/20 rounded-full"
        style={{ 
          width: '150px', 
          height: '150px', 
          top: '40%', 
          left: '60%',
          backdropFilter: 'blur(3px)',
          transformStyle: 'preserve-3d'
        }}
      />
      <div 
        ref={addToRefs}
        className="reactive-element absolute bg-[#00b4d8]/20 rounded-full"
        style={{ 
          width: '120px', 
          height: '120px', 
          top: '60%', 
          left: '40%',
          backdropFilter: 'blur(4px)',
          transformStyle: 'preserve-3d'
        }}
      />
    </div>
  );
};

export default MouseReactiveEffect;
