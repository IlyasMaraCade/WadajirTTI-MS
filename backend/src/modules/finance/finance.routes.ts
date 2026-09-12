import { Router } from 'express';
import {
  getFinanceStats,
  getInvoices,
  getInvoice,
  createInvoice,
  cancelInvoice,
  getPayments,
  recordPayment,
  deletePayment,
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

// Super Admin, Finance & Principal have full access; Registration can record payments
router.get('/stats', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getFinanceStats);
router.get('/reports', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getFinancialReport);

// Invoices
router.get('/invoices', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), getInvoices);
router.get('/invoices/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), getInvoice);
router.post('/invoices', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), createInvoice);
router.patch('/invoices/:id/cancel', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), cancelInvoice);

// Payments & Receipts
router.get('/payments', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getPayments);
router.post('/payments', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), recordPayment);
router.delete('/payments/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), deletePayment);
router.get('/receipts/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), getReceipt);

// Expenses
router.get('/expenses', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), getExpenses);
router.post('/expenses', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), createExpense);
router.delete('/expenses/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.FINANCE, USER_ROLES.PRINCIPAL), deleteExpense);

export default router;

