import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getAcademicYears, createAcademicYear, updateAcademicYear } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface AcademicYear {
  _id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const defaultForm = { year: '', startDate: '', endDate: '', isActive: false };

const AcademicYearList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const { data: years = [], isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: getAcademicYears,
  });

  const createMutation = useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['academic-years'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create academic year'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateAcademicYear(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['academic-years'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update academic year'),
  });

  const openCreate = () => { setEditingYear(null); setForm(defaultForm); setError(''); setIsModalOpen(true); };
  const openEdit = (y: AcademicYear) => {
    setEditingYear(y);
    setForm({ year: y.year, startDate: y.startDate.split('T')[0], endDate: y.endDate.split('T')[0], isActive: y.isActive });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingYear(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingYear) updateMutation.mutate({ id: editingYear._id, data: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<AcademicYear, any>[] = [
    { accessorKey: 'year', header: 'Academic Year' },
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
        <h1 className="text-2xl font-bold text-text-primary">Academic Years</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Academic Year
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={years} columns={columns} isLoading={isLoading} emptyMessage="No academic years found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Year (e.g. 2026/2027) *</label>
            <input required value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm" />
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
            <label htmlFor="isActive" className="text-sm text-text-primary">Set as Active Year</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingYear ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicYearList;

