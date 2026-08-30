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
    <div className="min-h-screen flex font-sans bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Theme Toggle Overlay */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:scale-105"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Brand Panel - Clean, Monochromatic & Elegant */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Subtle Brand Header */}
        <div className="flex items-center gap-3">
          <img
            src={institution.logoUrl}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{institution.shortName}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Technical & Training Institute</p>
          </div>
        </div>

        {/* Center Hero Description */}
        <div className="max-w-md space-y-5 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Official Institute Management Portal</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Wadajir Technical and Training Institute
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Centralized portal for managing student admissions, course evaluations, academic schedules, and institutional accounts.
          </p>

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-2 border-t border-slate-200 dark:border-slate-800/80">
            <p>• Computer, English, Somali, and Practical Vocational Programs</p>
            <p>• Automated Attendance & Evaluation Processing</p>
            <p>• Secure Institutional Fee Tracking & Reporting</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800/60 pt-4">
          <p>© {new Date().getFullYear()} {institution.shortName}. All rights reserved.</p>
        </div>
      </div>

      {/* Right Sign-in Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-[#f8fafc] dark:bg-[#090d16] transition-colors duration-200">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center lg:hidden mb-8 gap-3">
            <img
              src={institution.logoUrl}
              alt="Logo"
              className="w-12 h-12 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{institution.shortName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Technical & Training Institute</p>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your assigned username and password
            </p>
          </div>

          {/* Form Box */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-200">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</p>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white dark:text-slate-950 bg-indigo-600 dark:bg-white hover:bg-indigo-700 dark:hover:bg-slate-100 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-slate-900 border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <LogIn className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-6">
            Management System • Wadajir Technical & Training Institute
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
