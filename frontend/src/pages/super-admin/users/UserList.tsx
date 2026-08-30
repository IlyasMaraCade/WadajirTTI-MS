import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, KeyRound, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'FINANCE' | 'TEACHER' | 'PRINCIPAL';
  isActive: boolean;
  createdAt: string;
}

const emptyUserForm = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'TEACHER' as 'SUPER_ADMIN' | 'FINANCE' | 'TEACHER' | 'PRINCIPAL',
};

export const UserList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState(emptyUserForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data;
    },
  });

  const users: User[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (userData: typeof emptyUserForm) => {
      const res = await apiClient.post('/users', userData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      const res = await apiClient.put(`/users/${id}`, userData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to update user');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await apiClient.patch(`/users/${id}/change-password`, { newPassword });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closePasswordModal();
      alert('Password updated successfully');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to change password');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/users/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyUserForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      password: '',
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email || '',
      role: u.role,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openChangePassword = (u: User) => {
    setSelectedUserForPassword(u);
    setNewPassword('');
    setError(null);
    setIsPasswordModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUserForPassword(null);
    setNewPassword('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setError('Password is required for new users');
      return;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser._id, userData: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    passwordMutation.mutate({ id: selectedUserForPassword._id, newPassword });
  };

  const columns: ColumnDef<User, any>[] = [
    { accessorKey: 'username', header: 'Username' },
    {
      accessorKey: 'name',
      header: 'Full Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue() || '—' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue<string>();
        const colors: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
          SUPER_ADMIN: 'danger',
          FINANCE: 'warning',
          TEACHER: 'info',
          PRINCIPAL: 'success',
        };
        return <Badge variant={colors[role] || 'info'}>{role.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'danger'}>
          {getValue<boolean>() ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openChangePassword(row.original)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
            title="Change User Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Toggle status for ${row.original.username}?`)) {
                toggleStatusMutation.mutate(row.original._id);
              }
            }}
            className={`p-1.5 rounded ${
              row.original.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.original.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {row.original.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to permanently delete user "${row.original.username}"?`)) {
                deleteMutation.mutate(row.original._id);
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system users, credentials, and role permissions</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No users found."
        />
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Username *</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="e.g. jdoe"
                disabled={!!editingUser}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="TEACHER">Teacher</option>
                <option value="FINANCE">Finance</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">First Name *</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Last Name *</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="optional@wadajir.edu.so"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 text-sm bg-primary text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingUser
                ? 'Update User'
                : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        title={`Change Password for: ${selectedUserForPassword?.username}`}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closePasswordModal}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="px-5 py-2 text-sm bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {passwordMutation.isPending ? 'Updating...' : 'Set New Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;
