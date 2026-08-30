import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { loginUser } from '@/services/authService';
import { ROLE_PORTAL_PATHS } from '@/utils/constants';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex font-sans bg-gray-50">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center p-12">
          <div className="bg-white p-4 rounded-2xl shadow-2xl mb-8">
            <img
              src={institution.logoUrl}
              alt={institution.shortName}
              className="w-32 h-32 object-cover rounded-xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            {institution.longName}
          </h1>
          <p className="text-primary-100 text-lg max-w-md mx-auto leading-relaxed">
            Empowering the next generation with modern education and professional training.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden mb-8">
            <img src={institution.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl shadow-md" />
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to access your portal
            </p>
          </div>

          <div className="bg-white">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 pl-10 px-4 py-3 text-sm placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-accent hover:text-accent-600">
                    Forgot password?
                  </a>
                </div>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 pl-10 px-4 py-3 text-sm placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      Sign In
                      <LogIn className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {institution.shortName}. All rights reserved.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
