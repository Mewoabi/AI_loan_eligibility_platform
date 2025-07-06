import React from 'react';
import { useToast } from '../context/toastContext';

/**
 * Demo component showing how to use the toast context
 * This file demonstrates various ways to use the toast functionality
 */
const ToastDemo: React.FC = () => {
  const { showToast, clearAllToasts } = useToast();

  const handleSuccessToast = () => {
    // Method 1: Simple success toast
    showToast('Profile updated successfully!', 'success');
  };

  const handleErrorToast = () => {
    // Method 2: Simple error toast
    showToast('Failed to update profile', 'error');
  };

  const handleWarningToast = () => {
    // Method 3: Simple warning toast
    showToast('Please check your input', 'warning');
  };

  const handleInfoToast = () => {
    // Method 4: Simple info toast
    showToast('Loading profile data...', 'info');
  };

  const handleCustomDurationToast = () => {
    // Method 5: Toast with custom duration (10 seconds)
    showToast('This toast will stay for 10 seconds', {
      type: 'info',
      duration: 10000
    });
  };

  const handlePersistentToast = () => {
    // Method 6: Persistent toast (won't auto-dismiss)
    showToast('This toast will stay until manually closed', {
      type: 'warning',
      duration: 0 // 0 means it won't auto-dismiss
    });
  };

  const handleDefaultToast = () => {
    // Method 7: Default toast (info type, 5 second duration)
    showToast('This is a default toast message');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Toast Context Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Try different types of toast notifications
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSuccessToast}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Success Toast
            </button>

            <button
              onClick={handleErrorToast}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Error Toast
            </button>

            <button
              onClick={handleWarningToast}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Warning Toast
            </button>

            <button
              onClick={handleInfoToast}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Info Toast
            </button>

            <button
              onClick={handleCustomDurationToast}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Custom Duration (10s)
            </button>

            <button
              onClick={handlePersistentToast}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Persistent Toast
            </button>

            <button
              onClick={handleDefaultToast}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Default Toast
            </button>

            <button
              onClick={clearAllToasts}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200"
            >
              Clear All Toasts
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Usage Examples:
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-mono">
              <p>showToast('Message', 'success')</p>
              <p>showToast('Message', 'error')</p>
              <p>showToast('Message', {'{'} type: 'warning', duration: 10000 {'}'})</p>
              <p>showToast('Message') // defaults to info type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;
