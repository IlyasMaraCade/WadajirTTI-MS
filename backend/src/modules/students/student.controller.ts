import { Request, Response } from 'express';
import { Student } from '../../models/Student.model';
import { Enrollment } from '../../models/Enrollment.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getStudents = catchAsync(async (req: Request, res: Response) => {
  const { search, status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ firstName: re }, { lastName: re }, { studentId: re }];
  }
  if (status !== undefined) query.status = status === 'true';

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
  const existing = await Student.findOne({ studentId: req.body.studentId });
  if (existing) throw ApiError.conflict('Student ID already exists');
  const student = await Student.create(req.body);
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
