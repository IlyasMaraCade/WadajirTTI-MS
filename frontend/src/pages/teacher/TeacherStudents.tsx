import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyStudents, getTeacherDashboard } from '@/services/portalService';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/common/Badge';

const TeacherStudents = () => {
  const [classId, setClassId] = useState('');

  const { data: dashboard } = useQuery({ queryKey: ['teacher-dashboard'], queryFn: getTeacherDashboard });
  const assignments = dashboard?.assignments || [];

  // Unique classes from assignments
  const uniqueClasses = Array.from(new Map(assignments.map((a: any) => [a.class?._id, a.class])).values()).filter(Boolean);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['teacher-students', classId],
    queryFn: () => getMyStudents(classId ? { classId } : {}),
  });

  const columns = [
    { accessorKey: 'student.studentId', header: 'Student ID' },
    {
      accessorKey: 'student.fullName',
      header: 'Full Name',
      cell: ({ row }: any) => (
        <span className="font-semibold text-gray-900">
          {row.original.student?.fullName || `${row.original.student?.firstName || ''} ${row.original.student?.lastName || ''}`}
        </span>
      ),
    },
    {
      accessorKey: 'student.courses',
      header: 'Enrolled Courses',
      cell: ({ row }: any) => {
        const courses = row.original.student?.courses || [];
        return (
          <div className="flex flex-wrap gap-1">
            {courses.map((c: string) => (
              <span key={c} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                {c}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'class.name',
      header: 'Class',
      cell: ({ row }: any) => row.original.class?.name || '—',
    },
    {
      accessorKey: 'section.name',
      header: 'Section',
      cell: ({ row }: any) => row.original.section?.name || '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => (
        <Badge variant={getValue() === 'Active' ? 'success' : 'default'}>{getValue()}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 text-sm mt-1">Students enrolled in your assigned classes and subjects</p>
        </div>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:border-primary shadow-sm"
        >
          <option value="">All Assigned Classes</option>
          {(uniqueClasses as any[]).map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable data={enrollments} columns={columns} isLoading={isLoading} emptyMessage="No students found." />
      </div>
    </div>
  );
};

export default TeacherStudents;
