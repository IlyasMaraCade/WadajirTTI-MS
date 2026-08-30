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

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Users & Roles', path: '/admin/users', icon: Users },
  { label: 'Students', path: '/admin/students', icon: GraduationCap },
  { label: 'Teachers', path: '/admin/teachers', icon: UserCircle },
  { label: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Exam Marks', path: '/admin/marks', icon: Award },
  { label: 'Academic Years', path: '/admin/academic-years', icon: CalendarDays },
  { label: 'Terms', path: '/admin/terms', icon: CalendarRange },
  { label: 'Classes', path: '/admin/classes', icon: School },
  { label: 'Sections', path: '/admin/sections', icon: Layers },
  { label: 'Subjects / Courses', path: '/admin/subjects', icon: BookOpen },
  { label: 'Finance Reports', path: '/admin/finance-reports', icon: DollarSign },
  { label: 'Student Performance', path: '/admin/performance-reports', icon: BarChart3 },
  { label: 'My Profile & Settings', path: '/admin/profile', icon: User },
];

const AdminSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
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
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } transition-all duration-200 bg-[#0f172a] dark:bg-[#090d16] border-r border-slate-800 flex flex-col h-full z-20 select-none`}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800 shrink-0 bg-[#0c1322]">
        <img
          src={institution.logoUrl}
          alt="Logo"
          className="h-7 w-7 rounded-lg object-cover shrink-0 ring-1 ring-slate-700"
        />
        {!collapsed && (
          <div className="ml-2.5 overflow-hidden">
            <p className="text-white font-bold text-xs truncate tracking-tight">
              {institution.shortName}
            </p>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Super Admin
            </p>
          </div>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:scale-[1.02]'
              }`
            }
          >
            <item.icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Sign out */}
      <div className="p-2 border-t border-slate-800 shrink-0 bg-[#0c1322]">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ${
            collapsed ? 'px-0' : ''
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
