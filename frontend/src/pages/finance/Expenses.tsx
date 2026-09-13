import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Trash2, Download, Printer, Filter, ArrowUpDown } from 'lucide-react';
import { printElement } from '@/utils/printUtils';
import * as XLSX from 'xlsx';

interface ExpenseRecord {
  _id: string;
  expenseNumber: string;
  category: string;
  title: string;
  description?: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  date: string;
  recordedBy?: { firstName: string; lastName: string };
}

const emptyExpenseForm = {
  category: 'Kiro', customCategory: '',
  title: '',
  description: '',
  amount: '' as unknown as number,
  paymentMethod: 'EVC Plus',
  reference: '',
  date: new Date().toISOString().split('T')[0],
};

export const Expenses: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Filters and Sort State
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'title'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyExpenseForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: async () => {
      const res = await apiClient.get('/finance/expenses', {
        params: {
          search: search || undefined,
        },
      });
      return res.data?.data || [];
    },
  });

  const allExpenses: ExpenseRecord[] = data || [];

  // Client-side filter + sort
  const expenses = useMemo(() => {
    let list = [...allExpenses];
    if (categoryFilter) list = list.filter(p => p.category === categoryFilter);
    if (dateFrom) list = list.filter(p => new Date(p.date) >= new Date(dateFrom));
    if (dateTo) list = list.filter(p => new Date(p.date) <= new Date(dateTo + 'T23:59:59'));
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortField === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
      else if (sortField === 'amount') { av = a.amount; bv = b.amount; }
      else { av = a.title; bv = b.title; }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [allExpenses, categoryFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalAmount = expenses.reduce((s, p) => s + (p.amount || 0), 0);

  const createExpenseMutation = useMutation({
    mutationFn: async (payload: typeof emptyExpenseForm) => {
      const res = await apiClient.post('/finance/expenses', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsModalOpen(false);
      setForm(emptyExpenseForm);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to record expense');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/finance/expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
    },
  });

  const handlePrintList = () => {
    printElement('expenses-print-table', 'Institutional Expenses Ledger');
  };

  const handleExportExcel = () => {
    const rows = expenses.map(p => ({
      'Voucher #': p.expenseNumber,
      'Category': p.category,
      'Title': p.title,
      'Amount ($)': p.amount,
      'Payment Method': p.paymentMethod,
      'Date': new Date(p.date).toLocaleDateString(),
      'Recorded By': p.recordedBy ? `${p.recordedBy.firstName} ${p.recordedBy.lastName}` : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const columns: ColumnDef<ExpenseRecord, any>[] = [
    { accessorKey: 'expenseNumber', header: 'Voucher #' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
          {getValue()}
        </span>
      ),
    },
    { accessorKey: 'title', header: 'Title / Description' },
    {
      accessorKey: 'amount',
      header: 'Amount ($)',
      cell: ({ getValue }) => <span className="font-bold text-red-600">${getValue()}</span>,
    },
    { accessorKey: 'paymentMethod', header: 'Method' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'recordedBy',
      header: 'Recorded By',
      cell: ({ row }) =>
        row.original.recordedBy
          ? `${row.original.recordedBy.firstName} ${row.original.recordedBy.lastName}`
          : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => {
            if (confirm(`Delete expense "${row.original.title}"?`)) {
              deleteExpenseMutation.mutate(row.original._id);
            }
          }}
          className="btn-hover p-1.5 text-red-600 hover:bg-red-50 rounded"
          title="Delete Expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutional Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Track operational expenditures, Qalab, and material purchases</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintList}
            className="btn-hover flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-hover flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold shadow-sm"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="btn-hover flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{expenses.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</p>
            <p className="text-2xl font-black text-red-600 mt-1">${totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Filters</p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {categoryFilter ? categoryFilter : 'All Categories'} • {dateFrom && dateTo ? 'Custom Dates' : 'All Time'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search by name, voucher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
              showFilters ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button onClick={() => toggleSort('date')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortField === 'date' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Date <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => toggleSort('amount')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortField === 'amount' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Amount <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => toggleSort('title')} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortField === 'title' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              Title <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 animate-in slide-in-from-top-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-red-500"
            >
              <option value="">All Categories</option>
              <option value="Kiro">Kiro</option>
              <option value="Qalab">Qalab</option>
              <option value="Other">Other</option>
            </select>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-red-500"
                title="From Date"
              />
              <span className="text-slate-400 font-medium">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-red-500"
                title="To Date"
              />
            </div>
            
            {(categoryFilter || dateFrom || dateTo) && (
              <button
                onClick={() => { setCategoryFilter(''); setDateFrom(''); setDateTo(''); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={expenses}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No expenses recorded yet."
        />
      </div>

      {/* Hidden print element */}
      <div id="expenses-print-table" className="hidden print:block font-sans text-sm">
        <h2 className="text-xl font-bold mb-4">Institutional Expenses Ledger</h2>
        <table className="w-full text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2">Date</th>
              <th className="border border-slate-300 p-2">Voucher #</th>
              <th className="border border-slate-300 p-2">Category</th>
              <th className="border border-slate-300 p-2">Title</th>
              <th className="border border-slate-300 p-2">Amount</th>
              <th className="border border-slate-300 p-2">Method</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(p => (
              <tr key={p._id}>
                <td className="border border-slate-300 p-2">{new Date(p.date).toLocaleDateString()}</td>
                <td className="border border-slate-300 p-2 font-mono text-xs">{p.expenseNumber}</td>
                <td className="border border-slate-300 p-2">{p.category}</td>
                <td className="border border-slate-300 p-2">{p.title}</td>
                <td className="border border-slate-300 p-2 font-bold">${p.amount}</td>
                <td className="border border-slate-300 p-2">{p.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Operational Expense">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createExpenseMutation.mutate({ ...form, category: form.category === 'Other' ? form.customCategory : form.category });
          }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 bg-white"
              >
                <option value="Kiro">Kiro</option>
                <option value="Qalab">Qalab</option>
                <option value="Other">Other</option>
              </select>
              {form.category === 'Other' && <input className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" placeholder="Specify other category" value={form.customCategory} onChange={(e) => setForm(f => ({ ...f, customCategory: e.target.value }))} />}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="number" inputMode="numeric"
                  required
                  min="0.01"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 bg-white"
              >
                <option value="EVC Plus">EVC Plus (Default)</option>
<option value="Salaam Bank">Salaam Bank</option>
<option value="Edahab">Edahab</option>
<option value="Jeeb">Jeeb</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reference / Bill #</label>
            <input
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              placeholder="Reference Number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-hover px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="btn-hover px-5 py-2 text-sm bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-sm"
            >
              {createExpenseMutation.isPending ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;

