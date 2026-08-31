import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrincipalDashboard } from '@/services/portalService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Users,
  GraduationCap,
  School,
  Activity,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

const PrincipalDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['principal-dashboard'],
    queryFn: getPrincipalDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-rose-700 dark:text-rose-300 font-medium">
        Failed to load principal dashboard.
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Supervision & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">
            Principal Overview
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            School-wide academic monitoring, student attendance, and faculty performance
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary">
            Academic Term: <span className="text-primary">{stats?.activeYear || 'Active'}</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          gradient="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          subtext="Enrolled across programs"
        />
        <StatCard
          label="Teaching Faculty"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          gradient="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtext="Active instructors"
        />
        <StatCard
          label="Active Classrooms"
          value={stats?.totalClasses || 0}
          icon={School}
          gradient="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20"
          iconColor="text-amber-600 dark:text-amber-400"
          subtext="Scheduled training streams"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats?.attendanceRate || 100}%`}
          icon={Activity}
          gradient="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20"
          iconColor="text-teal-600 dark:text-teal-400"
          subtext="School-wide participation"
        />
      </div>

      {/* Exams and Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="modern-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Recent Scheduled Assessments
            </h2>
            <Link to="/principal/exams" className="text-[11px] font-semibold text-amber-600 hover:underline">
              View Schedule
            </Link>
          </div>
          {stats?.recentExams?.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentExams.map((e: any) => (
                <li key={e._id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{e.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {e.class?.name} • {e.subject?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                      {new Date(e.date).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400">No scheduled exams for this period.</p>
            </div>
          )}
        </div>

        {/* Quick Principal Actions */}
        <div className="modern-card p-5 rounded-2xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Administrative Shortcuts
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Register Student', path: '/principal/students', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' },
              { label: 'Register Teacher', path: '/principal/teachers', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
              { label: 'Manage Classes', path: '/principal/classes', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' },
              { label: 'Finance Reports', path: '/principal/finance-reports', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' },
              { label: 'Attendance', path: '/principal/attendance', color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20' },
              { label: 'Performance', path: '/principal/performance', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group"
              >
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {action.label}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
