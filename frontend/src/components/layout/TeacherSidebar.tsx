import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  FileText,
  LogOut
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
  { label: 'My Students', path: '/teacher/students', icon: Users },
  { label: 'Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Exams & Marks', path: '/teacher/exams', icon: FileText },
];

const TeacherSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { institution } = useInstitutionStore();

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-primary flex flex-col h-full shadow-xl z-20`}>
      <div className="h-16 flex items-center px-4 border-b border-primary-600 shrink-0 bg-primary-600">
        <img src={institution.logoUrl} alt="Logo" className="h-9 w-9 rounded-md object-cover shrink-0 shadow-sm" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-[14px] truncate tracking-tight">{institution.shortName}</p>
            <p className="text-primary-200 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Teacher Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
        {!collapsed && <p className="px-3 text-[11px] font-semibold text-primary-300 uppercase tracking-wider mb-2">Main Menu</p>}
        {TEACHER_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/teacher'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''} ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-600 shrink-0 bg-primary-600">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-200 hover:text-red-100 hover:bg-red-500 rounded-md transition-colors ${collapsed ? 'px-0' : ''}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
