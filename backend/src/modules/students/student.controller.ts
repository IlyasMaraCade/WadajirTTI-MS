import { Request, Response } from 'express';
import { Student } from '../../models/Student.model';
import { Payment } from '../../models/Payment.model';
import { MonthlyFee } from '../../models/MonthlyFee.model';
import { Enrollment } from '../../models/Enrollment.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getStudents = catchAsync(async (req: Request, res: Response) => {
  const { search, status, enrollmentStatus, page = '1', limit = '50' } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ fullName: re }, { studentId: re }, { parentName: re }, { phone: re }, { parentPhone: re }];
  }
  if (status !== undefined && status !== '') query.status = status === 'true';
  if (enrollmentStatus) query.enrollmentStatus = enrollmentStatus;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Student.countDocuments(query),
  ]);

  ApiResponse.paginate(res, students, total, pageNum, limitNum);
});

export const getStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  const enrollments = await Enrollment.find({ student: student._id })
    .populate('academicYear', 'year')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ createdAt: -1 });
  ApiResponse.success(res, { student, enrollments });
});

export const createStudent = catchAsync(async (req: Request, res: Response) => {
  // Duplicate check by full name (case-insensitive)
  const duplicateName = await Student.findOne({ fullName: { $regex: new RegExp(`^${req.body.fullName?.trim()}$`, 'i') } });
  if (duplicateName) throw ApiError.conflict(`A student named "${req.body.fullName}" already exists (ID: ${duplicateName.studentId})`);

  let studentId = req.body.studentId;
  if (!studentId) {
    const count = await Student.countDocuments();
    studentId = `STU-${String(count + 1).padStart(4, '0')}`;
  }

  const existing = await Student.findOne({ studentId });
  if (existing) {
    studentId = `STU-${Date.now().toString().slice(-6)}`;
  }

  const student = await Student.create({
    ...req.body,
    studentId,
  });

  // Automatically create Payment records for Registration Fee and First Month Fee
  const userId = req.user?.userId; // Assumes auth middleware sets req.user
  const now = new Date();
  
  if (student.registrationFee > 0) {
    await Payment.create({
      paymentNumber: `PAY-REG-${student.studentId}-${Date.now().toString().slice(-4)}`,
      student: student._id,
      studentName: student.fullName,
      amount: student.registrationFee,
      paymentMethod: 'Cash',
      receivedBy: userId || student._id, // Fallback if no user
      notes: 'Initial Registration Fee'
    });
  }

  if (student.fee > 0) {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Create MonthlyFee tracker record
    await MonthlyFee.create({
      student: student._id,
      month: currentMonth,
      year: currentYear,
      amount: student.fee,
      status: 'Paid',
      paymentDate: now,
      recordedBy: userId || student._id,
      notes: 'First Month Tuition'
    });

    // Create Payment transaction record
    await Payment.create({
      paymentNumber: `PAY-MTH-${student.studentId}-${Date.now().toString().slice(-4)}`,
      student: student._id,
      studentName: student.fullName,
      amount: student.fee,
      paymentMethod: 'Cash',
      receivedBy: userId || student._id,
      notes: `Monthly Tuition - ${currentMonth}/${currentYear}`
    });
  }

  ApiResponse.created(res, student);
});

export const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) throw ApiError.notFound('Student not found');
  ApiResponse.success(res, student);
});

export const toggleStudentStatus = catchAsync(async (req: Request, res: Response) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  student.status = !student.status;
  await student.save();
  ApiResponse.success(res, student, `Student ${student.status ? 'activated' : 'deactivated'}`);
});

export const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  ApiResponse.success(res, null, 'Student removed successfully');
});
