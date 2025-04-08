import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  text: string;
  className?: string;
  charClassName?: string;
  wordClassName?: string;
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  once?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const TextReveal = ({
  text,
  className = '',
  charClassName = '',
  wordClassName = '',
  type = 'chars',
  stagger = 0.03,
  duration = 0.8,
  delay = 0,
  threshold = 0.2,
  once = true,
  direction = 'up',
  distance = 20,
}: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLSpanElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Split text into elements based on type
  const splitText = () => {
    if (type === 'chars') {
      return text.split('').map((char, index) => (
        <span 
          key={index} 
          ref={(el) => el && elementsRef.current.push(el)}
          className={`inline-block ${charClassName}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else if (type === 'words') {
      return text.split(' ').map((word, index) => (
        <span 
          key={index} 
          ref={(el) => el && elementsRef.current.push(el)}
          className={`inline-block ${wordClassName}`}
        >
          {word}
          {index < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ));
    } else {
      // For lines, we'll use a container and let CSS handle the line breaks
      return (
        <span 
          ref={(el) => el && elementsRef.current.push(el)}
          className="block"
        >
          {text}
        </span>
      );
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Reset the elements ref array
    elementsRef.current = [];
    
    // Wait for the next frame to ensure refs are populated
    requestAnimationFrame(() => {
      const elements = elementsRef.current;
      if (elements.length === 0) return;

      // Set initial state based on direction
      const initialProps: gsap.TweenVars = { opacity: 0 };
      const animatedProps: gsap.TweenVars = { 
        opacity: 1, 
        duration, 
        stagger, 
        delay, 
        ease: 'power2.out' 
      };

      switch (direction) {
        case 'up':
          initialProps.y = distance;
          animatedProps.y = 0;
          break;
        case 'down':
          initialProps.y = -distance;
          animatedProps.y = 0;
          break;
        case 'left':
          initialProps.x = distance;
          animatedProps.x = 0;
          break;
        case 'right':
          initialProps.x = -distance;
          animatedProps.x = 0;
          break;
      }

      // Set initial state
      gsap.set(elements, initialProps);

      // Create the scroll trigger animation
      const scrollTrigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: `top bottom-=${threshold * 100}%`,
        onEnter: () => {
          gsap.to(elements, animatedProps);
          setIsVisible(true);
          if (once) scrollTrigger.kill();
        },
        onLeaveBack: () => {
          if (!once) {
            gsap.to(elements, initialProps);
            setIsVisible(false);
          }
        },
      });

      return () => {
        scrollTrigger.kill();
      };
    });
  }, [text, type, stagger, duration, delay, threshold, once, direction, distance]);

  return (
    <div
      ref={containerRef}
      className={`${className}`}
      style={{ visibility: 'visible' }}
    >
      {splitText()}
    </div>
  );
};

export default TextReveal;
