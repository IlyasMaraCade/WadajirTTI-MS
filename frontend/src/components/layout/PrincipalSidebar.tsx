import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const PRINCIPAL_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/principal', icon: '📊' },
  { label: 'Attendance Monitor', path: '/principal/attendance', icon: '✅' },
  { label: 'Academic Performance', path: '/principal/performance', icon: '📈' },
];

const PrincipalSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { institution } = useInstitutionStore();

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 bg-primary flex flex-col h-full`}>
      <div className="h-16 flex items-center px-4 border-b border-primary-600 shrink-0">
        <img src={institution.logoUrl} alt="Logo" className="h-8 w-8 rounded-full object-cover shrink-0" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{institution.shortName}</p>
            <p className="text-primary-300 text-xs truncate">Principal Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {PRINCIPAL_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/principal'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-primary-600 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-primary-300 text-xs truncate">Principal</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:text-white hover:bg-red-700 rounded-md transition-colors"
        >
          <span>🚪</span>
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default PrincipalSidebar;

