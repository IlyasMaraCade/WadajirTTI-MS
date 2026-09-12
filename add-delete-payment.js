const fs = require('fs');

const controllerPath = './backend/src/modules/finance/finance.controller.ts';
let controller = fs.readFileSync(controllerPath, 'utf8');

const deletePaymentCode = `
export const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');

  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    const newPaidAmount = Math.max(0, invoice.paidAmount - payment.amount);
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
    
    let newStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Cancelled' = invoice.status;
    if (invoice.status !== 'Cancelled') {
      if (newPaidAmount === 0) newStatus = 'Unpaid';
      else if (newBalanceDue === 0) newStatus = 'Paid';
      else newStatus = 'Partial';
    }
    
    invoice.paidAmount = newPaidAmount;
    invoice.balanceDue = newBalanceDue;
    invoice.status = newStatus;
    await invoice.save();
  }

  await Payment.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, null, 'Payment deleted successfully');
});
`;

if (!controller.includes('export const deletePayment')) {
  controller += deletePaymentCode;
  fs.writeFileSync(controllerPath, controller);
  console.log('Added deletePayment to controller');
}

const routesPath = './backend/src/modules/finance/finance.routes.ts';
let routes = fs.readFileSync(routesPath, 'utf8');

if (!routes.includes('deletePayment')) {
  routes = routes.replace(
    'getPayments,\n  recordPayment,',
    'getPayments,\n  recordPayment,\n  deletePayment,'
  );
  routes = routes.replace(
    'router.post(\'/payments\', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), recordPayment);',
    'router.post(\'/payments\', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), recordPayment);\nrouter.delete(\'/payments/:id\', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), deletePayment);'
  );
  fs.writeFileSync(routesPath, routes);
  console.log('Added deletePayment to routes');
}

const frontendPath = './frontend/src/pages/finance/Payments.tsx';
let frontend = fs.readFileSync(frontendPath, 'utf8');

if (!frontend.includes('deletePaymentMutation')) {
  // Add Trash2 icon import
  if (!frontend.includes('Trash2')) {
    frontend = frontend.replace(
      'import { Plus, Search, DollarSign, Printer, Download, Eye, FileText, TrendingUp, CheckCircle, Clock } from \'lucide-react\';',
      'import { Plus, Search, DollarSign, Printer, Download, Eye, FileText, TrendingUp, CheckCircle, Clock, Trash2 } from \'lucide-react\';'
    );
  }

  // Add delete mutation
  const deleteMutationCode = `
  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(\`/finance/payments/\${id}\`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); },
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete payment'),
  });`;
  
  frontend = frontend.replace(
    'const handlePrintReceipt',
    deleteMutationCode + '\n\n  const handlePrintReceipt'
  );

  // Add delete button column
  const actionColumnReplace = `{
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSelectedReceipt(payment);
                setIsReceiptModalOpen(true);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Receipt"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePrintDirect(payment)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this payment? This will also update the invoice balance.')) {
                  deletePaymentMutation.mutate(payment._id);
                }
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Payment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }`;
    
  frontend = frontend.replace(
    /{\s*id:\s*'actions',\s*cell:\s*\(\{ row \}\)\s*=>\s*{\s*const payment = row\.original;\s*return \(\s*<div className="flex justify-end gap-2">\s*<button[^>]+>\s*<Eye className="w-4 h-4" \/>\s*<\/button>\s*<button[^>]+>\s*<Printer className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*\);\s*},\s*}/,
    actionColumnReplace
  );
  
  fs.writeFileSync(frontendPath, frontend);
  console.log('Added delete button to frontend');
}