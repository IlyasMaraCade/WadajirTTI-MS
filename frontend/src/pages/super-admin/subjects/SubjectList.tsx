import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getSubjects, createSubject, updateSubject, getTeachers } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface Subject {
  _id: string;
  name: string;
  times?: string;
  teacher?: { _id: string; fullName: string };
  isActive: boolean;
}

const defaultForm = { name: '', times: '', teacherId: '', isActive: true };

const SubjectList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const { data: subjects = [], isLoading } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const { data: teacherData } = useQuery({ queryKey: ['teachers', '', 0], queryFn: () => getTeachers({ limit: '100' }) });
  const teachers = teacherData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => createSubject(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create subject'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSubject(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update subject'),
  });

  const openCreate = () => { setEditingSubject(null); setForm(defaultForm); setError(''); setIsModalOpen(true); };
  const openEdit = (s: Subject) => {
    setEditingSubject(s);
    setForm({ name: s.name, times: s.times || '', teacherId: (s.teacher as any)?._id || '', isActive: s.isActive });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingSubject(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, times: form.times, teacher: form.teacherId || undefined, isActive: form.isActive };
    if (editingSubject) updateMutation.mutate({ id: editingSubject._id, data: payload });
    else createMutation.mutate(payload);
  };

  const columns: ColumnDef<Subject, any>[] = [
    { accessorKey: 'name', header: 'Subject Name' },
    { accessorKey: 'times', header: 'Time(s)', cell: ({ getValue }) => getValue<string>() || '-' },
    {
      accessorKey: 'teacher', header: 'Teacher',
      cell: ({ getValue }) => { const t = getValue<any>(); return t?.fullName || '-'; }
    },
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
        <h1 className="text-2xl font-bold text-text-primary">Subjects</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Subject
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={subjects} columns={columns} isLoading={isLoading} emptyMessage="No subjects found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSubject ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Subject Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Subject Name" className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Time(s) Taught</label>
            <input value={form.times} onChange={e => setForm(f => ({ ...f, times: e.target.value }))}
              placeholder="Time(s) Taught" className="w-full border border-border rounded px-3 py-2 text-sm" />
            <p className="text-xs text-gray-400 mt-1">e.g. Mon/Wed 08:00–10:00 AM</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Teacher</label>
            <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-white">
              <option value="">-- No Teacher Assigned --</option>
              {teachers.map((t: any) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded text-primary" />
            <label htmlFor="isActive" className="text-sm text-text-primary">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectList;



