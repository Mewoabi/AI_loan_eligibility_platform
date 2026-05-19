import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/toastContext';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { AuthSidePanel } from '../../components/auth/AuthSidePanel';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      navigate('/profile/create');
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(
        err,
        'Registration failed. Please try again.'
      );
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      <AuthSidePanel variant="register" />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-md my-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Get started with ScoreSure</p>

          <Card>
            <CardContent className="pt-5 pb-5">
              <form className="auth-form space-y-2.5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Password"
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Confirm password"
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" fullWidth loading={isSubmitting} className="btn-primary mt-1">
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:text-teal-600"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
