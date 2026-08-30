import { Request, Response } from 'express';
import { Enrollment } from '../../models/Enrollment.model';
import { Student } from '../../models/Student.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const createEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { student, academicYear } = req.body;
  const existing = await Enrollment.findOne({ student, academicYear });
  if (existing) throw ApiError.conflict('Student is already enrolled in this academic year');
  const enrollment = await Enrollment.create(req.body);
  // Update student enrollmentStatus
  await Student.findByIdAndUpdate(student, { enrollmentStatus: 'Active' });
  const populated = await enrollment.populate([
    { path: 'student', select: 'studentId firstName lastName' },
    { path: 'academicYear', select: 'year' },
    { path: 'class', select: 'name' },
    { path: 'section', select: 'name' },
  ]);
  ApiResponse.created(res, populated);
});

export const getEnrollments = catchAsync(async (req: Request, res: Response) => {
  const { academicYear, class: classId, section, status } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (academicYear) query.academicYear = academicYear;
  if (classId) query.class = classId;
  if (section) query.section = section;
  if (status) query.status = status;

  const enrollments = await Enrollment.find(query)
    .populate('student', 'studentId firstName lastName')
    .populate('academicYear', 'year')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ createdAt: -1 });
  ApiResponse.success(res, enrollments);
});

export const updateEnrollment = catchAsync(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  ApiResponse.success(res, enrollment);
});
