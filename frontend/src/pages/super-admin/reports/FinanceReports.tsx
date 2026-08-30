import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Printer, Download, DollarSign, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export const FinanceReports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['financial-report', startDate, endDate],
    queryFn: async () => {
      const res = await apiClient.get('/finance/reports', {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['WADAJIR TECHNICAL AND TRAINING INSTITUTE - FINANCIAL REPORT'],
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
      ...report.payments.map((p: any) => [
        p.paymentNumber,
        p.studentName,
        `$${p.amount}`,
        p.paymentMethod,
        new Date(p.date).toLocaleDateString(),
      ]),
      [''],
      ['EXPENSES BREAKDOWN'],
      ['Expense #', 'Category', 'Title', 'Amount ($)', 'Method', 'Date'],
      ...report.expenses.map((e: any) => [
        e.expenseNumber,
        e.category,
        e.title,
        `$${e.amount}`,
        e.paymentMethod,
        new Date(e.date).toLocaleDateString(),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wadajir_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Reports & Statements</h1>
          <p className="text-slate-500 text-sm mt-1">Audit fee revenue, institutional expenses, and net balance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 no-print">
          <div className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm text-sm">
            <span className="text-slate-500 text-xs uppercase font-semibold">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-900 dark:text-white dark:[color-scheme:dark]"
            />
            <span className="text-slate-500 text-xs uppercase font-semibold">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-900 dark:text-white dark:[color-scheme:dark]"
            />
          </div>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Wadajir Technical and Training Institute</h1>
        <p className="text-sm text-slate-600">Official Financial Statement</p>
        <p className="text-xs text-slate-500 mt-1">Report Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="modern-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">${report.totalIncome.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{report.payments?.length || 0} payments recorded</p>
        </div>

        <div className="modern-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600 dark:text-rose-400 mt-2">${report.totalExpense.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{report.expenses?.length || 0} expense vouchers</p>
        </div>

        <div className="modern-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Institutional Balance</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  report.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-rose-400'
                }`}
              >
                ${report.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Calculated after expenditures</p>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Course */}
        <div className="modern-card p-6 rounded-xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Revenue Breakdown by Course
          </h2>
          <div className="space-y-3">
            {Object.keys(report.courseIncome || {}).length === 0 ? (
              <p className="text-sm text-slate-400">No course revenue recorded yet.</p>
            ) : (
              Object.entries(report.courseIncome).map(([course, amount]: any) => (
                <div key={course} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course}</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${Number(amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="modern-card p-6 rounded-xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500 dark:text-rose-400" />
            Expenditure by Category
          </h2>
          <div className="space-y-3">
            {Object.keys(report.expenseCategoryBreakdown || {}).length === 0 ? (
              <p className="text-sm text-slate-400">No expense records found.</p>
            ) : (
              Object.entries(report.expenseCategoryBreakdown).map(([cat, amount]: any) => (
                <div key={cat} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                  <span className="text-sm font-bold text-red-600 dark:text-rose-400">${Number(amount).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="modern-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Payment Ledger (Income)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.payments?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                report.payments?.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs text-slate-500">{p.paymentNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-200">{p.studentName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">${p.amount}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.paymentMethod}</td>
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

