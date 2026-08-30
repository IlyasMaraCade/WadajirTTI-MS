import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import AdminSidebar from './AdminSidebar';
import TeacherSidebar from './TeacherSidebar';
import PrincipalSidebar from './PrincipalSidebar';
import FinanceSidebar from './FinanceSidebar';
import SessionTimer from '@/components/common/SessionTimer';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const renderSidebar = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <AdminSidebar collapsed={sidebarCollapsed} />;
      case 'FINANCE':
        return <FinanceSidebar collapsed={sidebarCollapsed} />;
      case 'TEACHER':
        return <TeacherSidebar collapsed={sidebarCollapsed} />;
      case 'PRINCIPAL':
        return <PrincipalSidebar collapsed={sidebarCollapsed} />;
      default:
        return (
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-slate-950 h-full`}></aside>
        );
    }
  };

  const getPortalBasePath = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/admin';
      case 'FINANCE':
        return '/finance';
      case 'PRINCIPAL':
        return '/principal';
      case 'TEACHER':
        return '/teacher';
      default:
        return '/';
    }
  };

  const getPortalLabel = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return { name: 'Super Admin', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' };
      case 'FINANCE':
        return { name: 'Finance & Accounts', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' };
      case 'PRINCIPAL':
        return { name: 'Principal Portal', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' };
      case 'TEACHER':
        return { name: 'Teacher Portal', color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20' };
      default:
        return { name: 'Portal', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const portalInfo = getPortalLabel();
  const profilePath = `${getPortalBasePath()}/profile`;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0b0f19] font-sans overflow-hidden transition-colors duration-200">
      {/* Dynamic Sidebar based on role */}
      {renderSidebar()}

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-5 shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                Wadajir Institute
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${portalInfo.color}`}>
                {portalInfo.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Session Countdown */}
            <SessionTimer />

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Badge (Clickable to open profile tab) */}
            <button
              onClick={() => navigate(profilePath)}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity text-left"
              title="View & Edit Profile"
            >
              {(user as any)?.avatarUrl ? (
                <img
                  src={(user as any).avatarUrl}
                  alt="Avatar"
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700 shadow-xs"
                />
              ) : (
                <div className="h-7 w-7 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                  {user?.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 bg-[#f8fafc] dark:bg-[#0b0f19] transition-colors">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
