import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrincipalDashboard } from '@/services/portalService';
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

const PrincipalDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['principal-dashboard'],
    queryFn: getPrincipalDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="p-4 text-red-600 bg-red-50 rounded-lg">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Principal Dashboard</h1>
        <p className="text-text-secondary mt-1">School-wide overview for Academic Year: <span className="font-medium text-primary">{stats?.activeYear}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon="🎓" color="bg-blue-50" />
        <StatCard label="Active Teachers" value={stats?.totalTeachers || 0} icon="👨‍🏫" color="bg-purple-50" />
        <StatCard label="Total Classes" value={stats?.totalClasses || 0} icon="🏫" color="bg-orange-50" />
        <StatCard label="Today's Attendance Rate" value={`${stats?.attendanceRate || 0}%`} icon="✅" color="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Exams</h2>
          {stats?.recentExams?.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentExams.map((e: any) => (
                <li key={e._id} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{e.name}</p>
                    <p className="text-xs text-text-secondary">{e.class?.name} - {e.subject?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-600">{new Date(e.date).toLocaleDateString()}</p>
                    <p className="text-xs text-text-secondary">By: {e.createdBy?.name || e.createdBy?.firstName}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">No recent exams.</p>
          )}
        </div>

        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Today's Attendance Snapshot</h2>
          {stats?.todayAttendance?.length > 0 ? (
            <div className="space-y-2 mt-4">
              {stats.todayAttendance.map((a: any) => (
                <div key={a._id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-text-secondary">{a._id}</span>
                  <span className="font-bold">{a.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No attendance recorded today yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;