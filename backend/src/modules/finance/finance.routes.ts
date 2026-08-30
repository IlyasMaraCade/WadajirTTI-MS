import { Router } from 'express';
import {
  getFinanceStats,
  getInvoices,
  getInvoice,
  createInvoice,
  cancelInvoice,
  getPayments,
  recordPayment,
  getReceipt,
  getExpenses,
  createExpense,
  deleteExpense,
  getFinancialReport,
} from './finance.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();
router.use(authenticate);

// Super Admin & Finance have full access; Principal can view reports & stats
router.get('/stats', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getFinanceStats);
router.get('/reports', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getFinancialReport);

// Invoices
router.get('/invoices', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), getInvoices);
router.get('/invoices/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), getInvoice);
router.post('/invoices', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), createInvoice);
router.patch('/invoices/:id/cancel', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), cancelInvoice);

// Payments & Receipts
router.get('/payments', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), getPayments);
router.post('/payments', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), recordPayment);
router.get('/receipts/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getReceipt);

// Expenses
router.get('/expenses', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), getExpenses);
router.post('/expenses', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), createExpense);
router.delete('/expenses/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE), deleteExpense);

export default router;

