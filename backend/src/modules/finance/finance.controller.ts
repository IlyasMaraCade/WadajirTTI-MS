import { MonthlyFee } from '../../models/MonthlyFee.model';
import { Request, Response } from 'express';
import { Invoice } from '../../models/Invoice.model';
import { Payment } from '../../models/Payment.model';
import { Expense } from '../../models/Expense.model';
import { Student } from '../../models/Student.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

// ─── Dashboard Stats ───────────────────────────────────────────────
export const getFinanceStats = catchAsync(async (req: Request, res: Response) => {
  const [invoices, payments, expenses, totalStudents] = await Promise.all([
    Invoice.find(),
    Payment.find(),
    Expense.find(),
    Student.countDocuments({ status: true }),
  ]);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const outstandingBalance = totalInvoiced - totalCollected;
  const netIncome = totalCollected - totalExpenses;

  const unpaidCount = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Partial').length;
  const paidCount = invoices.filter(i => i.status === 'Paid').length;

  // Recent 5 transactions
  const recentPayments = await Payment.find().sort({ date: -1 }).limit(5).populate('receivedBy', 'firstName lastName');
  const recentExpenses = await Expense.find().sort({ date: -1 }).limit(5).populate('recordedBy', 'firstName lastName');

  ApiResponse.success(res, {
    totalInvoiced,
    totalCollected,
    totalExpenses,
    outstandingBalance: Math.max(0, outstandingBalance),
    netIncome,
    totalStudents,
    unpaidCount,
    paidCount,
    recentPayments,
    recentExpenses,
  });
});

// ─── Invoices ──────────────────────────────────────────────────────
export const getInvoices = catchAsync(async (req: Request, res: Response) => {
  const { status, studentId, search } = req.query as Record<string, string>;
  const query: any = {};

  if (status && status !== 'ALL') query.status = status;
  if (studentId) query.student = studentId;
  if (search) {
    query.$or = [
      { invoiceNumber: new RegExp(search, 'i') },
      { studentName: new RegExp(search, 'i') },
    ];
  }

  const invoices = await Invoice.find(query)
    .populate('student', 'studentId fullName phone courses fee')
    .populate('issuedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, invoices);
});

export const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('student')
    .populate('issuedBy', 'firstName lastName');
  if (!invoice) throw ApiError.notFound('Invoice not found');

  const payments = await Payment.find({ invoice: invoice._id })
    .populate('receivedBy', 'firstName lastName')
    .sort({ date: -1 });

  ApiResponse.success(res, { invoice, payments });
});

