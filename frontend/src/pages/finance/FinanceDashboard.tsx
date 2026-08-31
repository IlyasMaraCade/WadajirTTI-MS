import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api';
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Sparkles,
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['finance-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/stats');
      return res.data;
    },
  });

  const stats = data?.data || {
    totalInvoiced: 0,
    totalCollected: 0,
    totalExpenses: 0,
    outstandingBalance: 0,
    netIncome: 0,
    unpaidCount: 0,
    paidCount: 0,
    recentPayments: [],
    recentExpenses: [],
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Treasury, Billing & Institutional Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">
            Finance Dashboard
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            Real-time tracking of student fee collections, institutional expenses, and cash flow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/finance/invoices')}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-accent" />
            + New Invoice
          </button>
          <button
            onClick={() => navigate('/finance/payments')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-600 shadow-md transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="modern-card modern-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Revenue
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
            ${stats.totalCollected.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{stats.paidCount} settled invoices</p>
        </div>

        {/* Outstanding Unpaid */}
        <div className="modern-card modern-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outstanding Fees
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-3 tracking-tight">
            ${stats.outstandingBalance.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{stats.unpaidCount} unpaid/pending</p>
        </div>

        {/* Expenses */}
        <div className="modern-card modern-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-3 tracking-tight">
            ${stats.totalExpenses.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">Operational expenditures</p>
        </div>

        {/* Net Balance */}
        <div className="modern-card modern-card-hover p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Balance
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-extrabold mt-3 tracking-tight ${
              stats.netIncome >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ${stats.netIncome.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">Revenue minus expenses</p>
        </div>
      </div>

      {/* Two-Column: Recent Payments and Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments */}
        <div className="modern-card p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Recent Fee Payments
            </h2>
            <button
              onClick={() => navigate('/finance/payments')}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              View Ledger
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentPayments?.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-slate-400">No payment records yet.</p>
            ) : (
              stats.recentPayments?.map((p: any) => (
                <div key={p._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{p.studentName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {p.paymentNumber} • {p.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">+${p.amount}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(p.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="modern-card p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Recent Operating Expenses
            </h2>
            <button
              onClick={() => navigate('/finance/expenses')}
              className="text-[11px] font-semibold text-rose-600 hover:underline"
            >
              View Ledger
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentExpenses?.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-slate-400">No expense records yet.</p>
            ) : (
              stats.recentExpenses?.map((e: any) => (
                <div key={e._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{e.title}</p>
                    <span className="inline-block text-[10px] bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-lg font-semibold mt-0.5 border border-rose-100 dark:border-rose-500/20">
                      {e.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">-${e.amount}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(e.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;