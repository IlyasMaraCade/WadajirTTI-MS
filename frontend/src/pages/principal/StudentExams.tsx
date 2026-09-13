import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Search, Printer } from 'lucide-react';

export const StudentExams: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-marks'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/marks');
      return res.data?.data || [];
    },
  });

  const { data: systemSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await apiClient.get('/academics/subjects');
      return res.data?.data || [];
    },
  });

  const { data: publicSubjects } = useQuery({
    queryKey: ['public-subjects'],
    queryFn: async () => {
      const res = await apiClient.get('/teachers/public/subjects');
      return res.data?.data || [];
    },
  });

  const combinedSubjects = Array.from(
    new Set([
      ...(systemSubjects || []).map((s: any) => s.name),
      ...(publicSubjects || [])
    ])
  ).sort();

  const marks = data || [];
  
  const filteredMarks = marks.filter((m: any) => {
    const sName = m.exam?.subject?.name || m.exam?.subjectName || '';
    const matchType = typeFilter === 'ALL' || m.exam?.type === typeFilter;
    const matchSubject = subjectFilter === 'ALL' || sName === subjectFilter;
    const matchSearch = m.student?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
                        m.exam?.name?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSubject && matchSearch;
  });

  const columns: ColumnDef<any, any>[] = [
    { accessorKey: 'student.studentId', header: 'Student ID', cell: ({ row }) => <span className="font-mono text-xs text-slate-500">{row.original.student?.studentId || '—'}</span> },
    { accessorKey: 'student.fullName', header: 'Student Name', cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.student?.fullName || '—'}</span> },
    { accessorKey: 'exam.type', header: 'Type', cell: ({ row }) => <span className="text-xs font-semibold text-gray-700">{row.original.exam?.type || '—'}</span> },
    { accessorKey: 'subject', header: 'Subject', cell: ({ row }) => row.original.exam?.subject?.name || row.original.exam?.subjectName || '—' },
    { accessorKey: 'score', header: 'Score', cell: ({ row }) => <span className="font-bold text-gray-900">{row.original.score} / {row.original.exam?.maxMarks || 100}</span> },
    { 
      accessorKey: 'grade', 
      header: 'Grade', 
      cell: ({ row }) => {
        const grade = row.original.grade;
        let variant: any = 'neutral';
        if (grade === 'A' || grade === 'A+') variant = 'success';
        else if (grade === 'B' || grade === 'B+') variant = 'info';
        else if (grade === 'C') variant = 'warning';
        else if (grade === 'D' || grade === 'F') variant = 'danger';
        return <Badge variant={variant}>{grade}</Badge>;
      } 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Print header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold">Wadajir Technical and Training Institute</h1>
        <p className="text-sm text-slate-600">Student Exams & Marks Report</p>
        <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Exams & Marks</h1>
          <p className="text-gray-500 text-sm mt-1">
            View all recorded student marks and grades across exams
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-hover cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print Results
        </button>
      </div>
      
      <div className="flex gap-3 no-print">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search students or exams..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary cursor-pointer">
          <option value="ALL">All Subjects</option>
          {combinedSubjects.map((subName: any) => <option key={subName} value={subName}>{subName}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary cursor-pointer">
          <option value="ALL">All Types</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
          <option value="Quiz">Quiz</option>
          <option value="Assignment">Assignment</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={filteredMarks}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No student marks recorded yet."
        />
      </div>
    </div>
  );
};

export default StudentExams;