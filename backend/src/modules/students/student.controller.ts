import { Request, Response } from 'express';
import { Student } from '../../models/Student.model';
import { Enrollment } from '../../models/Enrollment.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getStudents = catchAsync(async (req: Request, res: Response) => {
  const { search, status, page = '1', limit = '50' } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ fullName: re }, { studentId: re }, { parentName: re }, { phone: re }, { parentPhone: re }];
  }
  if (status !== undefined && status !== '') query.status = status === 'true';

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
