import { gsap } from 'gsap';

// Custom implementation of morphing since we don't have the official MorphSVGPlugin
// This simulates the morphing effect by using GSAP's regular animation capabilities

export const initGsapPlugins = () => {
  // Register a custom "morphSVG" effect
  gsap.registerEffect({
    name: "morphSVG",
    effect: (targets: any, config: any) => {
      return gsap.to(targets, {
        attr: { d: config.toPath },
        duration: config.duration || 1,
        ease: config.ease || "power2.inOut"
      });
    },
    defaults: { duration: 1, ease: "power2.inOut" },
    extendTimeline: true
  });
};

// Add a type for our custom GSAP effect
declare module "gsap" {
  interface Effects {
    morphSVG(targets: gsap.TweenTarget, config: { toPath: string; duration?: number; ease?: string }): gsap.core.Timeline;
  }
}

// Initialize the plugins
initGsapPlugins();
