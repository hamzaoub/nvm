import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface PinnedSectionProps {
  children: React.ReactNode;
  className?: string;
  duration?: string | number;
  pinSpacing?: boolean;
  background?: boolean;
  backgroundColors?: string[];
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const PinnedSection = ({
  children,
  className = '',
  duration = '100%',
  pinSpacing = true,
  background = false,
  backgroundColors = ['#051e2f', '#0a3a5a', '#0c4c74', '#00b4d8'],
  onEnter,
  onLeave,
  onEnterBack,
  onLeaveBack,
}: PinnedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Create the pinned section
    const pinned = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${duration}`,
      pin: true,
      pinSpacing,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
      onEnter: onEnter,
      onLeave: onLeave,
      onEnterBack: onEnterBack,
      onLeaveBack: onLeaveBack,
    });

    // Create background color animation if enabled
    let backgroundAnim: gsap.core.Timeline | null = null;
    
    if (background && backgroundRef.current && backgroundColors.length > 1) {
      backgroundAnim = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${duration}`,
          scrub: true,
        }
      });

      // Add color transitions
      const colorSteps = 1 / (backgroundColors.length - 1);
      
      backgroundColors.forEach((color, index) => {
        if (index < backgroundColors.length - 1) {
          backgroundAnim?.to(backgroundRef.current, {
            backgroundColor: backgroundColors[index + 1],
            duration: colorSteps,
            ease: 'none',
          });
        }
      });
    }

    return () => {
      pinned.kill();
      if (backgroundAnim && backgroundAnim.scrollTrigger) {
        backgroundAnim.scrollTrigger.kill();
      }
    };
  }, [duration, pinSpacing, background, backgroundColors, onEnter, onLeave, onEnterBack, onLeaveBack]);

  return (
    <div className="relative">
      {background && (
        <div 
          ref={backgroundRef}
          className="fixed inset-0 z-0 transition-colors duration-300"
          style={{ backgroundColor: backgroundColors[0] }}
        />
      )}
      <div
        ref={sectionRef}
        className={`relative z-10 ${className}`}
        data-scroll-progress={progress}
      >
        {children}
      </div>
    </div>
  );
};

export default PinnedSection;
