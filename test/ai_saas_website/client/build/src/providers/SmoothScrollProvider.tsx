import { ReactNode } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { SmoothScrollContext } from '@/contexts/SmoothScrollContext';

interface SmoothScrollProviderProps {
  children: ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: 'vertical' | 'horizontal';
    gestureOrientation?: 'vertical' | 'horizontal';
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    infinite?: boolean;
  };
}

export const SmoothScrollProvider = ({ 
  children, 
  options = {} 
}: SmoothScrollProviderProps) => {
  const lenis = useSmoothScroll(options);
  
  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

// Hook moved to a separate file for better React Fast Refresh compatibility
