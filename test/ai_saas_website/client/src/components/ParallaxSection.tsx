import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  zIndex?: number;
}

export const ParallaxSection = ({
  children,
  className = '',
  speed = 0.3,
  direction = 'up',
  zIndex = 1,
}: ParallaxSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    // Determine the movement direction
    const yMovement = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    const xMovement = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

    // Calculate the distance to move
    const distance = 100 * speed;

    // Create the parallax effect
    const parallaxEffect = gsap.to(contentRef.current, {
      y: yMovement * distance,
      x: xMovement * distance,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      // Clean up the animation
      if (parallaxEffect.scrollTrigger) {
        parallaxEffect.scrollTrigger.kill();
      }
      parallaxEffect.kill();
    };
  }, [speed, direction]);

  return (
    <div
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
      style={{ zIndex }}
    >
      <div
        ref={contentRef}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
