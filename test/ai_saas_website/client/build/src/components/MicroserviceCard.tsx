// Optimized MicroserviceCard component with improved performance and accessibility

import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';

interface MicroserviceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'unavailable' | 'maintenance';
  features: string[];
  onClick: () => void;
}

// Define status badge variants
const statusBadgeVariants = cva(
  "px-2 py-1 text-xs font-medium rounded-full",
  {
    variants: {
      status: {
        available: "bg-green-500/20 text-green-300 border border-green-500/30",
        maintenance: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        unavailable: "bg-red-500/20 text-red-300 border border-red-500/30",
      },
    },
    defaultVariants: {
      status: "available",
    },
  }
);

// Define status text mapping
const statusText = {
  available: "Available",
  maintenance: "Maintenance",
  unavailable: "Unavailable",
};

const MicroserviceCard: React.FC<MicroserviceCardProps> = ({
  title,
  description,
  icon,
  status,
  features,
  onClick,
}) => {
  // Memoize card content to prevent unnecessary re-renders
  const cardContent = React.useMemo(() => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[#00b4d8] p-2 rounded-lg bg-[#00b4d8]/10 border border-[#00b4d8]/20">
            {icon}
          </div>
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
        <div className={statusBadgeVariants({ status })}>
          {statusText[status]}
        </div>
      </div>
      
      <p className="text-[#ade8f4] mb-4">{description}</p>
      
      <div className="mt-auto">
        <h4 className="text-[#90e0ef] text-sm font-medium mb-2">Key Features:</h4>
        <ul className="text-[#ade8f4] text-sm space-y-1">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-[#00b4d8]">•</span>
              <span>{feature}</span>
            </li>
          ))}
          {features.length > 3 && (
            <li className="text-[#90e0ef] text-xs mt-1">
              +{features.length - 3} more features
            </li>
          )}
        </ul>
      </div>
    </>
  ), [title, description, icon, status, features]);

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 30px -15px rgba(0, 180, 216, 0.3)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      className={`relative p-5 rounded-xl border border-[#0077b6]/30 bg-gradient-to-br from-[#051e2f] to-[#0c2e44] backdrop-blur-sm cursor-pointer h-full flex flex-col ${
        status === 'unavailable' ? 'opacity-70' : ''
      }`}
      onClick={onClick}
      role="button"
      aria-disabled={status === 'unavailable'}
      tabIndex={status === 'unavailable' ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {cardContent}
    </motion.div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(MicroserviceCard);
