import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Award, Printer, Search } from 'lucide-react';

interface MarkRecord {
  _id: string;
  student: { _id: string; studentId: string; fullName: string };
  exam: {
    _id: string;
    name: string;
    maxMarks: number;
    class: { name: string };
    subject: { name: string };
    createdBy: { firstName: string; lastName: string };
  };
  score: number;
  grade: string;
  remarks?: string;
  recordedBy: { firstName: string; lastName: string };
  createdAt: string;
}

export const ExamMarksView: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-marks'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/marks');
      return res.data;
    },
  });

  const allMarks: MarkRecord[] = data?.data || [];

  const filteredMarks = allMarks.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.student?.fullName?.toLowerCase().includes(q) ||
      m.student?.studentId?.toLowerCase().includes(q) ||
      m.exam?.name?.toLowerCase().includes(q) ||
      m.exam?.subject?.name?.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<MarkRecord, any>[] = [
    {
      accessorKey: 'student.studentId',
      header: 'Student ID',
      cell: ({ row }) => row.original.student?.studentId || '—',
    },
    {
      accessorKey: 'student.fullName',
      header: 'Student Name',
      cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.student?.fullName || '—'}</span>,
    },
    {
      accessorKey: 'exam.name',
      header: 'Exam',
      cell: ({ row }) => row.original.exam?.name || '—',
    },
    {
      accessorKey: 'exam.subject.name',
      header: 'Subject',
      cell: ({ row }) => row.original.exam?.subject?.name || '—',
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <span className="font-bold text-gray-800">
          {row.original.score} / {row.original.exam?.maxMarks || 100}
        </span>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ getValue }) => {
        const grade = getValue<string>();
        const variants: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
          A: 'success',
          B: 'info',
          C: 'warning',
          D: 'warning',
          F: 'danger',
        };
        return <Badge variant={variants[grade] || 'info'}>{grade}</Badge>;
      },
    },
    {
      accessorKey: 'recordedBy',
      header: 'Evaluator',
      cell: ({ row }) =>
        row.original.recordedBy
          ? `${row.original.recordedBy.firstName} ${row.original.recordedBy.lastName}`
          : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results & Marks</h1>
          <p className="text-gray-500 text-sm mt-1">School-wide academic evaluation records</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search student or exam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Results
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={filteredMarks}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No exam marks recorded yet."
        />
      </div>
    </div>
  );
};

export default ExamMarksView;

