import React, { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface SmoothHorizontalScrollProps {
  children: ReactNode;
  className?: string;
  duration?: string | number;
  sections?: number;
  gap?: number;
  snapToSections?: boolean;
}

export const SmoothHorizontalScroll = ({
  children,
  className = '',
  duration = '200%',
  sections = 3,
  gap = 0,
  snapToSections = true,
}: SmoothHorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize smooth scrolling
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Set up animation loop
    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;
    
    // Calculate track width and create animation
    const trackWidth = track.offsetWidth;
    const containerWidth = container.offsetWidth;
    const distance = trackWidth - containerWidth;

    // Create a scroll animation that completely pins the section and controls horizontal scroll
    // Create a scroll trigger that completely pins the section and controls horizontal scroll
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top', // Start when the container hits the top of the viewport
      end: () => `+=${distance}`, // End after scrolling the full width of content
      pin: true, // Pin the section while scrolling horizontally
      anticipatePin: 1,
      scrub: true, // Smooth scrubbing effect
      pinSpacing: true, // Maintains the space in the document
      refreshPriority: 1,
      invalidateOnRefresh: true,
      snap: snapToSections ? {
        snapTo: 1 / (sections - 1),
        duration: { min: 0.1, max: 0.3 },
        directional: false // Snap in both directions
      } : undefined,
      pinReparent: true, // Fix for z-index stacking issues
      markers: false, // For debugging, set to true if needed
      onUpdate: (self) => {
        // Update progress bar width based on scroll progress
        const progressBar = document.getElementById('horizontal-progress');
        if (progressBar) {
          progressBar.style.width = `${self.progress * 100}%`;
        }
      }
    });
    
    // Create the horizontal animation and link it to the scrollTrigger
    const horizontalScroll = gsap.to(track, {
      x: -distance,
      ease: 'none',
      scrollTrigger: scrollTrigger
    });
    
    // Additional configuration for touch devices
    if ('ontouchstart' in window) {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    return () => {
      // Clean up all animations and scroll triggers
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
      horizontalScroll.kill();
      
      // Reset ScrollTrigger config
      ScrollTrigger.config({
        ignoreMobileResize: false
      });
    };
  }, [duration, sections, snapToSections]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full ${className}`}
      style={{ 
        height: 'auto', 
        minHeight: '100vh' // Full viewport height for proper pinning
      }}
    >
      <div 
        className="w-full py-4 bg-gradient-to-r from-[#051e2f]/40 to-transparent sticky top-0 z-20 px-4"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="h-1 w-full bg-[#0077b6]/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] transition-all duration-300"
            style={{ width: '0%' }} // Will be controlled by JS in ScrollTrigger
            id="horizontal-progress"
          />
        </div>
      </div>
      <div
        ref={trackRef}
        className="flex pt-4"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>
    </div>
  );
};

export default SmoothHorizontalScroll;
