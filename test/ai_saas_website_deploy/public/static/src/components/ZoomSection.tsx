import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from '../utils/scrollTrigger';

interface ZoomSectionProps {
  children: React.ReactNode;
  className?: string;
  fromScale?: number;
  toScale?: number;
  duration?: string | number;
  pin?: boolean;
  pinSpacing?: boolean;
  scrub?: boolean | number;
  zIndex?: number;
}

export const ZoomSection = ({
  children,
  className = '',
  fromScale = 0.8,
  toScale = 1.2,
  duration = '100%',
  pin = false,
  pinSpacing = true,
  scrub = true,
  zIndex = 1,
}: ZoomSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const section = sectionRef.current;
    const content = contentRef.current;

    // Create the zoom animation
    const zoomAnimation = gsap.fromTo(
      content,
      { scale: fromScale },
      {
        scale: toScale,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: pin ? `+=${duration}` : 'bottom top',
          pin,
          pinSpacing,
          scrub,
        },
      }
    );

    return () => {
      if (zoomAnimation.scrollTrigger) {
        zoomAnimation.scrollTrigger.kill();
      }
      zoomAnimation.kill();
    };
  }, [fromScale, toScale, duration, pin, pinSpacing, scrub]);

  return (
    <div
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
      style={{ zIndex }}
    >
      <div
        ref={contentRef}
        className="w-full h-full origin-center"
      >
        {children}
      </div>
    </div>
  );
};

export default ZoomSection;
