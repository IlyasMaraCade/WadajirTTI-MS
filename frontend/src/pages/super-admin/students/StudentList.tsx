import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getStudents, createStudent, updateStudent, toggleStudentStatus } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useNavigate } from 'react-router-dom';

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  enrollmentStatus: string;
  status: boolean;
}

const defaultForm = {
  studentId: '', firstName: '', middleName: '', lastName: '',
  dob: '', gender: 'Male', guardianName: '', guardianRelationship: '',
  guardianPhone: '', guardianEmail: '',
};

const statusBadge = (status: string) => {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
    Active: 'success', Completed: 'info', Transferred: 'warning', Withdrawn: 'danger', Suspended: 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

const StudentList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => getStudents({ search, page: String(page + 1), limit: '20' }),
  });

  const students: Student[] = data?.data || [];
  const total: number = data?.meta?.total || 0;
  const pageCount = Math.ceil(total / 20);

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create student'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateStudent(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); closeModal(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to update student'),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleStudentStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  const openCreate = () => {
    setEditingStudent(null); setForm(defaultForm); setError(''); setIsModalOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ studentId: s.studentId, firstName: s.firstName, middleName: s.middleName || '', lastName: s.lastName, dob: '', gender: s.gender, guardianName: '', guardianRelationship: '', guardianPhone: '', guardianEmail: '' });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingStudent(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) updateMutation.mutate({ id: editingStudent._id, data: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Student, any>[] = [
    { accessorKey: 'studentId', header: 'Student ID' },
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'enrollmentStatus', header: 'Enrollment', cell: ({ getValue }) => statusBadge(getValue<string>()) },
    {
      accessorKey: 'status',
      header: 'Account',
      cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? 'success' : 'danger'}>{getValue<boolean>() ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/students/${row.original._id}`)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">View</button>
          <button onClick={() => openEdit(row.original)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-600">Edit</button>
          <button
            onClick={() => { if (confirm('Toggle student status?')) toggleMutation.mutate(row.original._id); }}
            className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
          >{row.original.status ? 'Deactivate' : 'Activate'}</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-text-secondary text-sm mt-1">{total} total students</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + New Student
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="flex-1 max-w-sm border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable
          data={students}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No students found."
          pageIndex={page}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStudent ? 'Edit Student' : 'Add New Student'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Student ID *</label>
              <input required value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                disabled={!!editingStudent}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Gender *</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option>Male</option><option>Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Middle Name</label>
              <input value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date of Birth *</label>
            <input required={!editingStudent} type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <hr className="border-border" />
          <p className="text-sm font-semibold text-text-secondary">Guardian Information</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Guardian Name *</label>
              <input required={!editingStudent} value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Relationship *</label>
              <input required={!editingStudent} value={form.guardianRelationship} onChange={e => setForm(f => ({ ...f, guardianRelationship: e.target.value }))}
                placeholder="e.g. Father, Mother"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Guardian Phone *</label>
              <input required={!editingStudent} value={form.guardianPhone} onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Guardian Email</label>
              <input type="email" value={form.guardianEmail} onChange={e => setForm(f => ({ ...f, guardianEmail: e.target.value }))}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingStudent ? 'Update' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentList;

