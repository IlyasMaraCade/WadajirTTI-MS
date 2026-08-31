import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';
import {
  LayoutDashboard,
  GraduationCap,
  UserPlus,
  BookOpen,
  School,
  FileCheck,
  Activity,
  DollarSign,
  LineChart,
  User,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/principal', icon: LayoutDashboard },
      { label: 'Students', path: '/principal/students', icon: GraduationCap },
      { label: 'Teachers', path: '/principal/teachers', icon: UserPlus },
      { label: 'Classes & Sections', path: '/principal/classes', icon: School },
      { label: 'Courses & Subjects', path: '/principal/subjects', icon: BookOpen },
    ]
  },
  {
    title: 'ACADEMICS & FINANCE',
    items: [
      { label: 'Exam Schedule', path: '/principal/exams', icon: FileCheck },
      { label: 'Attendance Monitor', path: '/principal/attendance', icon: Activity },
      { label: 'Financial Summary', path: '/principal/finance-reports', icon: DollarSign },
      { label: 'Academic Performance', path: '/principal/performance', icon: LineChart },
    ]
  },
  {
    title: 'PERSONAL',
    items: [
      { label: 'My Profile', path: '/principal/profile', icon: User },
    ]
  }
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const PrincipalSidebar: React.FC<SidebarProps> = ({ collapsed, setMobileOpen }) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { institution } = useInstitutionStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <aside
      className={`
        ${collapsed ? 'w-20' : 'w-64'} 
        transition-all duration-300 bg-surface dark:bg-primary-950 border-r border-border dark:border-primary-800 flex flex-col h-full z-50 select-none
      `}
    >
      <div className="h-16 flex items-center px-4 border-b border-border dark:border-primary-800 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={institution.logoUrl}
            alt="Logo"
            className="h-9 w-9 rounded-xl object-contain shrink-0 bg-white"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary dark:text-white truncate">
                {institution.shortName}
              </span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Principal Portal
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/principal'}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-800/50 text-primary dark:text-accent font-semibold'
                        : 'text-text-secondary hover:bg-slate-100 dark:hover:bg-primary-800 hover:text-text-primary dark:hover:text-white'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-[18px] h-[18px] shrink-0 ${collapsed ? 'mx-auto' : ''} ${
                    window.location.pathname === item.path || (item.path === '/principal' && window.location.pathname === '/principal') ? 'text-primary dark:text-accent' : ''
                  }`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border dark:border-primary-800 shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-status-danger hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors ${
            collapsed ? 'px-0' : ''
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default PrincipalSidebar;
