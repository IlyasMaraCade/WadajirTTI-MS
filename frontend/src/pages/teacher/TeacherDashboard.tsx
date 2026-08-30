import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeacherDashboard } from '@/services/portalService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const StatCard: React.FC<{ label: string; value: number | string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-surface rounded-lg border border-border p-6 flex items-center gap-4 shadow-sm">
    <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
      Failed to load dashboard.
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Teacher Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back. Here is your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Assigned Classes" value={stats?.totalClasses || 0} icon="🏫" color="bg-blue-50" />
        <StatCard label="Assigned Subjects" value={stats?.totalSubjects || 0} icon="📖" color="bg-green-50" />
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon="🎓" color="bg-purple-50" />
        <StatCard label="Upcoming Exams" value={stats?.upcomingExams?.length || 0} icon="📝" color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Assignments</h2>
          {stats?.activeAssignments?.length > 0 ? (
            <ul className="space-y-3">
              {stats.activeAssignments.map((a: any) => (
                <li key={a._id} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.class?.name} - {a.subject?.name}</p>
                  </div>
                  <span className="text-xs font-medium text-orange-600">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">No pending assignments.</p>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Upcoming Exams</h2>
          {stats?.upcomingExams?.length > 0 ? (
            <ul className="space-y-3">
              {stats.upcomingExams.map((e: any) => (
                <li key={e._id} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{e.name} ({e.type})</p>
                    <p className="text-xs text-text-secondary">{e.class?.name} - {e.subject?.name}</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">No upcoming exams.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;