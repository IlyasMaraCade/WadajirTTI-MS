import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeacherDashboard } from '@/services/portalService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  School,
  BookOpen,
  Users,
  CalendarClock,
  ClipboardList,
  BookCheck,
  Sparkles,
} from 'lucide-react';

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

const TeacherDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 rounded-xl p-6 text-rose-700 dark:text-rose-300 font-medium">
        Failed to load teacher overview.
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Instruction & Coursework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">
            Instructor Dashboard
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            Manage your assigned courses, evaluate student marks, and submit daily attendance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Classes"
          value={stats?.totalClasses || 0}
          icon={School}
          gradient="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20"
          iconColor="text-teal-600 dark:text-teal-400"
          subtext="Classroom streams"
        />
        <StatCard
          label="Assigned Subjects"
          value={stats?.totalSubjects || 0}
          icon={BookOpen}
          gradient="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          subtext="Active curricula"
        />
        <StatCard
          label="Course Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          gradient="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtext="Assigned cohorts"
        />
        <StatCard
          label="Upcoming Exams"
          value={stats?.upcomingExams?.length || 0}
          icon={CalendarClock}
          gradient="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20"
          iconColor="text-amber-600 dark:text-amber-400"
          subtext="Scheduled tests"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <div className="modern-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Course Assignments</h2>
          </div>
          {stats?.activeAssignments?.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.activeAssignments.map((a: any) => (
                <li key={a._id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{a.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {a.class?.name} • {a.subject?.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400">No active assignments created.</p>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="modern-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <BookCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Subject Assessments</h2>
          </div>
          {stats?.upcomingExams?.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.upcomingExams.map((e: any) => (
                <li key={e._id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {e.name} <span className="text-slate-400 font-normal">({e.type})</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {e.class?.name} • {e.subject?.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <BookCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400">No upcoming tests created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
