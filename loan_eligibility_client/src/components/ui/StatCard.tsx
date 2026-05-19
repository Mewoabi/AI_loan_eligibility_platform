import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  className,
}) => (
  <div
    className={cn(
      'surface-card p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5',
      className
    )}
  >
    <div className="flex items-center gap-4">
      {icon && (
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {trend && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
        )}
      </div>
    </div>
  </div>
);
