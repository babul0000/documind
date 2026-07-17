import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Centered concentric spinner component for async loader indicators.
 */
export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* Track */}
        <div className={cn(
          'rounded-full border-zinc-800',
          sizeClasses[size]
        )} />
        {/* Active Ring */}
        <div className={cn(
          'absolute top-0 left-0 rounded-full border-transparent border-t-indigo-500 animate-spin',
          sizeClasses[size]
        )} />
      </div>
    </div>
  );
}
export default Spinner;
