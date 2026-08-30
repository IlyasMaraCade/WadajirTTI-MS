import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInstitutionStore } from '@/store/institutionStore';
import { logoutUser } from '@/services/authService';
import { 
  LayoutDashboard, 
  Activity, 
  LineChart,
  LogOut
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const PRINCIPAL_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/principal', icon: LayoutDashboard },
  { label: 'Attendance Monitor', path: '/principal/attendance', icon: Activity },
  { label: 'Academic Performance', path: '/principal/performance', icon: LineChart },
];

const PrincipalSidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { institution } = useInstitutionStore();

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-[#0f172a] flex flex-col h-full shadow-xl z-20`}>
      <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0 bg-[#0b1121]">
        <img src={institution.logoUrl} alt="Logo" className="h-9 w-9 rounded-md object-cover shrink-0 shadow-sm" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-slate-100 font-bold text-[14px] truncate tracking-tight">{institution.shortName}</p>
            <p className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Principal Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
        {!collapsed && <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>}
        {PRINCIPAL_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/principal'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group ${
                isActive 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''} ${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-white'}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0 bg-[#0b1121]">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors ${collapsed ? 'px-0' : ''}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default PrincipalSidebar;
