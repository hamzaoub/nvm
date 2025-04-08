import { createContext, RefObject } from 'react';
import Lenis from 'lenis';

export interface SmoothScrollContextType {
  lenis: RefObject<Lenis | null>;
}

export const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);
