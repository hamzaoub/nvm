import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/utils/gsapPlugins';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { useSmoothScrollContext } from '@/hooks/useSmoothScrollContext';
import useHorizontalScroll from '@/hooks/useHorizontalScroll';
import { SVGMorphing } from '@/components/SVGMorphing';
import { ParallaxSection } from '@/components/ParallaxSection';
import { PinnedSection } from '@/components/PinnedSection';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TextReveal } from '@/components/TextReveal';
// import { SmoothHorizontalScroll } from '@/components/SmoothHorizontalScroll';
import { OceanButton } from '@/components/OceanButton';
import { Navbar } from '@/components/Navbar';
import { TentacleAnimation } from '@/components/TentacleAnimation';
import { OceanBubbles } from '@/components/OceanBubbles';
import ProductSection  from '@/pages/ProductSection';
// Import horizontal scroll styles
import '@/styles/horizontalScroll.css';

// No longer need to import ecosystem data since we're defining content directly in the component

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ResponsiveBubbles component for dynamic bubble rendering based on screen size
function ResponsiveBubbles() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if viewport is mobile width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard mobile breakpoint
    };
    
    // Check on initial render
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Just the bubbles without an additional background */}
      <OceanBubbles 
        count={isMobile ? 90 : 200} 
        maxSize={isMobile ? 35 : 45} 
        minSize={5} 
        randomPlacement={true} 
        maxInitialY={100} 
        maxDuration={25}
        minDuration={10}
        className="absolute inset-0 z-10" 
      />
    </>
  );
}

/**
 * Main Home component with SmoothScrollProvider for the entire page
 */
const Home = () => {
  return (
    <SmoothScrollProvider>
      <HomeContent />
    </SmoothScrollProvider>
  );
};

/**
 * HomeContent component that uses smooth scroll context
 */
