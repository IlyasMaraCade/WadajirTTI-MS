import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { Student } from '../../models/Student.model';
import { Teacher } from '../../models/Teacher.model';
import { Class } from '../../models/Class.model';
import { Section } from '../../models/Section.model';
import { Subject } from '../../models/Subject.model';
import { AcademicYear } from '../../models/AcademicYear.model';
import Attendance from '../../models/Attendance.model';
import Exam from '../../models/Exam.model';
import Mark from '../../models/Mark.model';
import { Invoice } from '../../models/Invoice.model';
import { Payment } from '../../models/Payment.model';
import { Expense } from '../../models/Expense.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeAcademicYear,
    invoices,
    payments,
    expenses,
    recentStudents,
    recentExams,
  ] = await Promise.all([
    User.countDocuments(),
    Student.countDocuments({ status: true }),
    Teacher.countDocuments({ employmentStatus: 'Active' }),
    Class.countDocuments({ isActive: true }),
    Section.countDocuments({ isActive: true }),
    Subject.countDocuments({ isActive: true }),
    AcademicYear.findOne({ isActive: true }),
    Invoice.find(),
    Payment.find(),
    Expense.find(),
    Student.find().sort({ createdAt: -1 }).limit(5),
    Exam.find().sort({ createdAt: -1 }).limit(5).populate('class subject createdBy', 'name firstName lastName'),
  ]);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  ApiResponse.success(res, {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeAcademicYear: activeAcademicYear?.year || 'None',
    totalIncome: totalCollected,
    totalExpenses,
    outstandingFees: Math.max(0, totalInvoiced - totalCollected),
    netBalance: totalCollected - totalExpenses,
    recentStudents,
    recentExams,
  });
});

export const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
  const { date, classId, sectionId } = req.query as Record<string, string>;
  const query: any = {};
  if (classId) query.class = classId;
  if (sectionId) query.section = sectionId;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    query.date = d;
  }

  const attendance = await Attendance.find(query)
    .populate('student', 'studentId fullName')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 });

  ApiResponse.success(res, attendance);
});

export const getAllMarks = catchAsync(async (req: Request, res: Response) => {
  const { examId, studentId } = req.query as Record<string, string>;
  const query: any = {};
  if (examId) query.exam = examId;
  if (studentId) query.student = studentId;

  const marks = await Mark.find(query)
    .populate('student', 'studentId fullName')
    .populate({
      path: 'exam',
      populate: { path: 'class subject createdBy', select: 'name firstName lastName' },
    })
    .populate('recordedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, marks);
});

export const getPerformanceReport = catchAsync(async (_req: Request, res: Response) => {
  const marks = await Mark.find()
    .populate('student', 'studentId fullName courses')
    .populate({
      path: 'exam',
      populate: { path: 'class subject', select: 'name' },
    });

  const studentPerformance: Record<string, { student: any; examsTaken: number; totalScore: number; totalMax: number; avgPercentage: number; grade: string }> = {};

  marks.forEach((m: any) => {
    if (!m.student || !m.exam) return;
    const sId = m.student._id.toString();
    if (!studentPerformance[sId]) {
      studentPerformance[sId] = {
        student: m.student,
        examsTaken: 0,
        totalScore: 0,
        totalMax: 0,
        avgPercentage: 0,
        grade: 'F',
      };
    }
    studentPerformance[sId].examsTaken += 1;
    studentPerformance[sId].totalScore += m.score || 0;
    studentPerformance[sId].totalMax += m.exam.maxMarks || 100;
  });

  const report = Object.values(studentPerformance).map(item => {
    const percentage = item.totalMax > 0 ? (item.totalScore / item.totalMax) * 100 : 0;
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    return {
      ...item,
      avgPercentage: Math.round(percentage * 10) / 10,
      grade,
    };
  });

  ApiResponse.success(res, report);
});