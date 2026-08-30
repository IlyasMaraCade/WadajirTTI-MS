import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { ColumnDef } from '@tanstack/react-table';
import { Printer, Search, CreditCard, CheckCircle2 } from 'lucide-react';
import { useInstitutionStore } from '@/store/institutionStore';

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

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search],
    queryFn: async () => {
      const res = await apiClient.get('/finance/payments', {
        params: { search: search || undefined },
      });
      return res.data?.data || [];
    },
  });

  const payments: PaymentRecord[] = data || [];

  const handlePrintReceipt = () => {
    window.print();
  };

  const columns: ColumnDef<PaymentRecord, any>[] = [
    { accessorKey: 'paymentNumber', header: 'Receipt #' },
    { accessorKey: 'studentName', header: 'Student Name' },
    {
      accessorKey: 'amount',
      header: 'Amount Paid',
      cell: ({ getValue }) => <span className="font-bold text-emerald-600">${getValue()}</span>,
    },
    { accessorKey: 'paymentMethod', header: 'Method' },
    {
      accessorKey: 'reference',
      header: 'Reference #',
      cell: ({ getValue }) => <span className="font-mono text-xs text-gray-500">{getValue() || '—'}</span>,
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
        <button
          onClick={() => setSelectedReceipt(row.original)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-900 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          Receipt
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Payments & Receipts</h1>
          <p className="text-gray-500 text-sm mt-1">Transaction ledger and official student fee receipts</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search receipt #, student name, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={payments}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No payments recorded yet."
        />
      </div>

      {/* Official Printable Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Payment Receipt"
        size="lg"
      >
        {selectedReceipt && (
          <div className="space-y-6" id="receipt-print-area">
            {/* Institution Brand Header */}
            <div className="text-center border-b border-gray-200 pb-4">
              <img
                src={institution.logoUrl}
                alt="Logo"
                className="h-16 w-16 mx-auto rounded-full object-cover mb-2"
              />
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
                <p className="font-medium text-gray-900 mt-0.5">
                  {new Date(selectedReceipt.date).toLocaleString()}
                </p>
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
                      <p className="font-semibold text-gray-900">
                        {selectedReceipt.invoice?.description || 'Course Tuition Fee'}
                      </p>
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
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Official Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;

