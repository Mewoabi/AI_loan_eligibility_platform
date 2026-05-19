import React from 'react';
import { Spinner } from './ui';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading your data...',
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="text-center surface-card px-10 py-8 max-w-sm mx-4">
        <Spinner size="lg" />
        <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
          Welcome to ScoreSure
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-5 flex justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
          <span
            className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
