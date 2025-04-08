import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BlobAnimationProps {
  className?: string;
}

export const BlobAnimation = ({ className = '' }: BlobAnimationProps) => {
  const blobRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!blobRef.current) return;
    
    // Create a timeline for the animation
    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });
    
    // Animate the blob path
    const blob = blobRef.current.querySelector('path');
    if (!blob) return;
    
    // Initial animation
    timeline.to(blob, {
      duration: 8,
      ease: "sine.inOut",
      attr: {
        d: "M60.5,-49.3C71.9,-33.2,71.2,-8.1,63.3,12.1C55.4,32.3,40.3,47.6,21.2,57.5C2.1,67.3,-21,71.8,-40.6,62.6C-60.2,53.5,-76.3,30.7,-78.1,7.3C-79.9,-16.1,-67.4,-40.1,-49.6,-55.7C-31.8,-71.3,-8.7,-78.4,11.6,-76.2C31.9,-74,49.1,-65.3,60.5,-49.3Z"
      }
    });
    
    // Second animation
    timeline.to(blob, {
      duration: 8,
      ease: "sine.inOut",
      attr: {
        d: "M53.4,-46.4C65.2,-30,68.2,-7.9,63.8,12.3C59.4,32.5,47.6,50.8,30.1,60.7C12.6,70.6,-10.7,72.1,-30.3,63.3C-49.9,54.5,-65.8,35.4,-70.6,13.6C-75.4,-8.2,-69.1,-32.6,-54.9,-48.8C-40.7,-65,-20.3,-72.9,0.2,-73.1C20.8,-73.2,41.5,-62.7,53.4,-46.4Z"
      }
    });
    
    // Third animation
    timeline.to(blob, {
      duration: 8,
      ease: "sine.inOut",
      attr: {
        d: "M48.7,-46.8C58.9,-31.8,60.8,-12.6,59.1,7.8C57.4,28.2,52.1,49.7,38.1,60.2C24.1,70.7,1.3,70.1,-19.9,63.3C-41.1,56.4,-60.7,43.2,-68.4,24.3C-76.1,5.5,-71.9,-19,-59.9,-36.9C-47.9,-54.9,-28.1,-66.2,-7.9,-64.8C12.3,-63.4,38.5,-61.9,48.7,-46.8Z"
      }
    });
    
    // Return to original shape
    timeline.to(blob, {
      duration: 8,
      ease: "sine.inOut",
      attr: {
        d: "M47.3,-44.2C58.2,-29.4,62.1,-9.5,58.5,8.9C54.9,27.3,43.8,44.3,28.2,54.2C12.6,64.1,-7.5,67,-26.1,60.9C-44.8,54.9,-62,39.9,-68.2,21.1C-74.4,2.3,-69.6,-20.4,-57.1,-35.8C-44.6,-51.3,-24.5,-59.5,-3.9,-57.1C16.7,-54.7,36.4,-59,47.3,-44.2Z"
      }
    });
    
    return () => {
      timeline.kill();
    };
  }, []);
  
  return (
    <svg 
      ref={blobRef}
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute ${className}`}
      style={{ filter: 'blur(15px)' }}
    >
      <path
        fill="rgba(0, 180, 216, 0.35)"
        d="M47.3,-44.2C58.2,-29.4,62.1,-9.5,58.5,8.9C54.9,27.3,43.8,44.3,28.2,54.2C12.6,64.1,-7.5,67,-26.1,60.9C-44.8,54.9,-62,39.9,-68.2,21.1C-74.4,2.3,-69.6,-20.4,-57.1,-35.8C-44.6,-51.3,-24.5,-59.5,-3.9,-57.1C16.7,-54.7,36.4,-59,47.3,-44.2Z"
        transform="translate(100 100)"
      />
    </svg>
  );
};

export default BlobAnimation;
