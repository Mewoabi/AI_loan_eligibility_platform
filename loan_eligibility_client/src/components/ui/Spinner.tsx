import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-5 w-5',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label, className }) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-sky-200 border-t-sky-500 dark:border-gray-700 dark:border-t-sky-400',
        sizeMap[size]
      )}
    ></div>
    {label && (
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
    )}
  </div>
);
