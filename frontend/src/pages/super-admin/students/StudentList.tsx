import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

const AVAILABLE_COURSES = [
  'Cilaan',
  'Makeup',
  'Ubax Sameyn',
  'English',
  'Somali',
  'Xisaab',
  'Harqaan',
  'Crochet',
  'Computer',
];

interface Student {
  _id: string;
  studentId: string;
  fullName: string;
  gender: string;
  phone?: string;
  parentName: string;
  parentPhone: string;
  fee: number;
  registrationFee: number;
  courses: string[];
  status: boolean;
  enrollmentStatus: string;
}

const emptyForm = {
  fullName: '',
  gender: 'Female',
  phone: '',
  parentName: '',
  parentPhone: '',
  fee: '' as unknown as number,
  registrationFee: '' as unknown as number,
  courses: ['Computer'] as string[],
};

export const StudentList: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/students', {
        params: { page: page + 1, limit: 20, search: search || undefined },
      });
      return res.data;
    },
  });

  const students = data?.data || [];
  const meta = data?.meta;
  const pageCount = meta ? meta.totalPages : 1;
  const total = meta ? meta.total : students.length;

  const createMutation = useMutation({
    mutationFn: async (formData: typeof emptyForm) => {
      const res = await apiClient.post('/students', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to register student');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: any }) => {
      const res = await apiClient.put(`/students/${id}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to update student');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/students/${id}/toggle-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/students/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const openCreate = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({
      fullName: s.fullName,
      gender: s.gender || 'Female',
      phone: s.phone || '',
      parentName: s.parentName || '',
      parentPhone: s.parentPhone || '',
      fee: s.fee || 0,
      registrationFee: s.registrationFee || 0,
      courses: s.courses && s.courses.length > 0 ? s.courses : ['Computer'],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setError(null);
  };

  const handleCourseToggle = (course: string) => {
    setForm((prev) => {
      const exists = prev.courses.includes(course);
      if (exists) {
        if (prev.courses.length === 1) return prev; // Keep at least one
        return { ...prev, courses: prev.courses.filter((c) => c !== course) };
      } else {
        return { ...prev, courses: [...prev.courses, course] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim()) {
      setError('Student full name is required');
      return;
    }
    if (!form.parentName.trim()) {
      setError('Parent name is required');
      return;
    }
    if (!form.parentPhone.trim()) {
      setError('Parent phone number is required');
      return;
    }

    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent._id, formData: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const columns: ColumnDef<Student, any>[] = [
    { accessorKey: 'studentId', header: 'ID' },
    { accessorKey: 'fullName', header: 'Student Name' },
    {
      accessorKey: 'courses',
      header: 'Enrolled Courses',
      cell: ({ getValue }) => {
        const cList: string[] = getValue() || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {cList.map((c) => (
              <span
                key={c}
                className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded font-medium border border-teal-100"
              >
                {c}
              </span>
            ))}
          </div>
        );
      },
    },
    { accessorKey: 'phone', header: 'Student Phone', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'parentName', header: 'Parent Name' },
    { accessorKey: 'parentPhone', header: 'Parent Phone' },
    {
      accessorKey: 'fee',
      header: 'Monthly Fee',
      cell: ({ getValue }) => <span className="font-semibold text-emerald-700">${getValue() || 0}</span>,
    },
    {
      accessorKey: 'registrationFee',
      header: 'Reg Fee',
      cell: ({ getValue }) => <span>${getValue() || 0}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'danger'}>
          {getValue<boolean>() ? 'Active' : 'Inactive'}
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
            title="Edit Student"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Toggle status for ${row.original.fullName}?`)) {
                toggleMutation.mutate(row.original._id);
              }
            }}
            className={`p-1.5 rounded ${
              row.original.status
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.original.status ? 'Deactivate' : 'Activate'}
          >
            {row.original.status ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (confirm(`Permanently delete student ${row.original.fullName}?`)) {
                deleteMutation.mutate(row.original._id);
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete Student"
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
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500 text-sm mt-1">{total} registered students</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Register New Student
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={students}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No students registered yet."
          pageIndex={page}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>

      {/* Student Registration / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? `Edit Student: ${editingStudent.fullName}` : 'Register New Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Gender *
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Student Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone Number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Parent / Guardian Name *
              </label>
              <input
                required
                value={form.parentName}
                onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
                placeholder="Parent Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Parent Phone Number *
            </label>
            <input
              required
              value={form.parentPhone}
              onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))}
              placeholder="Parent Phone"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Fee & Registration Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Monthly Fee ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={form.fee}
                  onChange={(e) => setForm((f) => ({ ...f, fee: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Registration Fee ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={form.registrationFee}
                  onChange={(e) => setForm((f) => ({ ...f, registrationFee: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary bg-white"
                />
              </div>
            </div>
          </div>

          {/* Course Selection Dropdown / Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Select Enrolled Courses * (Click to toggle)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_COURSES.map((course) => {
                const isSelected = form.courses.includes(course);
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => handleCourseToggle(course)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected ? `✓ ${course}` : `+ ${course}`}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Available courses: Cilaan, Makeup, Ubax Sameyn, English, Somali, Xisaab, Harqaan, Crochet, Computer
            </p>
          </div>

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
              className="px-5 py-2 text-sm bg-primary text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 shadow-sm"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingStudent
                ? 'Update Student'
                : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentList;
