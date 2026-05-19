import React from 'react';
import { cn } from '../../utils/cn';

interface FormSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  id,
  title,
  description,
  children,
  className,
}) => (
  <fieldset
    id={id}
    className={cn('form-section-anchor surface-card p-6 mb-6', className)}
  >
    <legend className="sr-only">{title}</legend>
    <div className="mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-700/80">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
    {children}
  </fieldset>
);

export const FormGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-5', className)}>{children}</div>
);
