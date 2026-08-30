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
  ArrowRight
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

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ElementType; color: string; iconColor: string }> = ({ label, value, icon: Icon, color, iconColor }) => (
  <div className="modern-card rounded-xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-14 w-14 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className={`w-7 h-7 ${iconColor}`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 flex items-center gap-3">
      Failed to load dashboard. Please check your connection.
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm">
            {stats?.activeYear !== 'None' ? (
              <>
                <CalendarDays className="w-4 h-4" />
                <span>Academic Year: <strong className="text-primary">{stats?.activeYear}</strong></span>
                {stats?.activeTerm !== 'None' && <span>&bull; Term: <strong className="text-primary">{stats?.activeTerm}</strong></span>}
              </>
            ) : (
              <span className="text-yellow-600 font-medium">⚠️ No active academic year set</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon={Users} color="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Active Enrollments" value={stats?.activeEnrollments ?? 0} icon={UserCheck} color="bg-green-100" iconColor="text-green-600" />
        <StatCard label="Total Teachers" value={stats?.totalTeachers ?? 0} icon={GraduationCap} color="bg-purple-100" iconColor="text-purple-600" />
        <StatCard label="Classes" value={stats?.totalClasses ?? 0} icon={School} color="bg-orange-100" iconColor="text-orange-600" />
        <StatCard label="Sections" value={stats?.totalSections ?? 0} icon={Layers} color="bg-teal-100" iconColor="text-teal-600" />
        <StatCard label="Subjects" value={stats?.totalSubjects ?? 0} icon={BookOpen} color="bg-pink-100" iconColor="text-pink-600" />
      </div>

      {/* Quick Actions */}
      <div className="modern-card rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Manage Students', path: '/admin/students', icon: Users, color: 'text-blue-500' },
            { label: 'Manage Teachers', path: '/admin/teachers', icon: GraduationCap, color: 'text-purple-500' },
            { label: 'Classes & Sections', path: '/admin/classes', icon: School, color: 'text-orange-500' },
            { label: 'Academic Years', path: '/admin/academic-years', icon: CalendarDays, color: 'text-teal-500' },
          ].map(action => (
            <Link
              key={action.label}
              to={action.path}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 hover:border-accent hover:bg-accent/5 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-full bg-gray-50 group-hover:bg-white transition-colors ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-accent flex items-center gap-1">
                {action.label}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

