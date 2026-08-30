import { Request, Response } from 'express';
import { Teacher } from '../../models/Teacher.model';
import { TeacherAssignment } from '../../models/TeacherAssignment.model';
import { Timetable } from '../../models/Timetable.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

// --- Teachers ---
export const getTeachers = catchAsync(async (req: Request, res: Response) => {
  const { search, status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ firstName: re }, { lastName: re }, { teacherId: re }, { specialization: re }];
  }
  if (status) query.employmentStatus = status;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const [teachers, total] = await Promise.all([
    Teacher.find(query).populate('user', 'email role').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Teacher.countDocuments(query),
  ]);
  ApiResponse.paginate(res, teachers, total, pageNum, limitNum);
});

export const getTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacher = await Teacher.findById(req.params.id).populate('user', 'email role isActive');
  if (!teacher) throw ApiError.notFound('Teacher not found');
  const assignments = await TeacherAssignment.find({ teacher: teacher._id })
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('academicYear', 'year');
  ApiResponse.success(res, { teacher, assignments });
});

export const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const existing = await Teacher.findOne({ teacherId: req.body.teacherId });
  if (existing) throw ApiError.conflict('Teacher ID already exists');
  const teacher = await Teacher.create(req.body);
  ApiResponse.created(res, teacher);
});

export const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!teacher) throw ApiError.notFound('Teacher not found');
  ApiResponse.success(res, teacher);
});

// --- Teacher Assignments ---
export const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const existing = await TeacherAssignment.findOne({
    teacher: req.body.teacher,
    subject: req.body.subject,
    section: req.body.section,
    academicYear: req.body.academicYear,
  });
  if (existing) throw ApiError.conflict('This teacher is already assigned to this subject/section for this academic year');
  const assignment = await TeacherAssignment.create(req.body);
  const populated = await assignment.populate([
    { path: 'teacher', select: 'teacherId firstName lastName' },
    { path: 'subject', select: 'name code' },
    { path: 'class', select: 'name' },
    { path: 'section', select: 'name' },
  ]);
  ApiResponse.created(res, populated);
});

export const getAssignments = catchAsync(async (req: Request, res: Response) => {
  const { academicYear, teacher } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (academicYear) query.academicYear = academicYear;
  if (teacher) query.teacher = teacher;
  const assignments = await TeacherAssignment.find(query)
    .populate('teacher', 'teacherId firstName lastName')
    .populate('subject', 'name code')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('academicYear', 'year');
  ApiResponse.success(res, assignments);
});

// --- Timetable ---
export const getTimetable = catchAsync(async (req: Request, res: Response) => {
  const { academicYear, term, section } = req.query as Record<string, string>;
  const query: Record<string, unknown> = {};
  if (academicYear) query.academicYear = academicYear;
  if (term) query.term = term;
  if (section) query.section = section;
  const entries = await Timetable.find(query)
    .populate('teacher', 'firstName lastName')
    .populate('subject', 'name')
    .populate('class', 'name')
    .populate('section', 'name')
    .sort({ dayOfWeek: 1, startTime: 1 });
  ApiResponse.success(res, entries);
});

export const createTimetableEntry = catchAsync(async (req: Request, res: Response) => {
  const { teacher, section, dayOfWeek, startTime, endTime, academicYear, term } = req.body;

  // Conflict: same teacher same slot
  const teacherConflict = await Timetable.findOne({ teacher, dayOfWeek, startTime, academicYear, term });
  if (teacherConflict) throw ApiError.conflict('Teacher already has a class at this time slot');

  // Conflict: same section same slot
  const sectionConflict = await Timetable.findOne({ section, dayOfWeek, startTime, academicYear, term });
  if (sectionConflict) throw ApiError.conflict('This section already has a class at this time slot');

  const entry = await Timetable.create(req.body);
  ApiResponse.created(res, entry);
});

export const updateTimetableEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!entry) throw ApiError.notFound('Timetable entry not found');
  ApiResponse.success(res, entry);
});

export const deleteTimetableEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await Timetable.findByIdAndDelete(req.params.id);
  if (!entry) throw ApiError.notFound('Timetable entry not found');
  ApiResponse.noContent(res);
});
