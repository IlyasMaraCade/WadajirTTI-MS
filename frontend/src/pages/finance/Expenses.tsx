import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Trash2, TrendingDown } from 'lucide-react';

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
  amount: 50,
  paymentMethod: 'EVC Plus',
  reference: '',
  date: new Date().toISOString().split('T')[0],
};

export const Expenses: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyExpenseForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', categoryFilter, search],
    queryFn: async () => {
      const res = await apiClient.get('/finance/expenses', {
        params: {
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
        },
      });
      return res.data?.data || [];
    },
  });

  const expenses: ExpenseRecord[] = data || [];

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
          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Categories</option>
          <option value="Kiro">Kiro</option>
          <option value="Qalab">Qalab (Electricity, Water, Internet)</option>
          
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={expenses}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No expenses recorded yet."
        />
      </div>

      {/* Record Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Operational Expense">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) {
              setError('Expense title is required');
              return;
            }
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="Kiro">Kiro</option>
                <option value="Qalab">Qalab</option>
                
                <option value="Other">Other</option>
              </select>
{form.category === 'Other' && <input className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Specify other category" value={form.customCategory} onChange={(e) => setForm(f => ({ ...f, customCategory: e.target.value }))} />}
</div>
<div>
<label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                <input
                  type="text" inputMode="numeric"
                  required
                  min="0.01"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expense Title / Item *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Expense Title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reference / Bill #</label>
            <input
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              placeholder="Reference Number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="px-5 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-sm"
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

