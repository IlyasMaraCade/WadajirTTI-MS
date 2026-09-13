import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Trash2, Edit, CheckCircle, XCircle, Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx';



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
  time?: string;
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
  courses: [] as string[],
    time: "",
};

export const StudentList: React.FC<{ isAlumniView?: boolean }> = ({ isAlumniView = false }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const parentNameRef = useRef<HTMLInputElement>(null);
  const parentPhoneRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const focusOnError = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('parent name')) setTimeout(() => parentNameRef.current?.focus(), 100);
    else if (lower.includes('parent phone')) setTimeout(() => parentPhoneRef.current?.focus(), 100);
    else if (lower.includes('phone')) setTimeout(() => phoneRef.current?.focus(), 100);
    else if (lower.includes('name')) setTimeout(() => fullNameRef.current?.focus(), 100);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, statusFilter, courseFilter, timeFilter, sortField, sortOrder, isAlumniView],
    queryFn: async () => {
      const res = await apiClient.get('/students', {
        params: { 
          page: 1, 
          limit: 1000, 
          search: search || undefined, 
          status: statusFilter === 'ALL' ? undefined : statusFilter === 'true',
          enrollmentStatus: isAlumniView ? 'Completed' : undefined
        },
      });
      return res.data;
    },
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-all'],
    queryFn: async () => {
      const res = await apiClient.get('/teachers', { params: { limit: 1000 } });
      return res.data?.data || [];
    },
  });

  // Only courses that have at least one registered teacher are available
  const AVAILABLE_COURSES: string[] = React.useMemo(() => {
    if (!teachersData || teachersData.length === 0) return [];
    const courses = new Set<string>();
    teachersData.forEach((t: any) => {
      (t.subjects || []).forEach((s: string) => { if (s.trim()) courses.add(s.trim()); });
    });
    return Array.from(courses).sort();
  }, [teachersData]);

  const availableTimesForCourses = React.useMemo(() => {
    if (!form.courses || form.courses.length === 0) return [];
    if (!teachersData || teachersData.length === 0) return [];

    // Find all teachers that teach ANY of the selected courses
    const relevantTeachers = teachersData.filter((t: any) =>
      t.subjects?.some((sub: string) => form.courses.includes(sub))
    );

    // Extract all their times, flatten them, and remove duplicates
    const times = new Set<string>();
    relevantTeachers.forEach((t: any) => {
      if (Array.isArray(t.time)) {
        t.time.forEach((timeStr: string) => times.add(timeStr));
      } else if (typeof t.time === 'string' && t.time.trim() !== '') {
        times.add(t.time);
      }
    });

    return Array.from(times).sort();
  }, [form.courses, teachersData]);

  let students = data?.data || [];
  if (courseFilter !== 'ALL') students = students.filter((s: any) => s.courses?.includes(courseFilter));
  if (timeFilter !== 'ALL') students = students.filter((s: any) => s.time === timeFilter);
  students = students.sort((a: any, b: any) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];
    if (sortField === 'courses') { valA = a.courses?.[0] || ''; valB = b.courses?.[0] || ''; }
    if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = (valB || '').toLowerCase(); }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  const meta = data?.meta;
  const pageCount = meta ? meta.totalPages : 1;
  const total = meta ? meta.total : students.length;

  const createMutation = useMutation({
    mutationFn: async (formData: typeof emptyForm) => {
      const res = await apiClient.post('/students', formData);
      const studentId = res.data?.data?._id;
      
      // Auto-record Registration Fee
      if (studentId && Number(formData.registrationFee) > 0) {
        await apiClient.post('/finance/invoices', {
          student: studentId,
          description: 'Registration Fee',
          totalAmount: Number(formData.registrationFee),
          amountPaid: Number(formData.registrationFee), // auto-creates payment
          paymentMethod: 'EVC Plus',
        });
      }

      // Auto-record First Month Fee
      if (studentId && Number(formData.fee) > 0) {
        await apiClient.post('/finance/invoices', {
          student: studentId,
          description: 'Monthly Course Fee',
          totalAmount: Number(formData.fee),
          amountPaid: Number(formData.fee), // auto-creates payment
          paymentMethod: 'EVC Plus',
        });
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Refresh payments tab
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to register student';
      setError(msg);
      focusOnError(msg);
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
      const msg = err?.response?.data?.message || 'Failed to update student';
      setError(msg);
      focusOnError(msg);
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // The API uses PUT /students/:id to update fields
      const res = await apiClient.put(`/students/${id}`, { enrollmentStatus: status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to update status');
    }
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

  const handleDownloadExcel = () => {
    try {
      if (!students || students.length === 0) {
        alert('No students to download.');
        return;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(students.map((s: Student) => ({
        'Student ID': s.studentId,
        'Full Name': s.fullName,
        'Gender': s.gender,
        'Phone': s.phone || 'N/A',
        'Parent Name': s.parentName,
        'Parent Phone': s.parentPhone,
        'Monthly Fee': `$${s.fee}`,
        'Registration Fee': `$${s.registrationFee}`,
        'Courses': (s.courses || []).join(', '),
        'Status': s.status ? 'Active' : 'Inactive',
        'Time': s.time || 'N/A'
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      XLSX.writeFile(workbook, 'Students_List.xlsx');
    } catch (err) {
      console.error(err);
      alert('Failed to download Excel');
    }
  };

  const handlePrint = () => {
    try {
      if (!students || students.length === 0) {
        alert('No students to print.');
        return;
      }

      const printWindow = window.open('', '', 'width=900,height=650');
      if (!printWindow) return;

      const logoUrl = window.location.origin + '/Logo.jpeg';
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Student Registration Report</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                font-size: 12px; 
                color: #1e293b; 
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header { 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                border-bottom: 3px solid #0d3233;
                padding-bottom: 15px;
                margin-bottom: 25px;
              }
              .logo { height: 80px; width: auto; object-fit: contain; }
              .school-info { text-align: right; }
              .school-name { font-size: 22px; font-weight: 800; color: #0d3233; margin: 0 0 5px 0; letter-spacing: 0.5px; }
              .school-contact { font-size: 11px; color: #475569; margin: 2px 0; }
              .report-title { text-align: center; font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
              .meta-info { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 15px; font-weight: 500; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; }
              th { background-color: #0d3233; color: white; font-weight: 600; font-size: 11px; text-transform: uppercase; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logoUrl}" class="logo" alt="School Logo" />
              <div class="school-info">
                <h1 class="school-name">Wadajir Technical and Training Institute</h1>
                <p class="school-contact">Madina - Wadajir - Aargada Hormuud</p>
                <p class="school-contact">Phone: 615 716 373 - 689 | Email: wadajirtti@gmail.com</p>
              </div>
            </div>
            
            <div class="report-title">Registered Students Report</div>
            
            <div class="meta-info">
              <span>Total Records: ${students.length}</span>
              <span>Printed on: ${dateStr} at ${timeStr}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Courses</th>
                  <th>Teaching Time</th>
                  <th>Student Phone</th>
                  <th>Parent Info</th>
                </tr>
              </thead>
              <tbody>
                ${students.map((s: Student) => `
                  <tr>
                    <td style="font-weight: 600;">${s.studentId}</td>
                    <td>${s.fullName}</td>
                    <td>${s.gender}</td>
                    <td>${(s.courses || []).join(', ')}</td>
                    <td>${s.time || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td>${s.parentName} <br/><span style="color:#64748b;font-size:10px;">${s.parentPhone}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              Wadajir Technical and Training Institute • Official Document • Generated by Management System
            </div>

            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    } catch(err) {
      alert('Failed to print');
    }
  };

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
        time: s.time || '',
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
    { accessorKey: 'time', header: 'Time', cell: ({ getValue }) => (getValue() as string) || '—' },
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
      accessorKey: 'enrollmentStatus',
      header: 'Status',
      cell: ({ getValue, row }) => {
        const status = getValue<string>() || 'Active';
        const isLegacyStatusActive = row.original.status; // Fallback for old records
        
        let variant: "success" | "danger" | "warning" | "default" = 'success';
        if (status === 'Active' && isLegacyStatusActive === false) variant = 'danger'; // Old deactivated records
        else if (status === 'Active') variant = 'success';
        else if (status === 'Completed') variant = 'default';
        else if (status === 'Withdrawn' || status === 'Suspended') variant = 'danger';
        
        const label = status === 'Completed' ? 'Alumni' : status;
        
        return (
          <Badge variant={variant}>
            {status === 'Active' && isLegacyStatusActive === false ? 'Inactive' : label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-all duration-200 hover:scale-125 hover:-translate-y-1 hover:shadow-md active:scale-95"
            title="Edit Student"
          >
            <Edit className="w-4 h-4" />
          </button>

          <select
            value={row.original.enrollmentStatus || 'Active'}
            onChange={(e) => {
              if (confirm(`Change status to ${e.target.value}?`)) {
                // We'll add an updateStatusMutation for this
                updateStatusMutation.mutate({ id: row.original._id, status: e.target.value });
              }
            }}
            className="text-xs border border-gray-300 rounded-lg bg-white px-2 py-1 cursor-pointer hover:border-primary focus:outline-none"
            title="Change Status"
          >
            <option value="Active">Active</option>
            <option value="Completed">Alumni (Graduated)</option>
            <option value="Withdrawn">Drop</option>
            <option value="Suspended">Suspended</option>
          </select>
          <button
            onClick={() => {
              if (confirm(`Permanently delete student ${row.original.fullName}?`)) {
                deleteMutation.mutate(row.original._id);
              }
            }}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition-all duration-200 hover:scale-125 hover:-translate-y-1 hover:shadow-md active:scale-95"
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
          <h1 className="text-2xl font-bold text-gray-900">{isAlumniView ? 'Alumni Directory' : 'Student Directory'}</h1>
          <p className="text-gray-500 text-sm mt-1">{total} {isAlumniView ? 'graduated' : 'registered'} students</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold border border-slate-200"
            title="Print as A4"
          >
            <Printer className="w-4 h-4" />
            Print (A4)
          </button>
          <button
            onClick={handleDownloadExcel}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200"
            title="Download as Excel"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={openCreate}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register New Student
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="ALL">All Courses</option>
          {AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="ALL">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
        </select>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="createdAt">Sort: Date Added</option>
          <option value="fullName">Sort: Name</option>
          <option value="courses">Sort: Course</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder((o: string) => o === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
        >
          {sortOrder === 'asc' ? 'A → Z ↑' : 'Z → A ↓'}
        </button>
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
        size="xl"
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
                ref={fullNameRef}
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
                ref={phoneRef}
                type="tel"
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
                ref={parentNameRef}
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
              ref={parentPhoneRef}
              type="tel"
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={form.fee === 0 ? '' : form.fee}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setForm((f) => ({ ...f, fee: val === '' ? '' as unknown as number : Number(val) }));
                  }}
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={form.registrationFee === 0 ? '' : form.registrationFee}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setForm((f) => ({ ...f, registrationFee: val === '' ? '' as unknown as number : Number(val) }));
                  }}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary bg-white"
                />
              </div>
            </div>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Teaching Time *</label>
            <select
              required
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
              disabled={form.courses.length === 0}
            >
              <option value="">-- Select Teaching Time --</option>
              {availableTimesForCourses.map(timeStr => (
                <option key={timeStr} value={timeStr}>{timeStr}</option>
              ))}
            </select>
            {form.courses.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Select a course first to see available teaching times.</p>
            )}
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
              className="btn-hover px-4 py-2 text-sm font-bold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-hover px-5 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50 shadow-sm"
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

