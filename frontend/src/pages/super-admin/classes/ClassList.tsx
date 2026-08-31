import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getClasses, createClass, updateClass } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface Class {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

const defaultForm = { name: '', code: '', description: '', isActive: true };

const ClassList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const { data: classes = [], isLoading } = useQuery({ queryKey: ['classes'], queryFn: getClasses });

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create class'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateClass(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update class'),
  });

  const openCreate = () => { setEditingClass(null); setForm(defaultForm); setError(''); setIsModalOpen(true); };
  const openEdit = (c: Class) => {
    setEditingClass(c);
    setForm({ name: c.name, code: c.code, description: c.description || '', isActive: c.isActive });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingClass(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) updateMutation.mutate({ id: editingClass._id, data: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Class, any>[] = [
    { accessorKey: 'name', header: 'Class Name' },
    { accessorKey: 'code', header: 'Class Code' },
    { accessorKey: 'description', header: 'Description' },
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
        <h1 className="text-2xl font-bold text-text-primary">Classes</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Class
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={classes} columns={columns} isLoading={isLoading} emptyMessage="No classes found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingClass ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Class Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Class Name" className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Class Code *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="Class Code" className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded text-primary" />
            <label htmlFor="isActive" className="text-sm text-text-primary">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassList;