const HomeContent = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScrollContext();
  
  // Initialize horizontal scrolling
  useHorizontalScroll({
    containerSelector: 'body',
    sectionSelector: '#sectionPin'
  });
  
  // Add progress indicator for horizontal scrolling
  useEffect(() => {
    // Create a progress indicator for the horizontal scroll section
    const sectionPin = document.getElementById('sectionPin');
    if (sectionPin && !document.getElementById('scroll-progress')) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container ';
      progressContainer.style.cssText = 'position: sticky; top: 0; width: 100%; height: 4px; background: rgba(0, 119, 182, 0.2); z-index: 100;';
      
      const progressBar = document.createElement('div');
      progressBar.id = 'scroll-progress';
      progressBar.style.cssText = 'height: 100%; width: 0%; background: linear-gradient(to right, #0077b6, #00b4d8); transition: width 0.1s;';
      
      progressContainer.appendChild(progressBar);
      sectionPin.prepend(progressContainer);
    }
  }, []);
  
  // Apply smooth scroll animations to sections
  useEffect(() => {
    if (!lenis.current) return;
    
    // Create scroll-triggered animations for sections, excluding the pin section
    const sections = document.querySelectorAll('section:not(#sectionPin)');
    
    // Properly type the animations array
    const animations: gsap.core.Tween[] = [];
    
    sections.forEach((section) => {
      const animation = gsap.fromTo(section, 
        { opacity: 0.5, y: 50 },
        { 
          opacity: 1, 
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
          }
        }
      );
      animations.push(animation);
    });

    return () => {
      // Clean up animations
      animations.forEach(anim => {
        if (anim.scrollTrigger) {
          anim.scrollTrigger.kill();
        }
        anim.kill();
      });
    };
  }, [lenis]);
  
  // Animation for the hero section
  useEffect(() => {
    if (!headerRef.current) return;
    
    // Wait for DOM to be fully rendered
    const animateHero = () => {
      const heroTitle = headerRef.current?.querySelector('.hero-title');
      const heroSubtitle = headerRef.current?.querySelector('.hero-subtitle');
      const heroCta = headerRef.current?.querySelector('.hero-cta');
      const bubbles = headerRef.current?.querySelectorAll('.bubble');
      
      const tl = gsap.timeline();
      
      if (heroTitle) {
        tl.from(heroTitle, {
          y: 100,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        });
      }
      
      if (heroSubtitle) {
        tl.from(
          heroSubtitle,
          {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.8'
        );
      }
      
      if (heroCta) {
        tl.from(
          heroCta,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6'
        );
      }
      
      if (bubbles && bubbles.length > 0) {
        tl.from(
          bubbles,
          {
            scale: 0,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'elastic.out(1, 0.5)',
          },
          '-=1'
        );
      }
      
      return tl;
    };
    
    // Delay animation slightly to ensure DOM is ready
    const timer = setTimeout(() => {
      const animation = animateHero();
      
      return () => {
        animation.kill();
        clearTimeout(timer);
      };
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
        {/* Global background gradient */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-100 z-0"></div>
        {/* WebGL Background - Commented out to use global gradient */}
        {/* <WebGLBackground className="fixed inset-0 z-0" /> */}

        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section
          ref={headerRef}
          className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden"
        >
         
          <div className="container mx-auto relative z-20">
            <div className="max-w-3xl mx-auto text-center">
              <TextReveal
                text="Dive into the Ocean of Possibilities"
                className="hero-title text-5xl md:text-7xl font-bold mb-6 text-white"
                type="words"
                stagger={0.1}
                duration={1}
                direction="up"
              />
              <TextReveal
                text="Aquariza.com transforms your digital experience with fluid, intuitive interfaces and powerful oceanic features."
                className="hero-subtitle text-xl md:text-2xl mb-10 text-[#ade8f4]"
                type="words"
                stagger={0.05}
                duration={0.8}
                delay={0.5}
                direction="up"
              />
              <div className="hero-cta">
                <Link to="/auth">
                  <OceanButton>Get Started</OceanButton>
                </Link>
              </div>
            </div>
          </div>
          <SVGMorphing className="absolute bottom-0 left-0 w-full h-40 opacity-50" />
        </section>





        <ProductSection />






        {/* Feature Storytelling Section */}
        <section>
                          <ResponsiveBubbles />

          <div className="container mx-auto px-6 py-20">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal animation="fade-in" className="mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Explore the Depths
                </h2>
                <p className="text-xl text-[#90e0ef]">
                  Scroll to discover the unique features of Aquariza.com
                </p>
              </ScrollReveal>

              <div className="space-y-40">
                {/* Feature 1 */}
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <ParallaxSection
                    speed={0.2}
                    direction="left"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-right" className="relative">
                      <div className="relative w-full aspect-square rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] p-1">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <TentacleAnimation />
                        </div>
                      </div>
                    </ScrollReveal>
                  </ParallaxSection>

                  <ParallaxSection
                    speed={0.3}
                    direction="right"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-left">
                      <h3 className="text-3xl font-bold mb-4 text-white">
                        Fluid User Experience
                      </h3>
                      <p className="text-lg text-[#ade8f4] mb-6">
                        Our intuitive interface flows naturally, guiding you through
                        complex tasks with the grace of ocean currents. Experience
                        seamless navigation and responsive design.
                      </p>
                      <OceanButton variant="outline">Learn More</OceanButton>
                    </ScrollReveal>
                  </ParallaxSection>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-10">
                  <ParallaxSection
                    speed={0.2}
                    direction="right"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-left" className="relative">
                      <div className="relative w-full aspect-square rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] p-1">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <SVGMorphing className="w-full h-full" />
                        </div>
                      </div>
                    </ScrollReveal>
                  </ParallaxSection>

                  <ParallaxSection
                    speed={0.3}
                    direction="left"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-right">
                      <h3 className="text-3xl font-bold mb-4 text-white">
                        Adaptive Intelligence
                      </h3>
                      <p className="text-lg text-[#ade8f4] mb-6">
                        Like an octopus adapting to its environment, our platform
                        learns from your interactions to provide personalized
                        recommendations and streamlined workflows.
                      </p>
                      <OceanButton variant="outline">Discover</OceanButton>
                    </ScrollReveal>
                  </ParallaxSection>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <ParallaxSection
                    speed={0.2}
                    direction="left"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-right" className="relative">
                      <div className="relative w-full aspect-square rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8] p-1">
                        <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
                          
                        </div>
                      </div>
                    </ScrollReveal>
                  </ParallaxSection>

                  <ParallaxSection
                    speed={0.3}
                    direction="right"
                    className="w-full md:w-1/2"
                  >
                    <ScrollReveal animation="slide-left">
                      <h3 className="text-3xl font-bold mb-4 text-white">
                        Deep Security
                      </h3>
                      <p className="text-lg text-[#ade8f4] mb-6">
                        Protected by layers of security like the depths of the ocean,
                        your data remains safe from threats. Our advanced encryption
                        and authentication systems keep you secure.
                      </p>
                      <OceanButton variant="outline">Explore</OceanButton>
                    </ScrollReveal>
                  </ParallaxSection>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Scrolling Section */}
        <section id="sectionPin" className="relative bg-gradient-to-b  from-[#010d1a] to-[#0a1e33]">
          {/* Section header */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="progress-container">
              <div id="scroll-progress"></div>
            </div>
            
            <div className="container mx-auto px-6 pt-8 pb-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">
                Our Ecosystem
              </h2>
              <p className="text-base md:text-lg text-[#90e0ef] max-w-2xl mx-auto">
                Scroll to explore our integrated AI platform features
              </p>
            </div>
          </div>
          
          {/* Background bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <OceanBubbles 
              count={80} 
              maxSize={35} 
              minSize={8} 
              randomPlacement={true} 
              maxInitialY={100} 
              maxDuration={20}
              minDuration={10}
              className="absolute inset-0" 
            />
          </div>
          
          <div className="pin-wrap">
            <div className="flex items-center justify-center">
              <div className="horizontal-card">
                <div className="flex flex-col md:flex-row md:gap-8">
                  <div className="md:w-1/2">
                    <h2>Marine AI Collaboration</h2>
                    <p>Like a coral reef ecosystem, our collaborative workspaces foster productivity and creativity. Work together seamlessly with real-time updates and intuitive sharing capabilities.</p>
                    <Link to="/dashboard" className="inline-block">
                      <OceanButton>Explore Projects</OceanButton>
                    </Link>
                  </div>
                  <div className="md:w-1/2 horizontal-card-media">
                    <SVGMorphing className="w-1/2 h-1/2" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="horizontal-card">
                <div className="flex flex-col md:flex-row md:gap-8">
                  <div className="md:w-1/2">
                    <h2>Deep Ocean Analytics</h2>
                    <p>Dive deep into your data, exploring untapped insights with our powerful analytical tools. Visualize trends and patterns with intuitive, oceanic-themed dashboards.</p>
                    <OceanButton variant="outline">View Demo</OceanButton>
                  </div>
                  <div className="md:w-1/2 horizontal-card-media">
                    <TentacleAnimation />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="horizontal-card">
                <div className="flex flex-col md:flex-row md:gap-8">
                  <div className="md:w-1/2">
                    <h2>Secure Maritime Communications</h2>
                    <p>Protected by layers of security like the depths of the ocean, your data remains safe from threats. Our advanced encryption ensures secure communication across the platform.</p>
                    <OceanButton variant="outline">Learn More</OceanButton>
                  </div>
                  <div className="md:w-1/2 horizontal-card-media">
                    <div className="w-1/3 h-1/3 rounded-full bg-[#00b4d8]/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-20">
         
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollReveal animation="fade-in">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Ready to Dive In?
                </h2>
                <p className="text-xl text-[#ade8f4] mb-10 max-w-2xl mx-auto">
                  Join thousands of users already exploring the depths of
                  Aquariza.com. Start your journey today and discover a new
                  digital experience.
                </p>
                <Link to="/auth">
                  <OceanButton size="lg">Get Started Now</OceanButton>
                </Link>
              </ScrollReveal>
            </div>
          </div>
          <SVGMorphing className="absolute bottom-0 left-0 w-full h-40 opacity-50 transform rotate-180" />
        </section>

       
        
      </div>
  );
};

export default Home;
