import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8', className)}>
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
  </div>
);
