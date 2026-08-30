import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrincipalDashboard } from '@/services/portalService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Users, GraduationCap, School, Activity, FileText, CheckCircle2 } from 'lucide-react';

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

const PrincipalDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['principal-dashboard'],
    queryFn: getPrincipalDashboard,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
      Failed to load dashboard.
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Principal Dashboard</h1>
        <p className="text-gray-500 mt-2 text-sm">School-wide overview for Academic Year: <strong className="text-primary">{stats?.activeYear}</strong></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} color="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Active Teachers" value={stats?.totalTeachers || 0} icon={GraduationCap} color="bg-purple-100" iconColor="text-purple-600" />
        <StatCard label="Total Classes" value={stats?.totalClasses || 0} icon={School} color="bg-orange-100" iconColor="text-orange-600" />
        <StatCard label="Today's Attendance Rate" value={`${stats?.attendanceRate || 0}%`} icon={Activity} color="bg-green-100" iconColor="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="modern-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Exams</h2>
          </div>
          {stats?.recentExams?.length > 0 ? (
            <ul className="space-y-4">
              {stats.recentExams.map((e: any) => (
                <li key={e._id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{e.class?.name} - {e.subject?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {new Date(e.date).toLocaleDateString()}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-medium">By: {e.createdBy?.name || e.createdBy?.firstName}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No recent exams.</p>
            </div>
          )}
        </div>

        <div className="modern-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Today's Attendance Snapshot</h2>
          </div>
          {stats?.todayAttendance?.length > 0 ? (
            <div className="space-y-4">
              {stats.todayAttendance.map((a: any) => (
                <div key={a._id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <span className="font-semibold text-gray-700 text-sm">{a._id}</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">{a.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No attendance recorded today yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PrincipalDashboard;

