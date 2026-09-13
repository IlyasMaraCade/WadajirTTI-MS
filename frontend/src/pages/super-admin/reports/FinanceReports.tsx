import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Printer, Download, DollarSign, TrendingUp, TrendingDown, Layers, Calendar, BarChart3 } from 'lucide-react';

type FilterMode = 'daily' | 'monthly' | 'custom';

export const FinanceReports: React.FC = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Compute effective date range
  const getDateRange = () => {
    if (filterMode === 'daily') return { startDate: selectedDate, endDate: selectedDate };
    if (filterMode === 'monthly') {
      const [y, m] = selectedMonth.split('-');
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      return { startDate: `${selectedMonth}-01`, endDate: `${selectedMonth}-${String(lastDay).padStart(2, '0')}` };
    }
    return { startDate: startDate || undefined, endDate: endDate || undefined };
  };

  const { startDate: sd, endDate: ed } = getDateRange();

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', filterMode, selectedDate, selectedMonth, startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get('/finance/reports', {
        params: { startDate: sd || undefined, endDate: ed || undefined },
      });
      return res.data;
    },
  });

  const report = data?.data || {
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    payments: [],
    expenses: [],
    courseIncome: {},
    expenseCategoryBreakdown: {},
  };

  const periodLabel = filterMode === 'daily'
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : filterMode === 'monthly'
    ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : (startDate && endDate) ? `${startDate} — ${endDate}` : 'All Time';

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    const rows = [
      ['WADAJIR TECHNICAL AND TRAINING INSTITUTE - FINANCIAL REPORT'],
      [`Period: ${periodLabel}`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [''],
      ['SUMMARY'],
      ['Total Fee Income ($ USD)', `$${report.totalIncome}`],
      ['Total Expenses ($ USD)', `$${report.totalExpense}`],
      ['Net Balance ($ USD)', `$${report.netProfit}`],
      [''],
      ['INCOME BY COURSE'],
      ...Object.entries(report.courseIncome || {}).map(([course, amount]) => [course, `$${amount}`]),
      [''],
      ['RECENT PAYMENTS COLLECTED'],
      ['Receipt #', 'Student Name', 'Amount ($)', 'Method', 'Date'],
      ...report.payments.map((p: any) => [p.paymentNumber, p.studentName, `$${p.amount}`, p.paymentMethod, new Date(p.date).toLocaleDateString()]),
      [''],
      ['EXPENSES BREAKDOWN'],
      ['Expense #', 'Category', 'Amount ($)', 'Method', 'Date'],
      ...report.expenses.map((e: any) => [e.expenseNumber, e.category, `$${e.amount}`, e.paymentMethod, new Date(e.date).toLocaleDateString()]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Wadajir_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Print header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Wadajir Technical and Training Institute</h1>
        <p className="text-sm text-slate-600">Official Financial Statement — {periodLabel}</p>
        <p className="text-xs text-slate-500 mt-1">Report Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Financial Statements
          </h1>
          <p className="text-slate-500 text-sm mt-1">Audit fee revenue, expenses, and net balance</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadCSV} className="btn-hover flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 cursor-pointer">
            <Download className="w-4 h-4" /> Download CSV
          </button>
          <button onClick={handlePrint} className="btn-hover flex items-center gap-2 px-3.5 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-900 cursor-pointer">
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase text-slate-400 mr-1">Filter by</span>
        {/* Mode toggles */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm font-semibold">
          {(['daily', 'monthly', 'custom'] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`btn-hover px-3 py-1.5 rounded-md capitalize transition-all ${filterMode === mode ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {mode}
            </button>
          ))}
        </div>

        {filterMode === 'daily' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent text-sm focus:outline-none text-slate-700" />
          </div>
        )}

        {filterMode === 'monthly' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent text-sm focus:outline-none text-slate-700" />
          </div>
        )}

        {filterMode === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-slate-400 text-xs font-semibold">FROM</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm focus:outline-none text-slate-700" />
            <span className="text-slate-400 text-xs font-semibold">TO</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm focus:outline-none text-slate-700" />
          </div>
        )}

        <span className="ml-auto text-xs font-semibold text-slate-500 italic">{periodLabel}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-hover bg-emerald-50 border border-emerald-100 p-6 rounded-2xl cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {isLoading ? '...' : `$${report.totalIncome.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-emerald-200/50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-3 font-medium">{report.payments?.length || 0} payments recorded</p>
        </div>

        <div className="card-hover bg-rose-50 border border-rose-100 p-6 rounded-2xl cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Expenses</p>
              <p className="text-3xl font-black text-rose-700 mt-2">
                {isLoading ? '...' : `$${report.totalExpense.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-rose-200/50 text-rose-700 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-3 font-medium">{report.expenses?.length || 0} expense vouchers</p>
        </div>

        <div className={`card-hover border p-6 rounded-2xl cursor-default ${report.netProfit >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${report.netProfit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>Net Balance</p>
              <p className={`text-3xl font-black mt-2 ${report.netProfit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                {isLoading ? '...' : `$${report.netProfit.toLocaleString()}`}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${report.netProfit >= 0 ? 'bg-indigo-200/50 text-indigo-700' : 'bg-red-200/50 text-red-700'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-xs mt-3 font-medium ${report.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>Calculated after expenditures</p>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> Revenue by Course
          </h2>
          <div className="space-y-2">
            {Object.keys(report.courseIncome || {}).length === 0 ? (
              <p className="text-sm text-slate-400">No course revenue for this period.</p>
            ) : (
              Object.entries(report.courseIncome).map(([course, amount]: any) => (
                <div key={course} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-medium text-slate-700">{course}</span>
                  <span className="text-sm font-bold text-emerald-600">${Number(amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" /> Expenditure by Category
          </h2>
          <div className="space-y-2">
            {Object.keys(report.expenseCategoryBreakdown || {}).length === 0 ? (
              <p className="text-sm text-slate-400">No expenses for this period.</p>
            ) : (
              Object.entries(report.expenseCategoryBreakdown).map(([cat, amount]: any) => (
                <div key={cat} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-medium text-slate-700">{cat}</span>
                  <span className="text-sm font-bold text-rose-600">${Number(amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Payment Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Payment Ledger (Income)</h2>
          <span className="text-xs text-slate-400">{report.payments?.length || 0} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!report.payments?.length ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No payment records found for this period.</td></tr>
              ) : (
                report.payments?.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.paymentNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">${p.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{p.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReports;
