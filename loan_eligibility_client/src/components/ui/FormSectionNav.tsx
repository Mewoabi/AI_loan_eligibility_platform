import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export interface FormNavSection {
  id: string;
  label: string;
}

interface FormSectionNavProps {
  sections: FormNavSection[];
  className?: string;
}

export const FormSectionNav: React.FC<FormSectionNavProps> = ({ sections, className }) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  return (
  <>
      {/* Desktop sidebar */}
      <nav
        className={cn(
          'hidden lg:block sticky top-24 self-start w-48 shrink-0',
          className
        )}
        aria-label="Form sections"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Sections
        </p>
        <ul className="space-y-1">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  activeId === id
                    ? 'bg-gradient-to-r from-sky-500/10 to-teal-500/10 text-sky-700 dark:text-sky-300 border-l-2 border-sky-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile horizontal chips */}
      <nav
        className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-3 mb-4 overflow-x-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700/80"
        aria-label="Form sections"
      >
        <div className="flex gap-2 min-w-max">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                activeId === id
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
};
