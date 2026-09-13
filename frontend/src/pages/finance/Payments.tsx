import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { Printer, Search, Plus, Trash2, Download, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { useInstitutionStore } from '@/store/institutionStore';
import { printElement } from '@/utils/printUtils';
import * as XLSX from 'xlsx';

interface PaymentRecord {
  _id: string;
  paymentNumber: string;
  studentName: string;
  student?: { studentId: string; phone?: string; courses?: string[] };
  invoice?: { invoiceNumber: string; totalAmount: number; balanceDue: number; description: string };
  amount: number;
  paymentMethod: string;
  reference?: string;
  receivedBy?: { firstName: string; lastName: string };
  date: string;
  notes?: string;
}

export const Payments: React.FC = () => {
  const { institution } = useInstitutionStore();
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [methodFilter, setMethodFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'studentName'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search],
    queryFn: async () => {
      const res = await apiClient.get('/finance/payments', {
        params: { search: search || undefined },
      });
      return res.data?.data || [];
    },
  });

  const allPayments: PaymentRecord[] = data || [];

  // Client-side filter + sort
  const payments = useMemo(() => {
    let list = [...allPayments];
    if (methodFilter) list = list.filter(p => p.paymentMethod === methodFilter);
    if (typeFilter) list = list.filter(p => p.invoice?.description === typeFilter);
    if (dateFrom) list = list.filter(p => new Date(p.date) >= new Date(dateFrom));
    if (dateTo) list = list.filter(p => new Date(p.date) <= new Date(dateTo + 'T23:59:59'));
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortField === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
      else if (sortField === 'amount') { av = a.amount; bv = b.amount; }
      else { av = a.studentName; bv = b.studentName; }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [allPayments, methodFilter, typeFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const queryClient = useQueryClient();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const defaultPayForm = { studentId: '', studentName: '', description: 'Monthly Course Fee', amount: '', paymentMethod: 'EVC Plus', reference: '', date: new Date().toISOString().split('T')[0] };
  const [payForm, setPayForm] = useState(defaultPayForm);
  const [error, setError] = useState('');
  const { data: studentsData } = useQuery({ queryKey: ['students-all-payments'], queryFn: async () => { const res = await apiClient.get('/students?limit=500'); return res.data?.data || []; } });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const invoiceRes = await apiClient.post('/finance/invoices', {
        student: data.studentId,
        description: data.description,
        totalAmount: Number(data.amount),
        amountPaid: 0,
        dueDate: data.date,
        paymentMethod: data.paymentMethod,
      });
      const invoiceId = invoiceRes.data?.data?._id;
      if (!invoiceId) throw new Error('Failed to create invoice');
      return apiClient.post('/finance/payments', {
        invoice: invoiceId,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        date: data.date,
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setIsRecordModalOpen(false); setPayForm(defaultPayForm); setError(''); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to record payment'),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/finance/payments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); },
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete payment'),
  });

  const handlePrintReceipt = () => {
    printElement('receipt-print-area', 'Payment Receipt');
  };

  const handlePrintList = () => {
    printElement('payments-print-table', 'Fee Payments & Receipts');
  };

  const handleExportExcel = () => {
    const rows = payments.map(p => ({
      'Receipt #': p.paymentNumber,
      'Student Name': p.studentName,
      'Amount ($)': p.amount,
      'Payment Method': p.paymentMethod,
      'Reference': p.reference || '',
      'Description': p.invoice?.description || '',
      'Date': new Date(p.date).toLocaleDateString(),
      'Cashier': p.receivedBy ? `${p.receivedBy.firstName} ${p.receivedBy.lastName}` : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    // Style header row width
    ws['!cols'] = [
      { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 14 }, { wch: 20 },
    ];
    XLSX.writeFile(wb, `Payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const METHODS = ['EVC Plus', 'Salaam Bank', 'Edahab', 'Jeeb'];

  const columns: ColumnDef<PaymentRecord, any>[] = [
    { accessorKey: 'paymentNumber', header: 'Receipt #', cell: ({ getValue }) => <span className="font-mono text-xs font-semibold text-slate-700">{getValue()}</span> },
    { accessorKey: 'studentName', header: 'Student Name' },
    {
      accessorKey: 'amount',
      header: 'Amount Paid',
      cell: ({ getValue }) => <span className="font-bold text-emerald-600">${getValue<number>().toLocaleString()}</span>,
    },
    { accessorKey: 'paymentMethod', header: 'Method', cell: ({ getValue }) => <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{getValue()}</span> },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ getValue }) => <span className="font-mono text-xs text-gray-400">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'receivedBy',
      header: 'Cashier',
      cell: ({ row }) =>
        row.original.receivedBy
          ? `${row.original.receivedBy.firstName} ${row.original.receivedBy.lastName}`
          : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => setSelectedReceipt(row.original)}
            className="btn-hover flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 shadow-sm transition-all"
            title="View / Print Receipt"
          >
            <Eye className="w-3.5 h-3.5" />
            Receipt
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this payment? This will revert the invoice balance.')) {
                deletePaymentMutation.mutate(row.original._id);
              }
            }}
            className="btn-hover flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
            title="Delete Payment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Payments & Receipts</h1>
          <p className="text-gray-500 text-sm mt-1">Transaction ledger and official student fee receipts</p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="btn-hover flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Total Payments</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Total Collected</p>
          <p className="text-2xl font-black text-slate-800 mt-1">${totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase">Active Filter</p>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            {typeFilter || methodFilter || dateFrom || dateTo
              ? [typeFilter, methodFilter, dateFrom && `From ${dateFrom}`, dateTo && `To ${dateTo}`].filter(Boolean).join(' · ')
              : 'All Records'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => setShowFilters(f => !f)}
          className={`btn-hover flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <Filter className="w-4 h-4" /> Filters
          {(methodFilter || typeFilter || dateFrom || dateTo) && <span className="w-2 h-2 bg-amber-400 rounded-full"></span>}
        </button>

        {/* Sort buttons */}
        {(['date', 'amount', 'studentName'] as const).map(f => (
          <button
            key={f}
            onClick={() => toggleSort(f)}
            className={`btn-hover flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${sortField === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {f === 'studentName' ? 'Name' : f.charAt(0).toUpperCase() + f.slice(1)}
            {sortField === f && <span>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
          </button>
        ))}

        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleExportExcel}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-all"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={handlePrintList}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-all"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="Monthly Course Fee">Monthly Fee</option>
              <option value="Registration Fee">Registration Fee</option>
              <option value="Book">Book</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</label>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="">All Methods</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary" />
          </div>
          <button
            onClick={() => { setMethodFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); }}
            className="btn-hover px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Table (also used for printing) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div id="payments-print-table">
          <DataTable
            data={payments}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No payments recorded yet."
          />
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Official Payment Receipt" size="lg">
        {selectedReceipt && (
          <div className="space-y-6" id="receipt-print-area">
            {/* Institution Brand Header */}
            <div className="text-center border-b border-gray-200 pb-4">
              <img src={institution.logoUrl} alt="Logo" className="h-16 w-16 mx-auto rounded-full object-cover mb-2" />
              <h2 className="text-lg font-bold text-gray-900">{institution.longName}</h2>
              <p className="text-xs text-gray-500">{institution.shortName} • Finance & Accounting Office</p>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mt-2">
                Official Fee Payment Receipt
              </p>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Receipt Number</span>
                <p className="font-mono font-bold text-gray-900 mt-0.5">{selectedReceipt.paymentNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase">Date of Payment</span>
                <p className="font-medium text-gray-900 mt-0.5">{new Date(selectedReceipt.date).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Student Name</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedReceipt.studentName}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase">Payment Method</span>
                <p className="font-medium text-gray-900 mt-0.5">{selectedReceipt.paymentMethod}</p>
              </div>
            </div>

            {/* Details Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{selectedReceipt.invoice?.description || 'Course Tuition Fee'}</p>
                      {selectedReceipt.reference && (
                        <p className="text-xs text-gray-400">Ref: {selectedReceipt.reference}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 text-lg">
                      ${selectedReceipt.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Verification Footer */}
            <div className="flex justify-between items-end pt-4 border-t border-gray-200 text-xs text-gray-500">
              <div>
                <p>
                  Received by:{' '}
                  <span className="font-semibold text-gray-800">
                    {selectedReceipt.receivedBy
                      ? `${selectedReceipt.receivedBy.firstName} ${selectedReceipt.receivedBy.lastName}`
                      : 'Finance Office'}
                  </span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Thank you for your payment!</p>
              </div>
              <div className="text-right">
                <div className="w-32 border-b border-gray-400 mb-1"></div>
                <p className="text-[10px] text-gray-400">Authorized Signature & Stamp</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print">
              <button type="button" onClick={() => setSelectedReceipt(null)}
                className="btn-hover px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button type="button" onClick={handlePrintReceipt}
                className="btn-hover flex items-center gap-2 px-5 py-2 text-sm bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 shadow-sm">
                <Printer className="w-4 h-4" /> Print Official Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Payment">
        <form onSubmit={(e) => { e.preventDefault(); recordPaymentMutation.mutate(payForm); }} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Student *</label>
            <select required value={payForm.studentId} onChange={e => {
              const sel = studentsData?.find((s: any) => s._id === e.target.value);
              const desc = payForm.description;
              const autoAmt = desc === 'Registration Fee' ? sel?.registrationFee
                            : desc === 'Monthly Course Fee' ? sel?.fee
                            : ''; // Book: manual
              setPayForm(f => ({ ...f, studentId: e.target.value, studentName: sel?.fullName || '', amount: autoAmt?.toString() || '' }));
            }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
              <option value="">Select Student</option>
              {studentsData?.map((s: any) => <option key={s._id} value={s._id}>{s.fullName} — {s.courses?.join(', ') || 'No Course'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Type *</label>
            <select required value={payForm.description} onChange={e => {
              const desc = e.target.value;
              const sel = studentsData?.find((s: any) => s._id === payForm.studentId);
              // Auto-fill amount for known types
              const amt = desc === 'Registration Fee' ? sel?.registrationFee
                        : desc === 'Monthly Course Fee' ? sel?.fee
                        : ''; // Book & others: manual entry
              setPayForm(f => ({ ...f, description: desc, amount: amt?.toString() || '' }));
            }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
              <option value="Monthly Course Fee">Monthly Fee</option>
              <option value="Registration Fee">Registration Fee</option>
              <option value="Book">Book</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Fee Amount ($) *</label>
              <input type="text" readOnly={payForm.description !== 'Other' && payForm.description !== 'Book'} value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none ${(payForm.description !== 'Other' && payForm.description !== 'Book') ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' : 'border-gray-300 bg-white focus:border-primary text-gray-900'}`}
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date *</label>
              <input type="date" required value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method *</label>
            <select value={payForm.paymentMethod} onChange={e => setPayForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
              <option value="EVC Plus">EVC Plus (Default)</option>
              <option value="Salaam Bank">Salaam Bank</option>
              <option value="Edahab">Edahab</option>
              <option value="Jeeb">Jeeb</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Sender Account / Phone Number *</label>
            <input required value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 61XXXXXXX" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsRecordModalOpen(false)}
              className="btn-hover px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={recordPaymentMutation.isPending}
              className="btn-hover px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-all active:scale-95">
              {recordPaymentMutation.isPending ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
