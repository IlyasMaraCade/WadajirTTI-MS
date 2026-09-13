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
  TrendingUp,
  Award,
  Wallet,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
  iconBgClass: string;
  subtext?: string;
}> = ({ label, value, icon: Icon, bgClass, textClass, iconBgClass, subtext }) => (
  <div className={`card-hover relative overflow-hidden p-6 rounded-2xl flex flex-col justify-between shadow-sm cursor-pointer ${bgClass} group border border-slate-100`}>
    
    <div className="flex items-center justify-between relative z-10">
      <span className={`text-xs font-bold uppercase tracking-wider ${textClass} opacity-80`}>{label}</span>
      <div className={`h-10 w-10 rounded-xl ${iconBgClass} flex items-center justify-center shadow-sm`}>
        <Icon className={`w-5 h-5 ${textClass}`} />
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <p className={`text-3xl font-black ${textClass} tracking-tight`}>{value}</p>
      {subtext && <p className={`text-[11px] font-semibold ${textClass} opacity-70 mt-1`}>{subtext}</p>}
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
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-700 font-medium">
        Failed to load principal dashboard.
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Banner */}
      <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-xl border border-slate-800">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-emerald-50 rounded-full blur-3xl translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white backdrop-blur-md rounded-full border border-white/10 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold tracking-wider text-white uppercase">Management Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              Welcome back, Principal
            </h1>
            <p className="text-slate-300 text-sm font-medium max-w-lg">
              School-wide academic monitoring, student attendance, and faculty performance at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-white backdrop-blur-md border border-white/10 rounded-2xl shadow-inner">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Academic Term</p>
              <p className="text-sm font-black text-white">{stats?.activeYear || 'Active'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          bgClass="bg-blue-50"
          textClass="text-blue-900"
          iconBgClass="bg-white"
          subtext="Enrolled across programs"
        />
        <StatCard
          label="Teaching Faculty"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          bgClass="bg-emerald-50"
          textClass="text-emerald-900"
          iconBgClass="bg-white"
          subtext="Active instructors"
        />
        <StatCard
          label="Active Classrooms"
          value={stats?.totalClasses || 0}
          icon={School}
          bgClass="bg-amber-50"
          textClass="text-amber-900"
          iconBgClass="bg-white"
          subtext="Scheduled training streams"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats?.attendanceRate || 100}%`}
          icon={Activity}
          bgClass="bg-rose-50"
          textClass="text-rose-900"
          iconBgClass="bg-white"
          subtext="School-wide participation"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Principal Actions - Spans 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/principal/students" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Register Student</span>
            </Link>

            <Link to="/principal/alumni" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-blue-100 bg-blue-50 hover:bg-blue-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Alumni</span>
            </Link>

            <Link to="/principal/teachers" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Register Teacher</span>
            </Link>

            <Link to="/principal/finance-reports" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-rose-100 bg-rose-50 hover:bg-rose-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-rose-700 transition-colors">Finance Reports</span>
            </Link>

            <Link to="/principal/attendance" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-teal-100 bg-teal-50/50 hover:bg-teal-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-teal-700 transition-colors">Attendance</span>
            </Link>

            <Link to="/principal/performance" className="card-hover group relative overflow-hidden p-4 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
              <div className="p-3 rounded-xl bg-white shadow-sm text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-purple-700 transition-colors">Performance</span>
            </Link>
          </div>
        </div>

        {/* Recent Exams - Spans 1 column */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Assessments
            </h2>
            <Link to="/principal/exams" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
              View All
            </Link>
          </div>
          
          <div className="flex-1">
            {stats?.recentExams?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentExams.map((e: any) => (
                  <div key={e._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{e.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {e.class?.name} • {e.subject?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white shadow-sm text-slate-600 border border-slate-200">
                        {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">No scheduled exams</p>
                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px]">There are no recent or upcoming assessments to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
