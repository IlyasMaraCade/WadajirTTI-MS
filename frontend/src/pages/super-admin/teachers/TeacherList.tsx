import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/services/adminService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface Teacher {
  _id: string;
  teacherId: string;
  fullName: string;
  phone: string;
  subjects: string[];
  time?: string[];
  credentials?: string;
  employmentStatus: string;
}

const defaultForm = {
  fullName: '', phone: '',
  subjects: [] as string[],
  time: [] as string[],
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

  // Refs for focusing on error
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const subjectsRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const focusOnError = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('name')) setTimeout(() => fullNameRef.current?.focus(), 100);
    else if (lower.includes('phone')) setTimeout(() => phoneRef.current?.focus(), 100);
    else if (lower.includes('subject')) setTimeout(() => subjectsRef.current?.focus(), 100);
    else if (lower.includes('username')) setTimeout(() => usernameRef.current?.focus(), 100);
  };

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
    onError: (e: any) => {
      const msg = e.response?.data?.message || 'Failed to create teacher';
      setError(msg);
      focusOnError(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => updateTeacher(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teachers'] }); closeModal(); },
    onError: (e: any) => {
      const msg = e.response?.data?.message || 'Failed to update teacher';
      setError(msg);
      focusOnError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers-all'] });
    },
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete teacher'),
  });

  const openCreate = () => { setEditingTeacher(null); setForm(defaultForm); setError(''); setIsModalOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setForm({ fullName: t.fullName, phone: t.phone, subjects: t.subjects || [], time: t.time || [], username: '', password: '' });
    setError(''); setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingTeacher(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Full Name is required'); fullNameRef.current?.focus(); return; }
    if (!form.phone.trim()) { setError('Phone is required'); phoneRef.current?.focus(); return; }
    if (form.subjects.length === 0) { setError('Please assign at least one subject'); subjectsRef.current?.focus(); return; }
    if (editingTeacher) updateMutation.mutate({ id: editingTeacher._id, data: form });
    else createMutation.mutate(form);
  };

  const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
    'Active': 'success', 'On Leave': 'warning', 'Terminated': 'danger',
  };

  const columns: ColumnDef<Teacher, any>[] = [
    { accessorKey: 'teacherId', header: 'Teacher ID' },
    { accessorKey: 'fullName', header: 'Full Name' },
    { accessorKey: 'phone', header: 'Phone' },
    { 
      accessorKey: 'subjects', 
      header: 'Subjects',
      cell: ({ getValue }) => {
        const subjects = getValue<string[]>();
        return subjects?.join(', ') || '-';
      }
    },
    {
      accessorKey: 'employmentStatus', header: 'Status',
      cell: ({ getValue }) => <Badge variant={statusVariant[getValue<string>()] || 'default'}>{getValue<string>()}</Badge>,
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <button onClick={() => openEdit(row.original)} className="btn-hover px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100">Edit</button>
          <button
            onClick={() => {
              if (confirm(`Delete teacher "${row.original.fullName}"? This cannot be undone.`)) {
                deleteMutation.mutate(row.original._id);
              }
            }}
            className="btn-hover p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
        <button onClick={openCreate} className="btn-hover px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary-600">
          + New Teacher
        </button>
      </div>

      <div className="flex gap-3">
        <input placeholder="Search teachers..."
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name *</label>
            <input ref={fullNameRef} required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Full Name" className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone Number *</label>
            <input ref={phoneRef} required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone Number" className="w-full border border-border rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Subject They Teach *</label>
            <input
              ref={subjectsRef}
              required
              defaultValue={form.subjects.join(', ')}
              onChange={e => setForm(f => ({ ...f, subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="e.g. Mathematics"
              className="w-full border border-border rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">For multiple subjects, separate with commas (e.g. Math, Science)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Teaching Time / Schedule</label>
            <input
              defaultValue={(form.time || []).join(', ')}
              onChange={e => {
                const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                const uniqueTimes = Array.from(new Set(val));
                setForm(f => ({ ...f, time: uniqueTimes }));
              }}
              placeholder="e.g. 8:00 AM - 9:00 AM, 10:00 AM - 11:00 AM"
              className="w-full border border-border rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple times with commas</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3">Portal Credentials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Username</label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Username" className="w-full border border-border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Password" className="w-full border border-border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Fill username & password to create a Teacher Portal login.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-hover px-4 py-2 text-sm font-bold border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-hover px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-sm hover:bg-primary-600 disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTeacher ? 'Update' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherList;

