import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Export for use in components
export { ScrollTrigger };

// Helper function to create scroll-triggered animations
export const createScrollAnimation = (
  trigger: string | Element,
  animation: gsap.core.Timeline | gsap.core.Tween,
  options: ScrollTrigger.Vars = {}
) => {
  return ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    toggleActions: 'play none none reverse',
    ...options,
    animation,
  });
};

// Helper function for parallax effects
export const createParallaxEffect = (
  element: string | Element,
  speed: number = 0.5,
  options: ScrollTrigger.Vars = {}
) => {
  return gsap.to(element, {
    y: () => {
      // Calculate the distance the element should move based on scroll position
      return (ScrollTrigger.maxScroll(window) * speed);
    },
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      ...options,
    },
  });
};

// Helper function for section pinning
export const createPinnedSection = (
  trigger: string | Element,
  duration: number | string = '100%',
  options: ScrollTrigger.Vars = {}
) => {
  return ScrollTrigger.create({
    trigger,
    start: 'top top',
    end: `+=${duration}`,
    pin: true,
    pinSpacing: true,
    ...options,
  });
};

// Helper function for zoom effects
export const createZoomEffect = (
  element: string | Element,
  fromScale: number = 0.8,
  toScale: number = 1,
  options: ScrollTrigger.Vars = {}
) => {
  return gsap.fromTo(
    element,
    { scale: fromScale },
    {
      scale: toScale,
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'center center',
        scrub: true,
        ...options,
      },
    }
  );
};

// Helper function for sequential animations
export const createSequentialAnimation = (
  trigger: string | Element,
  elements: string | Element | (string | Element)[],
  staggerTime: number = 0.1,
  options: ScrollTrigger.Vars = {}
) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top bottom',
      end: 'bottom top',
      toggleActions: 'play none none reverse',
      ...options,
    },
  });

  tl.fromTo(
    elements,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, stagger: staggerTime, duration: 0.8, ease: 'power2.out' }
  );

  return tl;
};
