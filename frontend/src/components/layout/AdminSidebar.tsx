import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CalendarRange,
  School,
  Layers,
  UserCircle,
  ClipboardCheck,
  Award,
  DollarSign,
  BarChart3,
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
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Students', path: '/admin/students', icon: GraduationCap },
      { label: 'Teachers', path: '/admin/teachers', icon: UserCircle },
      { label: 'Classes', path: '/admin/classes', icon: School },
      { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
      { label: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
      { label: 'Exam Marks', path: '/admin/marks', icon: Award },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Academic Years', path: '/admin/academic-years', icon: CalendarDays },
      { label: 'Terms', path: '/admin/terms', icon: CalendarRange },
    ]
  },
  {
    title: 'FINANCE & REPORTS',
    items: [
      { label: 'Invoices & Billing', path: '/admin/invoices', icon: DollarSign },
      { label: 'Payments & Receipts', path: '/admin/payments', icon: DollarSign },
      { label: 'Expenses Ledger', path: '/admin/expenses', icon: DollarSign },
      { label: 'Finance Reports', path: '/admin/finance-reports', icon: DollarSign },
      { label: 'Performance', path: '/admin/performance-reports', icon: BarChart3 },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Users & Roles', path: '/admin/users', icon: Users },
      { label: 'My Profile', path: '/admin/profile', icon: User },
    ]
  }
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ collapsed, setMobileOpen }) => {
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
        transition-all duration-300 bg-surface border-r border-border flex flex-col h-full z-50 select-none
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={institution.logoUrl}
            alt="Logo"
            className="h-9 w-9 rounded-xl object-contain shrink-0 bg-white"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary truncate">
                {institution.shortName}
              </span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Management System
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav list */}
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
                  end={item.path === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-primary-50 text-primary-700 font-bold border border-primary-100"
                        : "text-text-secondary"
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-[18px] h-[18px] shrink-0 ${collapsed ? 'mx-auto' : ''} ${
                    window.location.pathname === item.path || (item.path === '/admin' && window.location.pathname === '/admin') ? 'text-primary' : ''
                  }`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Sign out */}
      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-status-danger hover:bg-rose-50 rounded-xl transition-colors ${
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

export default AdminSidebar;







