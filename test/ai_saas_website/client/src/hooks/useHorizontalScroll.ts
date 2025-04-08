import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

interface UseHorizontalScrollOptions {
  sectionSelector?: string;
  wrapperSelector?: string;
  itemsSelector?: string;
  containerSelector?: string;
}

const useHorizontalScroll = ({
  sectionSelector = '#sectionPin',
  wrapperSelector = '.pin-wrap',
  itemsSelector = '.pin-wrap > *',
  containerSelector = '#pageContainer'
}: UseHorizontalScrollOptions = {}) => {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    
    // Find elements
    const pageContainerElement = document.querySelector(containerSelector) || document.documentElement;
    const section = document.querySelector(sectionSelector);
    
    if (!section) {
      console.error(`Element with selector ${sectionSelector} not found.`);
      return;
    }
    
    // Wait for everything to be ready
    const setupScrollTrigger = () => {
      const pinBoxes = document.querySelectorAll(itemsSelector);
      const pinWrap = document.querySelector(wrapperSelector);
      
      if (!pinWrap || pinBoxes.length === 0) {
        console.error('Pin wrap or pin boxes not found.');
        return;
      }
      
      // Calculate width
      const pinWrapWidth = pinWrap.scrollWidth;
      const horizontalScrollLength = pinWrapWidth - window.innerWidth;
      
      // Create the ScrollTrigger for horizontal scrolling
      gsap.to(wrapperSelector, {
        scrollTrigger: {
          scroller: pageContainerElement, // Use the page container for scrolling
          scrub: true,
          trigger: sectionSelector,
          pin: true,
          start: "top top",
          end: () => `+=${horizontalScrollLength}`,
          invalidateOnRefresh: true
        },
        x: -horizontalScrollLength,
        ease: "none"
      });
      
      // Add a progress indicator (optional)
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        ScrollTrigger.create({
          scroller: pageContainerElement, // Use the page container for scrolling
          trigger: sectionSelector,
          start: "top top",
          end: () => `+=${horizontalScrollLength}`,
          onUpdate: (self) => {
            progressBar.style.width = `${self.progress * 100}%`;
          }
        });
      }
      
      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
      initialized.current = true;
    };
    
    // Set up with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setupScrollTrigger();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      initialized.current = false;
    };
  }, [sectionSelector, wrapperSelector, itemsSelector, containerSelector]);
};

export default useHorizontalScroll;
