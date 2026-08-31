import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  PlusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  activeEnrollments: number;
  activeYear: string;
  totalIncome: number;
  totalExpenses: number;
  outstandingFees: number;
  recentStudents: any[];
  recentExams: any[];
}

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}> = ({ label, value, icon: Icon, colorClass }) => (
  <div className="modern-card modern-card-hover p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{label}</span>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <p className="text-3xl font-extrabold text-text-primary tracking-tight">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { data: stats, isLoading, isError } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="bg-status-danger/10 border border-status-danger/20 rounded-2xl p-6 text-status-danger font-bold">
        Failed to load dashboard statistics.
      </div>
    );

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  // Chart Data
  const financialData = [
    { name: 'Income', amount: stats?.totalIncome || 0, color: '#00C9C8' }, // accent
    { name: 'Expenses', amount: stats?.totalExpenses || 0, color: '#F59E0B' }, // warning
    { name: 'Outstanding', amount: stats?.outstandingFees || 0, color: '#EF4444' }, // danger
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            Here's what's happening at Wadajir Institute today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
          <CalendarDays className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary">
            Academic Year: <span className="text-primary">{stats?.activeYear || 'Active'}</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          colorClass="bg-primary/10 text-primary dark:bg-primary-900 dark:text-accent"
        />
        <StatCard
          label="Active Faculty"
          value={stats?.totalTeachers ?? 0}
          icon={GraduationCap}
          colorClass="bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent"
        />
        <StatCard
          label="Classes"
          value={stats?.totalClasses ?? 0}
          icon={School}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalIncome ?? 0)}
          icon={TrendingUp}
          colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Chart */}
        <div className="modern-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-text-primary tracking-wide uppercase">
              Financial Overview
            </h2>
            <Link to="/admin/finance-reports" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="modern-card p-6 flex flex-col bg-primary dark:bg-primary-900 border-none shadow-glow text-white">
          <h2 className="text-sm font-bold text-accent tracking-wide uppercase mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { label: 'Add Student', icon: PlusCircle, path: '/admin/students' },
              { label: 'Record Fee', icon: DollarSign, path: '/admin/finance-reports' },
              { label: 'Create Exam', icon: Award, path: '/admin/marks' },
              { label: 'New Subject', icon: BookOpen, path: '/admin/subjects' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-accent/20 border border-white/5 hover:border-accent/40 transition-all text-center group"
              >
                <action.icon className="w-6 h-6 text-white group-hover:text-accent transition-colors" />
                <span className="text-xs font-bold text-white/90 group-hover:text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-text-primary tracking-wide uppercase">
              Recent Registrations
            </h2>
            <Link to="/admin/students" className="text-xs font-bold text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentStudents?.length ? (
              stats.recentStudents.map((student: any) => (
                <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-primary-900/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-800 flex items-center justify-center text-primary dark:text-accent font-bold text-sm shrink-0">
                    {student.fullName?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-text-muted font-mono">{student.studentId}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted py-4 text-center">No recent registrations</p>
            )}
          </div>
        </div>

        {/* Upcoming Schedule / Exams */}
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-text-primary tracking-wide uppercase">
              Recent & Upcoming Exams
            </h2>
            <Link to="/admin/marks" className="text-xs font-bold text-accent hover:underline">
              Manage Exams
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentExams?.length ? (
              stats.recentExams.map((exam: any) => (
                <div key={exam._id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-primary-900/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 dark:bg-accent/20 flex flex-col items-center justify-center shrink-0 border border-accent/20">
                    <span className="text-[10px] font-bold text-accent uppercase leading-none mb-1">
                      {new Date(exam.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black text-primary dark:text-white leading-none">
                      {new Date(exam.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-bold text-text-primary truncate">{exam.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate">{exam.subject?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pt-1">
                    <span className="text-xs font-bold text-text-primary block">{exam.maxMarks} Marks</span>
                    <span className="text-[10px] text-text-muted font-medium block">{exam.term}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-primary-800 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm font-bold text-text-primary">No Scheduled Exams</p>
                <p className="text-xs text-text-muted mt-1">Check back later or create a new exam.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
