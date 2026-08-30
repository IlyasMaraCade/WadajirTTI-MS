import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Filter, Printer } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  student: { _id: string; studentId: string; fullName: string };
  class: { _id: string; name: string };
  section: { _id: string; name: string };
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  date: string;
  recordedBy: { firstName: string; lastName: string };
}

export const AttendanceView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance', selectedDate],
    queryFn: async () => {
      const res = await apiClient.get('/admin/attendance', {
        params: { date: selectedDate || undefined },
      });
      return res.data;
    },
  });

  const records: AttendanceRecord[] = data?.data || [];

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<AttendanceRecord, any>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
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
      accessorKey: 'class.name',
      header: 'Class',
      cell: ({ row }) => `${row.original.class?.name || '—'} (${row.original.section?.name || '—'})`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const variants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
          Present: 'success',
          Absent: 'danger',
          Late: 'warning',
          Excused: 'info',
        };
        return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'recordedBy',
      header: 'Recorded By',
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">View school-wide student attendance records</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent focus:outline-none"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Log
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={records}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={`No attendance recorded for ${new Date(selectedDate).toLocaleDateString()}.`}
        />
      </div>
    </div>
  );
};

export default AttendanceView;

