import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from './AdminSidebar';
import TeacherSidebar from './TeacherSidebar';
import PrincipalSidebar from './PrincipalSidebar';
import RegistrationSidebar from './RegistrationSidebar';
import SessionTimer from '@/components/common/SessionTimer';
import { Menu, Search, Bell, ChevronRight } from 'lucide-react';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  // Mobile sidebar logic
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const renderSidebar = () => {
    const props = { 
      collapsed: sidebarCollapsed,
      mobileOpen: mobileMenuOpen, 
      setMobileOpen: setMobileMenuOpen 
    };

    switch (user.role) {
      case 'SUPER_ADMIN':
        return <AdminSidebar {...props} />;
      case 'REGISTRATION':
        return <RegistrationSidebar {...props} />;
      case 'TEACHER':
        return <TeacherSidebar {...props} />;
      case 'PRINCIPAL':
        return <PrincipalSidebar {...props} />;
      default:
        return (
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} hidden md:block transition-all duration-300 bg-primary h-full`}></aside>
        );
    }
  };

  const getPortalBasePath = () => {
    switch (user.role) {
      case 'SUPER_ADMIN': return '/admin';
      case 'REGISTRATION': return '/register';
      case 'PRINCIPAL': return '/principal';
      case 'TEACHER': return '/teacher';
      default: return '/';
    }
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    const base = getPortalBasePath();
    if (path === base) return 'Dashboard';
    
    // Attempt to extract string after base path
    const section = path.replace(base + '/', '').split('/')[0];
    if (!section) return 'Overview';
    
    // Formatting e.g. "academic-years" -> "Academic Years"
    return section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const profilePath = `${getPortalBasePath()}/profile`;

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dynamic Sidebar based on role */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {renderSidebar()}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Modern Top Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-colors">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl text-text-secondary hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 -ml-2 rounded-xl text-text-secondary hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted">Wadajir Institute</span>
              <ChevronRight className="w-3 h-3 text-border" />
              <span className="text-sm font-bold text-text-primary tracking-tight">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search (Visual Only for now) */}
            <div className="hidden lg:flex items-center relative mr-2">
              <Search className="w-4 h-4 text-text-muted absolute left-3" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 w-64 rounded-full border border-border bg-background text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <SessionTimer />

            {/* Notifications */}
            <button className="p-2 rounded-full text-text-secondary hover:bg-slate-100 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-surface"></span>
            </button>

            <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>

            {/* User Profile Dropdown Trigger */}
            <button
              onClick={() => navigate(profilePath)}
              className="flex items-center gap-3 pl-1 sm:pl-2 hover:opacity-80 transition-opacity text-left"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-text-primary leading-tight">
                  {user?.firstName}
                </p>
                <p className="text-[10px] text-text-secondary font-medium capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
              {(user as any)?.avatarUrl ? (
                <img
                  src={(user as any).avatarUrl}
                  alt="Avatar"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-background shadow-sm"
                />
              ) : (
                <div className="h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-background">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background transition-colors">
          <div 
            key={location.pathname} 
            className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
