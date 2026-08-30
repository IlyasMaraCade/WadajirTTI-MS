import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

const StatCard: React.FC<{ label: string; value: number | string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-surface rounded-lg border border-border p-6 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
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
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
      Failed to load dashboard. Please check your connection.
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Super Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">
          {stats?.activeYear !== 'None' ? (
            <>Academic Year: <span className="font-medium text-primary">{stats?.activeYear}</span>
            {stats?.activeTerm !== 'None' && <> &bull; Term: <span className="font-medium text-primary">{stats?.activeTerm}</span></>}
            </>
          ) : (
            <span className="text-yellow-600">⚠️ No active academic year set</span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon="🎓" color="bg-blue-50" />
        <StatCard label="Active Enrollments" value={stats?.activeEnrollments ?? 0} icon="📝" color="bg-green-50" />
        <StatCard label="Total Teachers" value={stats?.totalTeachers ?? 0} icon="👨‍🏫" color="bg-purple-50" />
        <StatCard label="Classes" value={stats?.totalClasses ?? 0} icon="🏫" color="bg-orange-50" />
        <StatCard label="Sections" value={stats?.totalSections ?? 0} icon="📋" color="bg-teal-50" />
        <StatCard label="Subjects" value={stats?.totalSubjects ?? 0} icon="📖" color="bg-pink-50" />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Student', path: '/admin/students', icon: '🎓' },
            { label: 'Add Teacher', path: '/admin/teachers', icon: '👨‍🏫' },
            { label: 'Manage Enrollments', path: '/admin/enrollments', icon: '📝' },
            { label: 'Academic Years', path: '/admin/academic-years', icon: '📅' },
          ].map(action => (
            <a
              key={action.label}
              href={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-text-primary">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-primary">
        <strong>Wadajir Technical and Training Institute</strong> — Management System v1.0
      </div>
    </div>
  );
};

export default AdminDashboard;