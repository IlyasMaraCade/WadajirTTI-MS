import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getSections, createSection, updateSection, getClasses } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface Section {
  _id: string;
  name: string;
  classId?: { _id: string; name: string };
  capacity?: number;
  isActive: boolean;
}

const defaultForm = { name: '', classId: '', capacity: 30, isActive: true };

const SectionList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const { data: sections = [], isLoading } = useQuery({ queryKey: ['sections'], queryFn: getSections });
  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: getClasses });

  const createMutation = useMutation({
    mutationFn: createSection,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create section'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateSection(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update section'),
  });

  const openCreate = () => { setEditingSection(null); setForm({ ...defaultForm, classId: classes[0]?._id || '' }); setError(''); setIsModalOpen(true); };
  const openEdit = (s: Section) => {
    setEditingSection(s);
    setForm({ name: s.name, classId: s.classId?._id || '', capacity: s.capacity || 30, isActive: s.isActive });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingSection(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) updateMutation.mutate({ id: editingSection._id, data: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Section, any>[] = [
    { accessorKey: 'name', header: 'Section Name' },
    { accessorKey: 'classId.name', header: 'Class' },
    { accessorKey: 'capacity', header: 'Capacity' },
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
        <h1 className="text-2xl font-bold text-text-primary">Sections</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Section
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={sections} columns={columns} isLoading={isLoading} emptyMessage="No sections found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSection ? 'Edit Section' : 'Add Section'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Section Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Section A" className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Class *</label>
              <select required value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm">
                <option value="">Select Class...</option>
                {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Capacity</label>
            <input type="number" required value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
              className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded text-primary" />
            <label htmlFor="isActive" className="text-sm text-text-primary">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSection ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SectionList;

