import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { FileCheck, Printer } from 'lucide-react';

interface ExamRecord {
  _id: string;
  name: string;
  type: string;
  date: string;
  maxMarks: number;
  class?: { name: string };
  section?: { name: string };
  subject?: { name: string; code: string };
  createdBy?: { firstName: string; lastName: string };
}

export const PrincipalExams: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['principal-all-exams'],
    queryFn: async () => {
      const res = await apiClient.get('/principal/exams');
      return res.data?.data || [];
    },
  });

  const exams: ExamRecord[] = data || [];

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<ExamRecord, any>[] = [
    { accessorKey: 'name', header: 'Exam Title' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <span className="text-xs font-semibold text-gray-700">{getValue()}</span>,
    },
    {
      accessorKey: 'subject.name',
      header: 'Subject / Course',
      cell: ({ row }) => row.original.subject?.name || '—',
    },
    {
      accessorKey: 'class.name',
      header: 'Class / Section',
      cell: ({ row }) => `${row.original.class?.name || '—'} (${row.original.section?.name || '—'})`,
    },
    {
      accessorKey: 'maxMarks',
      header: 'Max Marks',
      cell: ({ getValue }) => <span className="font-bold text-gray-900">{getValue()} pts</span>,
    },
    {
      accessorKey: 'date',
      header: 'Exam Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'createdBy',
      header: 'Teacher',
      cell: ({ row }) =>
        row.original.createdBy
          ? `${row.original.createdBy.firstName} ${row.original.createdBy.lastName}`
          : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutional Examinations</h1>
          <p className="text-gray-500 text-sm mt-1">
            Supervise scheduled assessments, test papers, and grading criteria across all classes
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm no-print"
        >
          <Printer className="w-4 h-4" />
          Print Exam Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={exams}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No exams scheduled yet."
        />
      </div>
    </div>
  );
};

export default PrincipalExams;

