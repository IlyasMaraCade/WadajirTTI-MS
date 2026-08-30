import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { loginUser } from '@/services/authService';
import { ROLE_PORTAL_PATHS } from '@/utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { institution } = useInstitutionStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ username, password });
      
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        setAuth(user, accessToken);
        
        // Redirect based on role
        const portalPath = ROLE_PORTAL_PATHS[user.role as keyof typeof ROLE_PORTAL_PATHS] || '/';
        navigate(portalPath, { replace: true });
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src={institution.logoUrl}
            alt={institution.shortName}
            className="w-24 h-24 rounded-full object-cover shadow-sm"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary">
          {institution.longName}
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Sign in to the Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-card sm:rounded-lg sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border px-3 py-2 placeholder-text-muted shadow-sm focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-border px-3 py-2 placeholder-text-muted shadow-sm focus:border-accent focus:outline-none focus:ring-accent sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


