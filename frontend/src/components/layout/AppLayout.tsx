import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from './AdminSidebar';
import TeacherSidebar from './TeacherSidebar';
import PrincipalSidebar from './PrincipalSidebar';
import { Menu, Bell } from 'lucide-react';

const AppLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const renderSidebar = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <AdminSidebar collapsed={sidebarCollapsed} />;
      case 'TEACHER':
        return <TeacherSidebar collapsed={sidebarCollapsed} />;
      case 'PRINCIPAL':
        return <PrincipalSidebar collapsed={sidebarCollapsed} />;
      default:
        return (
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 bg-gray-900 h-full`}></aside>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Dynamic Sidebar based on role */}
      {renderSidebar()}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(c => !c)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">Wadajir Institute</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent border-2 border-white"></span>
              </span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1">{user?.role.replace('_', ' ')}</p>
              </div>
              <div className="h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                {user?.firstName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
