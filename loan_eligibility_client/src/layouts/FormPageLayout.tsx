import React from 'react';
import { AppLayout } from './AppLayout';
import { FormSectionNav, type FormNavSection } from '../components/ui';

interface FormPageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  sections: FormNavSection[];
  children: React.ReactNode;
  stickyFooter?: React.ReactNode;
}

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  description,
  actions,
  sections,
  children,
  stickyFooter,
}) => (
  <AppLayout title={title} description={description} actions={actions} maxWidth="7xl">
    <div className="lg:flex lg:gap-10 lg:items-start">
      <FormSectionNav sections={sections} />
      <div className="flex-1 min-w-0 pb-24 lg:pb-0">{children}</div>
    </div>
    {stickyFooter && (
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 shadow-lg">
        {stickyFooter}
      </div>
    )}
  </AppLayout>
);
