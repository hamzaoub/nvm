import { useContext } from 'react';
import { SmoothScrollContext } from '@/contexts/SmoothScrollContext';

export const useSmoothScrollContext = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error('useSmoothScrollContext must be used within a SmoothScrollProvider');
  }
  return context;
};