export const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const { student: studentId, description, totalAmount, dueDate, notes, amountPaid, paymentMethod } = req.body;
  const student = await Student.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found');

  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const paidNow = Number(amountPaid) || 0;
  const totalFee = Number(totalAmount);
  const balanceDue = Math.max(0, totalFee - paidNow);
  let status: 'Unpaid' | 'Partial' | 'Paid' = 'Unpaid';
  if (paidNow > 0 && balanceDue === 0) status = 'Paid';
  else if (paidNow > 0) status = 'Partial';

  const invoice = await Invoice.create({
    invoiceNumber,
    student: student._id,
    studentName: student.fullName,
    description,
    totalAmount: totalFee,
    paidAmount: paidNow,
    balanceDue,
    status,
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    issuedBy: req.user?.userId,
    notes,
  });

  // Auto-create initial payment record if amountPaid was provided
  if (paidNow > 0) {
    const payCount = await Payment.countDocuments();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, '0')}`;
    await Payment.create({
      paymentNumber,
      invoice: invoice._id,
      student: student._id,
      studentName: student.fullName,
      amount: paidNow,
      paymentMethod: paymentMethod || 'EVC Plus',
      date: new Date(),
      receivedBy: req.user?.userId,
    });
  }

  ApiResponse.created(res, invoice);
});

export const cancelInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status: 'Cancelled' },
    { new: true }
  );
  if (!invoice) throw ApiError.notFound('Invoice not found');
  ApiResponse.success(res, invoice, 'Invoice cancelled');
});

// ─── Payments & Receipts ───────────────────────────────────────────
export const getPayments = catchAsync(async (req: Request, res: Response) => {
  const { search } = req.query as Record<string, string>;
  const query: any = {};
  if (search) {
    query.$or = [
      { paymentNumber: new RegExp(search, 'i') },
      { studentName: new RegExp(search, 'i') },
      { reference: new RegExp(search, 'i') },
    ];
  }

  const payments = await Payment.find(query)
    .populate('invoice')
    .populate('student', 'studentId fullName phone courses')
    .populate('receivedBy', 'firstName lastName')
    .sort({ date: -1 });

  ApiResponse.success(res, payments);
});

export const recordPayment = catchAsync(async (req: Request, res: Response) => {
  const { invoice: invoiceId, amount, paymentMethod, reference, notes, date } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === 'Cancelled') throw ApiError.badRequest('Cannot record payment for a cancelled invoice');

  const payAmount = Number(amount);
  if (payAmount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero');

  const newPaidAmount = invoice.paidAmount + payAmount;
  const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
  let newStatus: 'Unpaid' | 'Partial' | 'Paid' = 'Partial';
  if (newBalanceDue === 0) newStatus = 'Paid';
  else if (newPaidAmount === 0) newStatus = 'Unpaid';

  invoice.paidAmount = newPaidAmount;
  invoice.balanceDue = newBalanceDue;
  invoice.status = newStatus;
  await invoice.save();

  const count = await Payment.countDocuments();
  const paymentNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const payment = await Payment.create({
    paymentNumber,
    invoice: invoice._id,
    student: invoice.student,
    studentName: invoice.studentName,
    amount: payAmount,
    paymentMethod: paymentMethod || 'EVC Plus',
    reference,
    receivedBy: req.user?.userId,
    date: date ? new Date(date) : new Date(),
    notes,
  });

  ApiResponse.created(res, { payment, invoice });
});

export const getReceipt = catchAsync(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id)
    .populate('invoice')
    .populate('student')
    .populate('receivedBy', 'firstName lastName');

  if (!payment) throw ApiError.notFound('Payment receipt not found');
  ApiResponse.success(res, payment);
});

// ─── Expenses ──────────────────────────────────────────────────────
export const getExpenses = catchAsync(async (req: Request, res: Response) => {
  const { category, search } = req.query as Record<string, string>;
  const query: any = {};
  if (category && category !== 'ALL') query.category = category;
  if (search) {
    query.$or = [
      { expenseNumber: new RegExp(search, 'i') },
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  const expenses = await Expense.find(query)
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 });

  ApiResponse.success(res, expenses);
});

export const createExpense = catchAsync(async (req: Request, res: Response) => {
  const { category, title, description, amount, paymentMethod, reference, date } = req.body;

  const count = await Expense.countDocuments();
  const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const expense = await Expense.create({
    expenseNumber,
    category,
    title,
    description,
    amount: Number(amount),
    paymentMethod: paymentMethod || 'EVC Plus',
    reference,
    date: date ? new Date(date) : new Date(),
    recordedBy: req.user?.userId,
  });

  ApiResponse.created(res, expense);
});

export const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw ApiError.notFound('Expense not found');
  ApiResponse.success(res, null, 'Expense deleted successfully');
});

// ─── Financial Reports ─────────────────────────────────────────────
export const getFinancialReport = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as Record<string, string>;
  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const paymentQuery = Object.keys(dateFilter).length ? { date: dateFilter } : {};
  const expenseQuery = Object.keys(dateFilter).length ? { date: dateFilter } : {};

  const [payments, expenses, invoices] = await Promise.all([
    Payment.find(paymentQuery).populate('student', 'studentId fullName courses').sort({ date: -1 }),
    Expense.find(expenseQuery).sort({ date: -1 }),
    Invoice.find(),
  ]);

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Breakdown by course
  const courseIncome: Record<string, number> = {};
  payments.forEach((p: any) => {
    const studentCourses = p.student?.courses || ['Unassigned'];
    studentCourses.forEach((c: string) => {
      courseIncome[c] = (courseIncome[c] || 0) + (p.amount / studentCourses.length);
    });
  });

  // Breakdown by expense category
  const expenseCategoryBreakdown: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCategoryBreakdown[e.category] = (expenseCategoryBreakdown[e.category] || 0) + e.amount;
  });

  ApiResponse.success(res, {
    totalIncome,
    totalExpense,
    netProfit,
    totalInvoices: invoices.length,
    payments,
    expenses,
    courseIncome,
    expenseCategoryBreakdown,
  });
});


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


export const getUnpaidStudents = catchAsync(async (req: Request, res: Response) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const activeStudents = await Student.find({ status: true });
  const allPaidFees = await MonthlyFee.find({ status: 'Paid' });

  const unpaidStudents = [];
  
  for (const student of activeStudents) {
    if (student.fee <= 0) continue; // Skip students with 0 fee

    const regDate = student.createdAt as Date || new Date();
    const startMonth = regDate.getMonth() + 1;
    const startYear = regDate.getFullYear();

    const studentFees = allPaidFees.filter(f => f.student.toString() === student._id.toString());
    const unpaidMonths = [];

    let y = startYear;
    let m = startMonth;
    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      const isPaid = studentFees.some(f => f.year === y && f.month === m);
      if (!isPaid) {
        unpaidMonths.push({ month: m, year: y });
      }
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    if (unpaidMonths.length > 0) {
      unpaidStudents.push({
        _id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        courses: student.courses,
        time: student.time,
        feeAmount: student.fee,
        unpaidMonths,
        consecutiveMonths: unpaidMonths.length
      });
    }
  }

  unpaidStudents.sort((a, b) => b.consecutiveMonths - a.consecutiveMonths);
  ApiResponse.success(res, unpaidStudents);
});

export const markFeePaid = catchAsync(async (req: Request, res: Response) => {
  const { studentId, month, year, amount, paymentMethod = 'Cash' } = req.body;
  const userId = req.user?.userId;
  
  const student = await Student.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found');

  const existing = await MonthlyFee.findOne({ student: studentId, month, year, status: 'Paid' });
  if (existing) throw ApiError.badRequest('Fee already paid for this month');

  await MonthlyFee.create({
    student: studentId,
    month,
    year,
    amount,
    status: 'Paid',
    paymentDate: new Date(),
    recordedBy: userId
  });

  await Payment.create({
    paymentNumber: `PAY-MTH-${student.studentId}-${Date.now().toString().slice(-4)}`,
    student: studentId,
    studentName: student.fullName,
    amount,
    paymentMethod,
    receivedBy: userId || student._id,
    notes: `Monthly Tuition - ${month}/${year}`
  });

  ApiResponse.success(res, null, 'Fee marked as paid');
});
