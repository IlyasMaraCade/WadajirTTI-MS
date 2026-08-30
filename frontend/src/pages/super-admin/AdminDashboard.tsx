import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Users,
  UserCheck,
  GraduationCap,
  School,
  Layers,
  BookOpen,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Award,
  DollarSign,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  activeEnrollments: number;
  activeYear: string;
  activeTerm: string;
}

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  subtext?: string;
}> = ({ label, value, icon: Icon, gradient, iconColor, subtext }) => (
  <div className="modern-card modern-card-hover p-4 rounded-xl flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      <div className={`h-9 w-9 rounded-lg ${gradient} flex items-center justify-center shadow-xs`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {subtext && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-rose-700 dark:text-rose-300 font-medium">
        Failed to load dashboard statistics.
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-[10px] font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Master Control & Academic Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-300 text-xs mt-1">
            Real-time management for courses, students, faculty, and academic terms
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10 text-[11px]">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Academic Year: <strong className="text-white font-bold">{stats?.activeYear || 'Active'}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          gradient="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Faculty"
          value={stats?.totalTeachers ?? 0}
          icon={GraduationCap}
          gradient="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Courses"
          value={stats?.totalSubjects ?? 0}
          icon={BookOpen}
          gradient="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <StatCard
          label="Classes"
          value={stats?.totalClasses ?? 0}
          icon={School}
          gradient="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Sections"
          value={stats?.totalSections ?? 0}
          icon={Layers}
          gradient="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Enrolled"
          value={stats?.activeEnrollments ?? stats?.totalStudents ?? 0}
          icon={UserCheck}
          gradient="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="modern-card p-5 sm:p-6 rounded-2xl">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Quick Management Portals
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Directory', path: '/admin/students', icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' },
            { label: 'Staff', path: '/admin/teachers', icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
            { label: 'Attendance', path: '/admin/attendance', icon: ClipboardCheck, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20' },
            { label: 'Results', path: '/admin/marks', icon: Award, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' },
            { label: 'Finance', path: '/admin/finance-reports', icon: DollarSign, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' },
            { label: 'Performance', path: '/admin/performance-reports', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' },
            { label: 'Setup', path: '/admin/classes', icon: School, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
            { label: 'Catalog', path: '/admin/subjects', icon: BookOpen, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              <div className={`p-2.5 rounded-xl border ${action.color} transition-transform group-hover:scale-105`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
