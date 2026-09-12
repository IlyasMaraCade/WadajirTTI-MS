import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { FileCheck, Printer, Plus, Search } from 'lucide-react';

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', type: 'Midterm', subject: '', maxMarks: 100, date: new Date().toISOString().split('T')[0] });

  const { data, isLoading } = useQuery({
    queryKey: ['principal-all-exams'],
    queryFn: async () => {
      const res = await apiClient.get('/principal/exams');
      return res.data?.data || [];
    },
  });

  const { data: subjectsData } = useQuery({ queryKey: ['subjects'], queryFn: async () => { const res = await apiClient.get('/academics/subjects'); return res.data?.data || []; } });

  const addExamMutation = useMutation({ mutationFn: async (data: any) => apiClient.post('/principal/exams', data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['principal-all-exams'] }); setIsAddModalOpen(false); } });

  const exams: ExamRecord[] = data || [];
  
  const filteredExams = exams.filter(e => (typeFilter === 'ALL' || e.type === typeFilter) && (e.name.toLowerCase().includes(search.toLowerCase()) || e.subject?.name?.toLowerCase().includes(search.toLowerCase())));

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
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"><Plus className="w-4 h-4" /> Add Exam</button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm no-print"
          >
            <Printer className="w-4 h-4" />
            Print Exam Schedule
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"><option value="ALL">All Types</option><option value="Midterm">Midterm</option><option value="Final">Final</option><option value="Quiz">Quiz</option><option value="Assignment">Assignment</option></select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={filteredExams}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No exams scheduled yet."
        />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule Exam">
        <form onSubmit={(e) => { e.preventDefault(); addExamMutation.mutate(examForm); }} className="space-y-4">
          <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label><input required value={examForm.name} onChange={e => setExamForm(f => ({...f, name: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Type</label><select value={examForm.type} onChange={e => setExamForm(f => ({...f, type: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"><option value="Midterm">Midterm</option><option value="Final">Final</option><option value="Quiz">Quiz</option><option value="Assignment">Assignment</option></select></div>
          <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Subject</label><select required value={examForm.subject} onChange={e => setExamForm(f => ({...f, subject: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"><option value="">Select Subject</option>{subjectsData?.map((sub: any) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Max Marks</label><input type="number" required value={examForm.maxMarks} onChange={e => setExamForm(f => ({...f, maxMarks: Number(e.target.value)}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" /></div>
            <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label><input type="date" required value={examForm.date} onChange={e => setExamForm(f => ({...f, date: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={addExamMutation.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{addExamMutation.isPending ? 'Saving...' : 'Schedule Exam'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default PrincipalExams;