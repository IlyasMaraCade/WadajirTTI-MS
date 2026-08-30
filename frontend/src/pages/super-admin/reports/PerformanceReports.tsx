import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Printer, Download, Search, Award, TrendingUp } from 'lucide-react';

interface StudentPerformance {
  student: {
    _id: string;
    studentId: string;
    fullName: string;
    courses?: string[];
  };
  examsTaken: number;
  totalScore: number;
  totalMax: number;
  avgPercentage: number;
  grade: string;
}

export const PerformanceReports: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['performance-report'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/performance-report');
      return res.data;
    },
  });

  const list: StudentPerformance[] = data?.data || [];

  const filteredList = list.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.student?.fullName?.toLowerCase().includes(q) ||
      item.student?.studentId?.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['WADAJIR TECHNICAL AND TRAINING INSTITUTE - STUDENT ACADEMIC PERFORMANCE REPORT'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [''],
      ['Student ID', 'Full Name', 'Courses', 'Exams Taken', 'Total Score', 'Max Possible', 'Average (%)', 'Overall Grade'],
      ...filteredList.map((item) => [
        item.student?.studentId || '—',
        item.student?.fullName || '—',
        (item.student?.courses || []).join('; '),
        item.examsTaken,
        item.totalScore,
        item.totalMax,
        `${item.avgPercentage}%`,
        item.grade,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wadajir_Student_Performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<StudentPerformance, any>[] = [
    {
      accessorKey: 'student.studentId',
      header: 'Student ID',
      cell: ({ row }) => row.original.student?.studentId || '—',
    },
    {
      accessorKey: 'student.fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">{row.original.student?.fullName || '—'}</span>
      ),
    },
    {
      accessorKey: 'student.courses',
      header: 'Courses',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.student?.courses || []).map((c) => (
            <span key={c} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'examsTaken',
      header: 'Exams Taken',
      cell: ({ getValue }) => <span className="font-medium text-gray-700">{getValue<number>()}</span>,
    },
    {
      accessorKey: 'avgPercentage',
      header: 'Average Score',
      cell: ({ getValue }) => (
        <span className="font-bold text-gray-900">{getValue<number>()}%</span>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Overall Grade',
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Performance Report</h1>
          <p className="text-slate-500 text-sm mt-1">Institutional academic ranking and grade evaluation</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              placeholder="Filter by student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#111827] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      <div className="modern-card rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={filteredList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No student examination evaluations available."
        />
      </div>
    </div>
  );
};

export default PerformanceReports;

