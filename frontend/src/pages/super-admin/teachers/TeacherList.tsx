import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getTeachers, createTeacher, updateTeacher } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useNavigate } from 'react-router-dom';

interface Teacher {
  _id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  employmentStatus: string;
}

const defaultForm = {
  teacherId: '', firstName: '', lastName: '', email: '', phone: '',
  gender: 'Male', qualification: '', specialization: '', dateJoined: '',
  username: '', password: ''
};

const TeacherList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', search, page],
    queryFn: () => getTeachers({ search, page: String(page + 1), limit: '20' }),
  });

  const teachers: Teacher[] = data?.data || [];
  const total: number = data?.meta?.total || 0;
  const pageCount = Math.ceil(total / 20);

  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teachers'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create teacher'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateTeacher(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teachers'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update teacher'),
  });

  const openCreate = () => { setEditingTeacher(null); setForm(defaultForm); setError(''); setIsModalOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setForm({ teacherId: t.teacherId, firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone, gender: 'Male', qualification: '', specialization: t.specialization, dateJoined: '', username: '', password: '' });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingTeacher(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) updateMutation.mutate({ id: editingTeacher._id, data: form });
    else createMutation.mutate(form);
  };

  const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
    'Active': 'success', 'On Leave': 'warning', 'Terminated': 'danger',
  };

  const columns: ColumnDef<Teacher, any>[] = [
    { accessorKey: 'teacherId', header: 'Teacher ID' },
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'specialization', header: 'Specialization' },
    {
      accessorKey: 'employmentStatus', header: 'Status',
      cell: ({ getValue }) => <Badge variant={statusVariant[getValue<string>()] || 'default'}>{getValue<string>()}</Badge>,
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/teachers/${row.original._id}`)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">View</button>
          <button onClick={() => openEdit(row.original)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-600">Edit</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Teachers</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total teachers</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Teacher
        </button>
      </div>

      <div className="flex gap-3">
        <input placeholder="Search by name, ID or specialization..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 max-w-sm border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent" />
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={teachers} columns={columns} isLoading={isLoading} emptyMessage="No teachers found."
          pageIndex={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Teacher ID *</label>
              <input required value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                disabled={!!editingTeacher}
                className="w-full border border-border rounded px-3 py-2 text-sm disabled:bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm">
                <option>Male</option><option>Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
              <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Qualification *</label>
              <input required value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                placeholder="e.g. B.Ed, M.Sc" className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Specialization *</label>
              <input required value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                placeholder="e.g. Mathematics" className="w-full border border-border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date Joined *</label>
            <input required={!editingTeacher} type="date" value={form.dateJoined} onChange={e => setForm(f => ({ ...f, dateJoined: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>
          
          {!editingTeacher && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h3 className="text-sm font-semibold mb-3">Portal Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Username (Optional)</label>
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="e.g. t.smith" className="w-full border border-border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Password (Optional)</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 chars" className="w-full border border-border rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Fill these fields to create a Teacher Portal login for this instructor.</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTeacher ? 'Update' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherList;

