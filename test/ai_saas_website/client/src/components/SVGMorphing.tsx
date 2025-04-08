import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '@/utils/gsapPlugins';

interface SVGMorphingProps {
  className?: string;
}

export const SVGMorphing = ({ className = '' }: SVGMorphingProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const paths = svgRef.current.querySelectorAll('path');
    
    // Create a timeline for morphing animation
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });
    
    // Get the path data for each shape
    const path1Data = paths[0].getAttribute('d') || '';
    const path2Data = paths[1].getAttribute('d') || '';
    const path3Data = paths[2].getAttribute('d') || '';
    const path4Data = paths[3].getAttribute('d') || '';
    
    // First shape to second shape
    timeline.add(gsap.effects.morphSVG(paths[0], {
      toPath: path2Data,
      duration: 3,
      ease: "sine.inOut"
    }));
    
    // Second shape to third shape
    timeline.add(gsap.effects.morphSVG(paths[0], {
      toPath: path3Data,
      duration: 3,
      ease: "sine.inOut"
    }));
    
    // Third shape to fourth shape
    timeline.add(gsap.effects.morphSVG(paths[0], {
      toPath: path4Data,
      duration: 3,
      ease: "sine.inOut"
    }));
    
    // Fourth shape back to first shape
    timeline.add(gsap.effects.morphSVG(paths[0], {
      toPath: path1Data,
      duration: 3,
      ease: "sine.inOut"
    }));
    
    // Hide all paths except the first one
    gsap.set(paths[1], { visibility: 'hidden' });
    gsap.set(paths[2], { visibility: 'hidden' });
    gsap.set(paths[3], { visibility: 'hidden' });
    
    return () => {
      timeline.kill();
    };
  }, []);
  
  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
    >
      {/* Initial shape - octopus-like */}
      <path
        id="shape1"
        fill="rgba(0, 180, 216, 0.5)"
        d="M54.5,-46.1C68.2,-29.9,75.9,-5.9,71.5,15.5C67.1,36.9,50.7,55.8,30.6,65.2C10.5,74.6,-13.2,74.5,-33.2,65.2C-53.2,55.8,-69.5,37.2,-73.9,15.8C-78.3,-5.6,-70.8,-29.8,-56.4,-46.1C-42,-62.3,-20.8,-70.6,0.9,-71.3C22.6,-72,40.8,-62.2,54.5,-46.1Z"
        transform="translate(100 100)"
      />
      
      {/* Second shape - more tentacles */}
      <path
        id="shape2"
        fill="rgba(0, 180, 216, 0.5)"
        d="M43.1,-34.6C55.7,-19.3,65.7,0.2,62.2,17.5C58.7,34.8,41.8,49.9,22.4,57.6C3,65.3,-18.9,65.6,-35.7,56.2C-52.5,46.8,-64.2,27.7,-66.3,7.7C-68.4,-12.3,-60.9,-33.2,-46.8,-48C-32.6,-62.8,-11.8,-71.5,3.9,-74.5C19.7,-77.5,30.5,-49.9,43.1,-34.6Z"
        transform="translate(100 100)"
      />
      
      {/* Third shape - flowing wave */}
      <path
        id="shape3"
        fill="rgba(0, 180, 216, 0.5)"
        d="M47.3,-44.2C58.2,-29.4,62.1,-9.5,58.5,8.9C54.9,27.3,43.8,44.3,28.2,54.2C12.6,64.1,-7.5,67,-26.1,60.9C-44.8,54.9,-62,39.9,-68.2,21.1C-74.4,2.3,-69.6,-20.4,-57.1,-35.8C-44.6,-51.3,-24.5,-59.5,-3.9,-57.1C16.7,-54.7,36.4,-59,47.3,-44.2Z"
        transform="translate(100 100)"
      />
      
      {/* Fourth shape - ocean current */}
      <path
        id="shape4"
        fill="rgba(0, 180, 216, 0.5)"
        d="M48.7,-46.8C58.9,-31.8,60.8,-12.6,59.1,7.8C57.4,28.2,52.1,49.7,38.1,60.2C24.1,70.7,1.3,70.1,-19.9,63.3C-41.1,56.4,-60.7,43.2,-68.4,24.3C-76.1,5.5,-71.9,-19,-59.9,-36.9C-47.9,-54.9,-28.1,-66.2,-7.9,-64.8C12.3,-63.4,38.5,-61.9,48.7,-46.8Z"
        transform="translate(100 100)"
      />
    </svg>
  );
};

export default SVGMorphing;
