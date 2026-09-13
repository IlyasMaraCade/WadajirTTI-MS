import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar, Printer, Users } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  student: { _id: string; studentId: string; fullName: string; phone?: string; parentName?: string; parentPhone?: string; };
  class?: { _id: string; name: string };
  section?: { _id: string; name: string };
  subject?: { _id: string; name: string };
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  date: string;
  recordedBy: { firstName: string; lastName: string };
}

export const AttendanceView: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('');

  const dateParam = filterMode === 'daily' ? selectedDate : undefined;
  const startDateParam = filterMode === 'monthly' ? `${selectedMonth}-01` : undefined;
  const endDateParam = filterMode === 'monthly'
    ? new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).toISOString().split('T')[0]
    : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance', filterMode, selectedDate, selectedMonth],
    queryFn: async () => {
      const res = await apiClient.get('/admin/attendance', {
        params: { date: dateParam || undefined, startDate: startDateParam || undefined, endDate: endDateParam || undefined },
      });
      return res.data;
    },
  });

  const allRecords: AttendanceRecord[] = data?.data || [];

  const records = useMemo(() => {
    if (!statusFilter) return allRecords;
    return allRecords.filter(r => r.status === statusFilter);
  }, [allRecords, statusFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    late: records.filter(r => r.status === 'Late').length,
  }), [records]);

  const periodLabel = filterMode === 'daily'
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const columns: ColumnDef<AttendanceRecord, any>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString() },
    { accessorKey: 'student.fullName', header: 'Student Name', cell: ({ row }) => <span className="font-semibold text-gray-900">{row.original.student?.fullName || '—'}</span> },
    { accessorKey: 'student.phone', header: 'Number', cell: ({ row }) => row.original.student?.phone || '—' },
    { accessorKey: 'student.parentName', header: 'Parent Name', cell: ({ row }) => row.original.student?.parentName || '—' },
    { accessorKey: 'student.parentPhone', header: 'Parent Number', cell: ({ row }) => row.original.student?.parentPhone || '—' },
    { accessorKey: 'subject.name', header: 'Subject', cell: ({ row }) => row.original.subject?.name || '—' },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const variants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = { Present: 'success', Absent: 'danger', Late: 'warning', Excused: 'info' };
        return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
      },
    },
    { accessorKey: 'recordedBy', header: 'Recorded By', cell: ({ row }) => row.original.recordedBy ? `${row.original.recordedBy.firstName} ${row.original.recordedBy.lastName}` : '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Print header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold">Wadajir Technical and Training Institute</h1>
        <p className="text-sm text-slate-600">Attendance Report — {periodLabel}</p>
        <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleString()}</p>
        <div className="flex justify-center gap-6 mt-2 text-sm">
          <span>Total: <strong>{stats.total}</strong></span>
          <span>Present: <strong>{stats.present}</strong></span>
          <span>Absent: <strong>{stats.absent}</strong></span>
          <span>Late: <strong>{stats.late}</strong></span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">View and print daily or monthly attendance records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm font-semibold">
            <button onClick={() => setFilterMode('daily')} className={`btn-hover px-3 py-1.5 rounded-md transition-all ${filterMode === 'daily' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Daily</button>
            <button onClick={() => setFilterMode('monthly')} className={`btn-hover px-3 py-1.5 rounded-md transition-all ${filterMode === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Monthly</button>
          </div>

          {filterMode === 'daily' ? (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm text-gray-700 bg-transparent focus:outline-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="text-sm text-gray-700 bg-transparent focus:outline-none" />
            </div>
          )}

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="btn-hover bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Excused">Excused</option>
          </select>

          <button onClick={() => window.print()} className="btn-hover flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm cursor-pointer">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        {[
          { label: 'Total Records', value: stats.total, cls: 'bg-slate-50 text-slate-700 border-slate-200' },
          { label: 'Present', value: stats.present, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Absent', value: stats.absent, cls: 'bg-rose-50 text-rose-700 border-rose-200' },
          { label: 'Late', value: stats.late, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`card-hover rounded-xl p-4 border ${s.cls} cursor-default`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{periodLabel}</span>
          <span className="ml-auto text-xs text-slate-400">{records.length} records</span>
        </div>
        <DataTable data={records} columns={columns} isLoading={isLoading} emptyMessage={`No attendance recorded for ${periodLabel}.`} />
      </div>
    </div>
  );
};

export default AttendanceView;

