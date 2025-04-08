import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

type AnimationType = 
  | 'fade-in' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'rotate'
  | 'flip';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  distance?: number;
  scale?: number;
  rotation?: number;
}

export const ScrollReveal = ({
  children,
  className = '',
  animation = 'fade-in',
  delay = 0,
  duration = 0.8,
  threshold = 0.2,
  once = true,
  distance = 50,
  scale = 0.9,
  rotation = 15,
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Set initial state based on animation type
    const initialProps: gsap.TweenVars = { opacity: 0 };
    const animatedProps: gsap.TweenVars = { opacity: 1, duration, delay, ease: 'power2.out' };

    switch (animation) {
      case 'slide-up':
        initialProps.y = distance;
        animatedProps.y = 0;
        break;
      case 'slide-down':
        initialProps.y = -distance;
        animatedProps.y = 0;
        break;
      case 'slide-left':
        initialProps.x = distance;
        animatedProps.x = 0;
        break;
      case 'slide-right':
        initialProps.x = -distance;
        animatedProps.x = 0;
        break;
      case 'zoom-in':
        initialProps.scale = scale;
        animatedProps.scale = 1;
        break;
      case 'zoom-out':
        initialProps.scale = 1 + (1 - scale);
        animatedProps.scale = 1;
        break;
      case 'rotate':
        initialProps.rotation = rotation;
        animatedProps.rotation = 0;
        break;
      case 'flip':
        initialProps.rotationX = rotation * 2;
        animatedProps.rotationX = 0;
        break;
      default:
        // fade-in is the default
        break;
    }

    // Set initial state
    gsap.set(element, initialProps);

    // Create the scroll trigger animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: `top bottom-=${threshold * 100}%`,
      onEnter: () => {
        gsap.to(element, animatedProps);
        setIsVisible(true);
        if (once) scrollTrigger.kill();
      },
      onLeaveBack: () => {
        if (!once) {
          gsap.to(element, initialProps);
          setIsVisible(false);
        }
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [animation, delay, duration, threshold, once, distance, scale, rotation]);

  return (
    <div
      ref={elementRef}
      className={`${className}`}
      style={{ visibility: 'visible' }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
