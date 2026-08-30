import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getTerms, createTerm, updateTerm, getAcademicYears } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface Term {
  _id: string;
  name: string;
  academicYear: { _id: string; year: string };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const defaultForm = { name: '', academicYear: '', startDate: '', endDate: '', isActive: false };

const TermList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const { data: terms = [], isLoading } = useQuery({ queryKey: ['terms'], queryFn: getTerms });
  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: getAcademicYears });

  const createMutation = useMutation({
    mutationFn: createTerm,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['terms'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create term'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateTerm(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['terms'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update term'),
  });

  const openCreate = () => { setEditingTerm(null); setForm({ ...defaultForm, academicYear: years.find((y: any) => y.isActive)?._id || '' }); setError(''); setIsModalOpen(true); };
  const openEdit = (t: Term) => {
    setEditingTerm(t);
    setForm({ name: t.name, academicYear: t.academicYear?._id || '', startDate: t.startDate.split('T')[0], endDate: t.endDate.split('T')[0], isActive: t.isActive });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingTerm(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTerm) updateMutation.mutate({ id: editingTerm._id, data: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Term, any>[] = [
    { accessorKey: 'name', header: 'Term Name' },
    { accessorKey: 'academicYear.year', header: 'Academic Year' },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString() },
    { accessorKey: 'endDate', header: 'End Date', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString() },
    {
      accessorKey: 'isActive', header: 'Status',
      cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? 'success' : 'default'}>{getValue<boolean>() ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <button onClick={() => openEdit(row.original)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-600">Edit</button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Terms & Semesters</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Term
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={terms} columns={columns} isLoading={isLoading} emptyMessage="No terms found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTerm ? 'Edit Term' : 'Add Term'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Term Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Term 1, Fall Semester" className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Academic Year *</label>
            <select required value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm">
              <option value="">Select Year...</option>
              {years.map((y: any) => <option key={y._id} value={y._id}>{y.year}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Start Date *</label>
              <input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">End Date *</label>
              <input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded text-primary" />
            <label htmlFor="isActive" className="text-sm text-text-primary">Set as Active Term</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTerm ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TermList;

