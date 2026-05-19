import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/toastContext';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { AuthSidePanel } from '../../components/auth/AuthSidePanel';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(
        err,
        'Login failed. Please check your credentials.'
      );
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      <AuthSidePanel variant="login" />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-md my-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Sign in to your ScoreSure account</p>

          <Card>
            <CardContent className="pt-5 pb-5">
              <form className="auth-form space-y-3" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <Input
                  label="Email address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div>
                  <Input
                    label="Password"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'} password
                  </button>
                </div>

                <Button type="submit" fullWidth loading={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:text-teal-600"
                >
                  Register now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
