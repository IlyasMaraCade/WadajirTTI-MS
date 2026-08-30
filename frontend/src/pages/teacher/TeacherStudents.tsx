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
  const uniqueClasses = Array.from(new Map(assignments.map((a: any) => [a.class._id, a.class])).values());

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['teacher-students', classId],
    queryFn: () => getMyStudents(classId ? { classId } : {}),
  });

  const columns = [
    { accessorKey: 'student.studentId', header: 'Student ID' },
    { accessorKey: 'student.firstName', header: 'First Name' },
    { accessorKey: 'student.lastName', header: 'Last Name' },
    { accessorKey: 'class.name', header: 'Class' },
    { accessorKey: 'section.name', header: 'Section' },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }: any) => <Badge variant={getValue() === 'Active' ? 'success' : 'default'}>{getValue()}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">My Students</h1>
        <select 
          value={classId} 
          onChange={(e) => setClassId(e.target.value)}
          className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">All Assigned Classes</option>
          {(uniqueClasses as any[]).map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={enrollments} columns={columns} isLoading={isLoading} emptyMessage="No students found." />
      </div>
    </div>
  );
};

export default TeacherStudents;

