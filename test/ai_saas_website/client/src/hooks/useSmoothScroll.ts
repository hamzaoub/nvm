import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal';
  smoothWheel?: boolean;
  smoothTouch?: boolean;
  infinite?: boolean;
}

export const useSmoothScroll = (options: LenisOptions = {}) => {
  const lenisRef = useRef<Lenis | null>(null);
  
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });
    
    // Integrate with GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update);
    
    // Update ScrollTrigger when Lenis scrolls
    gsap.ticker.add((time) => {
      if (lenisRef.current) {
        lenisRef.current.raf(time * 1000);
      }
    });
    
    // Add Lenis scroll instance to window for debugging
    if (process.env.NODE_ENV === 'development') {
      // Define a type for the window with lenis property
      (window as Window & { lenis?: Lenis }).lenis = lenisRef.current;
    }
    
    // Clean up
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      
      // We need to make sure we're only passing the function if it exists
      const lenisRaf = (window as Window & { lenisRaf?: () => void }).lenisRaf;
      if (lenisRaf) {
        gsap.ticker.remove(lenisRaf);
      }
    };
  }, [options]);
  
  return lenisRef;
};
