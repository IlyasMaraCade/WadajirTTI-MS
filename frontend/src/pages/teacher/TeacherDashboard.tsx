import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeacherDashboard } from '@/services/portalService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { School, BookOpen, Users, CalendarClock, ClipboardList, BookCheck } from 'lucide-react';

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

const TeacherDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-2 text-sm">Welcome back. Here is your academic overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Assigned Classes" value={stats?.totalClasses || 0} icon={School} color="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Assigned Subjects" value={stats?.totalSubjects || 0} icon={BookOpen} color="bg-green-100" iconColor="text-green-600" />
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} color="bg-purple-100" iconColor="text-purple-600" />
        <StatCard label="Upcoming Exams" value={stats?.upcomingExams?.length || 0} icon={CalendarClock} color="bg-orange-100" iconColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Assignments */}
        <div className="modern-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Pending Assignments</h2>
          </div>
          {stats?.activeAssignments?.length > 0 ? (
            <ul className="space-y-4">
              {stats.activeAssignments.map((a: any) => (
                <li key={a._id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.class?.name} - {a.subject?.name}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No pending assignments.</p>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="modern-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BookCheck className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Upcoming Exams</h2>
          </div>
          {stats?.upcomingExams?.length > 0 ? (
            <ul className="space-y-4">
              {stats.upcomingExams.map((e: any) => (
                <li key={e._id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{e.name} <span className="text-gray-400 font-normal">({e.type})</span></p>
                    <p className="text-xs text-gray-500 mt-1">{e.class?.name} - {e.subject?.name}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <BookCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No upcoming exams.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;

