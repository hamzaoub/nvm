import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OceanBubblesProps {
  count?: number;
  maxSize?: number;
  minSize?: number;
  maxDuration?: number;
  minDuration?: number;
  className?: string;
  randomPlacement?: boolean;
  maxInitialY?: number;
}

export function OceanBubbles({
  count = 8,
  maxSize = 30,
  minSize = 10,
  maxDuration = 20,
  minDuration = 10,
  className = '',
  randomPlacement = false,
  maxInitialY = 100,
}: OceanBubblesProps) {
  // Use state to ensure client-side rendering
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    size: number;
    delay: number;
    duration: number;
    left: string;
    initialY: number;
  }>>([]);

  useEffect(() => {
    // Generate bubbles with configurable properties
    setBubbles(Array.from({ length: count }).map((_, i) => {
      return {
        id: i,
        size: Math.random() * (maxSize - minSize) + minSize, // Random size between minSize-maxSize
        delay: Math.random() * 12, // Random delay between 0-12s for more variety
        duration: Math.random() * (maxDuration - minDuration) + minDuration, // Random duration
        left: `${Math.random() * 100}%`, // Random horizontal position
        initialY: randomPlacement ? Math.random() * maxInitialY : 0, // Random initial vertical position
      };
    }));
  }, [count, maxSize, minSize, maxDuration, minDuration, randomPlacement, maxInitialY]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
            bottom: randomPlacement ? `${bubble.initialY}%` : 0,
            zIndex: 0,
            background: 'rgba(12, 22, 48, 0.4)',
            boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.4), 0 0 8px rgba(5, 30, 47, 0.5)',
          }}
          animate={{
            y: ["-5%", "-150%"],
            opacity: [0.8, 0],
            scale: [1, 0.8],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
