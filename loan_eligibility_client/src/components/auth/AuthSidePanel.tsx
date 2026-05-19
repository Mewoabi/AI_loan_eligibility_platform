import React from 'react';
import { Link } from 'react-router-dom';

interface AuthSidePanelProps {
  variant: 'login' | 'register';
}

const bullets = {
  login: ['Instant AI credit scoring', 'Loan outcome tracking', 'Borrower search & audit trail'],
  register: ['Save scores to your profile', 'Full scoring dashboard', 'Track loans end-to-end'],
};

export const AuthSidePanel: React.FC<AuthSidePanelProps> = ({ variant }) => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 px-10 py-6 flex-col justify-center shrink-0 min-h-0">
    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

    <div className="relative z-10 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <img src="/favicon-192x192.png" alt="" className="h-10 w-10 rounded-xl ring-2 ring-white/30" />
        <div>
          <p className="text-xl font-bold text-white">ScoreSure</p>
          <p className="text-sky-100 text-sm">AI-powered credit scoring</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white leading-snug">
        {variant === 'login'
          ? 'Smarter lending starts with better data.'
          : 'Join lenders using AI-driven decisions.'}
      </h2>
      <p className="text-sky-100/90 mt-2 text-sm leading-relaxed">
        {variant === 'login'
          ? 'Score borrowers, track outcomes, and grow your credit history database.'
          : 'Create an account to save scores and access the full platform.'}
      </p>

      <ul className="mt-4 space-y-2">
        {bullets[variant].map((text) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-white/95">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
              ✓
            </span>
            {text}
          </li>
        ))}
      </ul>

      {variant === 'login' && (
        <p className="mt-4 text-xs text-sky-100/75">
          No account?{' '}
          <Link to="/quick-score" className="text-white font-medium hover:underline">
            Try a free quick score
          </Link>
        </p>
      )}
    </div>
  </div>
);
