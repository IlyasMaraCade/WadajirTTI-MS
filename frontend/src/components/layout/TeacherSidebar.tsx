import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CheckCircle,
  FileCheck,
  User,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
  { label: 'My Classes & Students', path: '/teacher/classes', icon: Users },
  { label: 'Mark Attendance', path: '/teacher/attendance', icon: ClipboardList },
  { label: 'Assignments & Marks', path: '/teacher/marks', icon: FileCheck },
  { label: 'Course Evaluation', path: '/teacher/evaluations', icon: CheckCircle },
  { label: 'My Profile & Settings', path: '/teacher/profile', icon: User },
];

const TeacherSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
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
            <p className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
              Faculty / Teacher
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {TEACHER_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/teacher'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:scale-[1.02]'
              }`
            }
          >
            <item.icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

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

export default TeacherSidebar;
