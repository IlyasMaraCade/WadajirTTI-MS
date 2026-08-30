import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getUsers, createUser, updateUser, deactivateUser } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

const ROLES = ['SUPER_ADMIN', 'FINANCE', 'TEACHER', 'PRINCIPAL'];

const UserList = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'TEACHER' });
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => createUser(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) => updateUser(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', role: 'TEACHER' });
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingUser(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const { password, ...rest } = form;
      updateMutation.mutate({ id: editingUser._id, data: password ? form : rest });
    } else {
      createMutation.mutate(form);
    }
  };

  const columns: ColumnDef<User, any>[] = [
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => <Badge variant="info">{getValue<string>().replace('_', ' ')}</Badge>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? 'success' : 'danger'}>{getValue<boolean>() ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row.original)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-600">Edit</button>
          {row.original.isActive && (
            <button
              onClick={() => { if (confirm('Deactivate this user?')) deactivateMutation.mutate(row.original._id); }}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >Deactivate</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm mt-1">Manage system user accounts</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          + New User
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={users} columns={columns} isLoading={isLoading} emptyMessage="No users found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit User' : 'Create User'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password {editingUser ? '(leave blank to keep)' : '*'}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required={!editingUser} minLength={8}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Role *</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent">
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;

