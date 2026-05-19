import React from 'react';
import { cn } from '../utils/cn';
import { PageHeader } from '../components/ui';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  className?: string;
  noPadding?: boolean;
}

const maxWidthClasses = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  description,
  actions,
  maxWidth = '7xl',
  className,
  noPadding = false,
}) => (
  <div
    className={cn(
      'relative mx-auto w-full',
      maxWidthClasses[maxWidth],
      !noPadding && 'px-4 sm:px-6 lg:px-8 py-8',
      className
    )}
  >
    {title && <PageHeader title={title} description={description} actions={actions} />}
    {children}
  </div>
);
