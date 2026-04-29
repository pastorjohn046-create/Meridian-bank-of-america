import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      {/* Custom WHSBC Logo: A stylized W within a hexagon shape */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* Background Hexagon */}
        <path 
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
          fill="#ff0000" 
          className="animate-pulse"
        />
        {/* Sharper Stylized W */}
        <path 
          d="M20 30 L35 80 L50 45 L65 80 L80 30" 
          fill="none" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
        />
        {/* Geometric Accents */}
        <rect x="47" y="15" width="6" height="6" fill="white" transform="rotate(45 50 18)" />
        <rect x="47" y="79" width="6" height="6" fill="white" transform="rotate(45 50 82)" />
      </svg>
    </div>
  );
};
