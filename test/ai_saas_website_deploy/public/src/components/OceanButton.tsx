import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OceanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'coral' | 'seafoam' | 'sand';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
  withRipple?: boolean;
}

export const OceanButton: React.FC<OceanButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  className = '',
  withRipple = true,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(0);

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-ocean-highlight hover:border-ocean-surface text-ocean-lightText hover:bg-ocean-medium/20';
      case 'coral':
        return 'bg-gradient-to-r from-ocean-coral/90 to-ocean-coral/70 text-white hover:opacity-90';
      case 'seafoam':
        return 'bg-gradient-to-r from-ocean-seafoam/90 to-ocean-seafoam/70 text-ocean-deep hover:opacity-90';
      case 'sand':
        return 'bg-gradient-to-r from-ocean-sand/90 to-ocean-sand/70 text-ocean-deep hover:opacity-90';
      case 'default':
      default:
        return 'bg-gradient-to-r from-ocean-highlight via-ocean-highlight/80 to-ocean-surface text-white hover:opacity-90';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-4 py-2';
      case 'lg':
        return 'text-lg px-8 py-6';
      case 'icon':
        return 'h-10 w-10 p-0';
      case 'default':
      default:
        return 'text-md px-6 py-3';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!withRipple || !buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = nextId.current++;
    setRipples(prev => [...prev, { x, y, id }]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 800);
  };

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,180,216,0.5)] rounded-lg',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </Button>
  );
};
