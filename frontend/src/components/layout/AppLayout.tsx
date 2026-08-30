import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from './AdminSidebar';
import TeacherSidebar from './TeacherSidebar';
import PrincipalSidebar from './PrincipalSidebar';

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
        // Finance / Default
        return (
          <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 bg-primary h-full`}>
            {/* Fallback minimal sidebar */}
          </aside>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Dynamic Sidebar based on role */}
      {renderSidebar()}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="p-1.5 rounded-md text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
            title="Toggle sidebar"
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary hidden sm:block">
              {user?.firstName} {user?.lastName}
            </span>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
