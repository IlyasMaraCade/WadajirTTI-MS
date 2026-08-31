import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, CreditCard, XCircle, Search, FileText } from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  student: { _id: string; studentId: string; fullName: string; courses?: string[]; fee?: number };
  studentName: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Cancelled';
  dueDate: string;
  issuedDate: string;
  notes?: string;
}

export const Invoices: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [form, setForm] = useState({
    studentId: '',
    description: 'Monthly Course Fee',
    totalAmount: 0,
    amountPaid: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'Cash',
  });

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMethod: 'Cash',
    reference: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Fetch Students for dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['students-all'],
    queryFn: async () => {
      const res = await apiClient.get('/students?limit=200');
      return res.data?.data || [];
    },
  });
  const students = studentsData || [];

  // Fetch Invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', statusFilter, search],
    queryFn: async () => {
      const res = await apiClient.get('/finance/invoices', {
        params: { status: statusFilter !== 'ALL' ? statusFilter : undefined, search: search || undefined },
      });
      return res.data?.data || [];
    },
  });
  const invoices: Invoice[] = invoicesData || [];

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/finance/invoices', {
        student: payload.studentId,
        description: payload.description,
        totalAmount: payload.totalAmount,
        amountPaid: payload.amountPaid,
        paymentMethod: payload.paymentMethod,
        dueDate: payload.dueDate,
        notes: payload.notes,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsCreateOpen(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to issue invoice');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/finance/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsPayModalOpen(false);
      setSelectedInvoice(null);
      setError(null);
      alert('Payment recorded successfully!');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to record payment');
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/finance/invoices/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
    },
  });

  const openPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayForm({
      amount: inv.balanceDue,
      paymentMethod: 'Cash',
      reference: '',
      notes: '',
    });
    setError(null);
    setIsPayModalOpen(true);
  };

  const handleStudentSelect = (sId: string) => {
    const st = students.find((s: any) => s._id === sId);
    setForm((f) => ({
      ...f,
      studentId: sId,
      totalAmount: st?.fee || 0,
      amountPaid: 0,
    }));
  };

  const columns: ColumnDef<Invoice, any>[] = [
    { accessorKey: 'invoiceNumber', header: 'Invoice #' },
    { accessorKey: 'studentName', header: 'Student' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="text-xs text-gray-600">{getValue() || 'Monthly Fee'}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total ($)',
      cell: ({ getValue }) => <span className="font-semibold text-gray-900">${getValue()}</span>,
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid ($)',
      cell: ({ getValue }) => <span className="font-semibold text-emerald-600">${getValue()}</span>,
    },
    {
      accessorKey: 'balanceDue',
      header: 'Balance ($)',
      cell: ({ getValue }) => (
        <span className={`font-bold ${getValue<number>() > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
          ${getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const variants: Record<string, 'danger' | 'warning' | 'success' | 'info'> = {
          Unpaid: 'danger',
          Partial: 'warning',
          Paid: 'success',
          Cancelled: 'info',
        };
        return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const inv = row.original;
        if (inv.status === 'Cancelled') return <span className="text-xs text-gray-400">Cancelled</span>;
        return (
          <div className="flex items-center gap-2">
            {inv.status !== 'Paid' && (
              <button
                onClick={() => openPay(inv)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Cancel invoice ${inv.invoiceNumber}?`)) {
                  cancelInvoiceMutation.mutate(inv._id);
                }
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Cancel Invoice"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">Issue and track fee billing across all enrolled courses</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={invoices}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No invoices found."
        />
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Issue Student Fee Invoice">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.studentId) {
              setError('Please select a student');
              return;
            }
            createInvoiceMutation.mutate(form);
          }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Student *</label>
            <select
              required
              value={form.studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.studentId}) — Fee: ${s.fee || 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description *</label>
            <input
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Invoice Description"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Fee row: Total (read-only from registration) | Amount Paid | Balance */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Total Fee ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  disabled
                  value={form.totalAmount}
                  className="w-full pl-7 pr-3 py-2 border border-blue-300 rounded-lg text-sm font-semibold bg-blue-100 text-blue-900 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-blue-500 mt-1">From student registration</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount Paid ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  max={form.totalAmount}
                  step="any"
                  value={form.amountPaid}
                  onChange={(e) => setForm((f) => ({ ...f, amountPaid: Number(e.target.value) }))}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Balance ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  disabled
                  value={Math.max(0, form.totalAmount - form.amountPaid)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-bold bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {form.amountPaid > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money (EVC Plus / Zaad)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Notes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="px-5 py-2 text-sm bg-primary text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {createInvoiceMutation.isPending ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Collect Payment: ${selectedInvoice?.invoiceNumber}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedInvoice) return;
            recordPaymentMutation.mutate({
              invoice: selectedInvoice._id,
              amount: payForm.amount,
              paymentMethod: payForm.paymentMethod,
              reference: payForm.reference,
              notes: payForm.notes,
            });
          }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-700 font-semibold">Student</p>
              <p className="text-sm font-bold text-emerald-900">{selectedInvoice?.studentName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-semibold">Remaining Balance</p>
              <p className="text-base font-bold text-emerald-900">${selectedInvoice?.balanceDue}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount to Pay ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={selectedInvoice?.balanceDue}
                  step="any"
                  value={payForm.amount}
                  onChange={(e) => setPayForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method *</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money (EVC Plus / Zaad)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Transaction Reference / Receipt #
            </label>
            <input
              value={payForm.reference}
              onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
              placeholder="Transaction Reference"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="px-5 py-2 text-sm bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
            >
              {recordPaymentMutation.isPending ? 'Processing...' : 'Confirm Payment & Print'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;

