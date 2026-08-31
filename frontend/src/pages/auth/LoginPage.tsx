import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { useThemeStore } from '@/store/themeStore';
import { loginUser } from '@/services/authService';
import { ROLE_PORTAL_PATHS } from '@/utils/constants';
import { LogIn, User, Lock, AlertCircle, ShieldCheck, Sun, Moon, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { institution } = useInstitutionStore();
  const { theme, toggleTheme } = useThemeStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

        const portalPath = ROLE_PORTAL_PATHS[user.role as keyof typeof ROLE_PORTAL_PATHS] || '/';
        navigate(portalPath, { replace: true });
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-background dark:bg-primary-950 text-text-primary dark:text-white transition-colors duration-200">
      
      {/* Theme Toggle Overlay */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface dark:bg-primary-900 text-text-secondary hover:text-primary dark:hover:text-accent shadow-sm border border-border dark:border-primary-800 transition-all hover:scale-105"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-primary dark:bg-primary-900 text-white transition-colors duration-200 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

        {/* Subtle Brand Header */}
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={institution.logoUrl}
            alt="Logo"
            className="w-12 h-12 rounded-xl object-contain bg-white p-1 ring-2 ring-white/20 shadow-lg"
          />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">{institution.shortName}</h2>
            <p className="text-xs text-accent font-medium">Technical & Training Institute</p>
          </div>
        </div>

        {/* Center Hero Description */}
        <div className="max-w-md space-y-6 my-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Official Institute Management Portal</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            Wadajir Technical and Training Institute
          </h1>

          <p className="text-white/80 text-base leading-relaxed max-w-sm">
            Centralized portal for managing student admissions, course evaluations, academic schedules, and institutional accounts.
          </p>

          <div className="pt-4 text-sm text-white/70 space-y-2 border-t border-white/10">
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Computer, English, Somali, and Practical Vocational Programs</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Automated Attendance & Evaluation Processing</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Secure Institutional Fee Tracking & Reporting</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/50 border-t border-white/10 pt-4 relative z-10">
          <p>© {new Date().getFullYear()} {institution.shortName}. All rights reserved.</p>
        </div>
      </div>

      {/* Right Sign-in Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-background dark:bg-primary-950 transition-colors duration-200">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center lg:hidden mb-8 gap-3">
            <img
              src={institution.logoUrl}
              alt="Logo"
              className="w-12 h-12 rounded-xl shadow-sm ring-1 ring-border dark:ring-primary-800 bg-white"
            />
            <div>
              <h2 className="text-base font-bold text-text-primary dark:text-white">{institution.shortName}</h2>
              <p className="text-xs text-text-secondary dark:text-text-muted">Technical & Training Institute</p>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-extrabold text-text-primary dark:text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-muted mt-1">
              Enter your assigned username and password
            </p>
          </div>

          {/* Form Box */}
          <div className="modern-card p-6 sm:p-7 transition-colors duration-200">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-status-danger/10 border border-status-danger/20 p-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-status-danger shrink-0" />
                  <p className="text-xs font-semibold text-status-danger">{error}</p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-background dark:bg-primary-900 border border-border dark:border-primary-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary dark:text-white placeholder-text-muted focus:outline-none focus:border-accent dark:focus:border-accent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background dark:bg-primary-900 border border-border dark:border-primary-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-text-primary dark:text-white placeholder-text-muted focus:outline-none focus:border-accent dark:focus:border-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 dark:bg-accent dark:text-primary-900 dark:hover:bg-accent-400 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-primary-900 border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <LogIn className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-text-muted mt-8 font-medium">
            Management System • Wadajir Technical & Training Institute
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
