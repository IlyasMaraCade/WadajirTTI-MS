import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertTriangle, Search, CheckCircle, CreditCard, ChevronDown } from 'lucide-react';

interface UnpaidStudent {
  _id: string;
  studentId: string;
  fullName: string;
  parentName: string;
  parentPhone: string;
  courses: string[];
  time: string;
  feeAmount: number;
  consecutiveMonths: number;
  unpaidMonths: { month: number; year: number }[];
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const getMonthName = (m: number) => MONTH_NAMES[m - 1] || String(m);

export const UnpaidFeesTable = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UnpaidStudent | null>(null);
  const [payMonth, setPayMonth] = useState<{ month: number; year: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: unpaidStudents = [], isLoading } = useQuery<UnpaidStudent[]>({
    queryKey: ['unpaid-students'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/unpaid-students');
      return res.data?.data || [];
    }
  });

  const payMutation = useMutation({
    mutationFn: async (data: { studentId: string; month: number; year: number; amount: number }) => {
      return apiClient.post('/finance/mark-fee-paid', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unpaid-students'] });
      setIsModalOpen(false);
      setSelectedStudent(null);
      setPayMonth(null);
    }
  });

  const handleOpenModal = (student: UnpaidStudent) => {
    setSelectedStudent(student);
    if (student.unpaidMonths.length > 0) {
      setPayMonth(student.unpaidMonths[0]);
    }
    setIsModalOpen(true);
  };

  const filtered = unpaidStudents.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.courses || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnpaid = unpaidStudents.length;
  const totalDanger = unpaidStudents.filter(s => s.consecutiveMonths >= 2).length;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Unpaid</p>
            <p className="text-2xl font-black text-text-primary">{totalUnpaid}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-rose-800 uppercase tracking-wider">Danger — 2+ Months</p>
            <p className="text-2xl font-black text-rose-900">{totalDanger}</p>
          </div>
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, ID, or course..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-xs uppercase tracking-wider font-bold text-text-secondary">
                <th className="p-4">Student</th>
                <th className="p-4">Course and Time</th>
                <th className="p-4">Parent Info</th>
                <th className="p-4">Unpaid Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(student => (
                <tr key={student._id} className={student.consecutiveMonths >= 2 ? 'bg-rose-50 hover:bg-rose-100 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                  <td className="p-4">
                    <p className="font-bold text-sm text-text-primary">{student.fullName}</p>
                    <p className="text-xs font-semibold text-text-muted">{student.studentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-text-primary">{(student.courses || []).join(', ')}</p>
                    <p className="text-xs text-text-secondary">{student.time || 'No Time Set'}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-text-primary">{student.parentName}</p>
                    <p className="text-xs text-text-secondary">{student.parentPhone}</p>
                  </td>
                  <td className="p-4">
                    {student.consecutiveMonths >= 2 ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-black">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        DANGER: {student.consecutiveMonths} MONTHS UNPAID
                      </div>
                    ) : (
                      <Badge variant="warning">{student.consecutiveMonths} Month Unpaid</Badge>
                    )}
                    <div className="text-xs text-text-muted mt-1 font-medium">
                      Missing: {student.unpaidMonths.map(m => getMonthName(m.month) + ' ' + m.year).join(', ')}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(student)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-200 shadow-sm cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted font-medium">
                    {searchTerm ? 'No students match your search.' : 'All students have paid their fees.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-border bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-lg text-text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Record Monthly Payment
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <p className="text-xs font-bold text-text-secondary uppercase">Student</p>
                <p className="font-bold text-text-primary">{selectedStudent.fullName} ({selectedStudent.studentId})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Select Month to Pay</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white border border-border text-text-primary text-sm font-semibold rounded-lg focus:ring-primary focus:border-primary block p-2.5 pr-8 cursor-pointer"
                    value={payMonth ? payMonth.month + '-' + payMonth.year : ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('-');
                      setPayMonth({ month: parseInt(parts[0]), year: parseInt(parts[1]) });
                    }}
                  >
                    {selectedStudent.unpaidMonths.map((m, i) => (
                      <option key={i} value={m.month + '-' + m.year}>
                        {getMonthName(m.month)} {m.year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-900">Amount Due:</span>
                <span className="text-lg font-black text-blue-900">{selectedStudent.feeAmount}</span>
              </div>
            </div>

            <div className="p-5 border-t border-border bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                disabled={payMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (payMonth && selectedStudent) {
                    payMutation.mutate({
                      studentId: selectedStudent._id,
                      month: payMonth.month,
                      year: payMonth.year,
                      amount: selectedStudent.feeAmount
                    });
                  }
                }}
                disabled={payMutation.isPending || !payMonth}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-black rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {payMutation.isPending ? 'Processing...' : (
                  <><CheckCircle className="w-4 h-4" /> Confirm Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
