import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';

interface NavItem {
  label: string;
  path?: string;
  icon: string;
  children?: NavItem[];
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  {
    label: 'People', icon: '👥', children: [
      { label: 'Users', path: '/admin/users', icon: '🔑' },
      { label: 'Students', path: '/admin/students', icon: '🎓' },
      { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
    ]
  },
  {
    label: 'Academics', icon: '📚', children: [
      { label: 'Academic Years', path: '/admin/academic-years', icon: '📅' },
      { label: 'Terms', path: '/admin/terms', icon: '🗓' },
      { label: 'Classes', path: '/admin/classes', icon: '🏫' },
      { label: 'Sections', path: '/admin/sections', icon: '📋' },
      { label: 'Subjects', path: '/admin/subjects', icon: '📖' },
      { label: 'Enrollments', path: '/admin/enrollments', icon: '📝' },
      { label: 'Assignments', path: '/admin/teacher-assignments', icon: '📌' },
      { label: 'Timetable', path: '/admin/timetable', icon: '🕐' },
    ]
  },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

const NavGroup: React.FC<{ item: NavItem; collapsed: boolean }> = ({ item, collapsed }) => {
  const [open, setOpen] = useState(true);

  if (item.path) {
    return (
      <NavLink
        to={item.path}
        end={item.path === '/admin'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-600 hover:text-white'
          }`
        }
      >
        <span>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-primary-300 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{item.icon}</span>
          {!collapsed && item.label}
        </span>
        {!collapsed && <span>{open ? '▾' : '▸'}</span>}
      </button>
      {open && item.children && (
        <div className={collapsed ? '' : 'ml-4 mt-1 space-y-1'}>
          {item.children.map(child => (
            <NavGroup key={child.path} item={child} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
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
      {/* Logo & Name */}
      <div className="h-16 flex items-center px-4 border-b border-primary-600 shrink-0">
        <img src={institution.logoUrl} alt="Logo" className="h-8 w-8 rounded-full object-cover shrink-0" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{institution.shortName}</p>
            <p className="text-primary-300 text-xs truncate">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_NAV.map(item => (
          <NavGroup key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="p-3 border-t border-primary-600 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-primary-300 text-xs truncate">{user?.role.replace('_', ' ')}</p>
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

export default AdminSidebar;

