import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaOctopusDeploy } from 'react-icons/fa';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface TentacleMenuProps {
  items: MenuItem[];
  className?: string;
}

export const TentacleMenu: React.FC<TentacleMenuProps> = ({ 
  items, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Tentacle animation variants
  const tentacleVariants = {
    hidden: { 
      height: 0,
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut" 
      }
    },
    visible: (i: number) => ({ 
      height: "auto",
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: i * 0.1,
        ease: "easeOut" 
      }
    })
  };

  // Icon animation variants
  const iconVariants = {
    closed: { 
      rotate: 0,
      scale: 1
    },
    open: { 
      rotate: [0, -10, 10, -5, 5, 0],
      scale: 1.2,
      transition: { 
        duration: 0.5,
        ease: "easeInOut" 
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Menu toggle button */}
      <button 
        onClick={toggleMenu}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-ocean-medium hover:bg-ocean-shallow transition-colors duration-300 shadow-lg z-20 relative"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        <motion.div
          animate={isOpen ? "open" : "closed"}
          variants={iconVariants}
        >
          <FaOctopusDeploy className="text-2xl text-ocean-surface" />
        </motion.div>
      </button>

      {/* Menu items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 right-0 bg-ocean-deep/90 backdrop-blur-md rounded-xl shadow-lg p-2 z-10 min-w-[200px] border border-ocean-surface/30"
          >
            <ul className="space-y-1">
              {items.map((item, index) => (
                <motion.li 
                  key={item.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={tentacleVariants}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative"
                >
                  {/* Tentacle indicator */}
                  {hoveredItem === item.id && (
                    <motion.div 
                      layoutId="tentacle"
                      className="absolute left-0 h-full w-1 bg-ocean-surface rounded-full"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  
                  <a 
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      hoveredItem === item.id 
                        ? 'bg-ocean-medium/50 text-ocean-lightText pl-6' 
                        : 'text-ocean-text hover:bg-ocean-medium/30'
                    }`}
                  >
                    {item.icon && (
                      <span className="mr-3 text-ocean-surface">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
