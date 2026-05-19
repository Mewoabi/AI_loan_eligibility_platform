import React from 'react';
import { cn } from '../../utils/cn';

type CalloutVariant = 'info' | 'success' | 'warning' | 'credit';

interface CalloutProps {
  title?: string;
  children: React.ReactNode;
  variant?: CalloutVariant;
  className?: string;
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border-sky-200 bg-sky-50/80 dark:border-sky-800 dark:bg-sky-950/40',
  success:
    'border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40',
  warning:
    'border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/40',
  credit:
    'border-violet-200 bg-gradient-to-br from-violet-50/90 to-sky-50/90 dark:from-violet-950/30 dark:to-sky-950/30 dark:border-violet-800',
};

export const Callout: React.FC<CalloutProps> = ({
  title,
  children,
  variant = 'info',
  className,
}) => (
  <div
    className={cn(
      'rounded-xl border p-4 backdrop-blur-sm',
      variantStyles[variant],
      className
    )}
  >
    {title && (
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
    )}
    <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);
