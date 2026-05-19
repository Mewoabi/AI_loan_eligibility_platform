import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('surface-card', className)}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-6 py-5 border-b border-gray-200/80 dark:border-gray-700/80',
      className
    )}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h2 className={cn('text-xl font-bold text-gray-900 dark:text-white', className)}>
    {children}
  </h2>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p className={cn('mt-1 text-sm text-gray-600 dark:text-gray-400', className)}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('px-6 py-5', className)}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div
    className={cn(
      'px-6 py-4 border-t border-gray-200/80 dark:border-gray-700/80 flex flex-wrap gap-3',
      className
    )}
  >
    {children}
  </div>
);
