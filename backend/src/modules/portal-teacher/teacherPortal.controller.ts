import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { TeacherAssignment } from '../../models/TeacherAssignment.model';
import { Enrollment } from '../../models/Enrollment.model';
import Attendance from '../../models/Attendance.model';
import Exam from '../../models/Exam.model';
import Mark from '../../models/Mark.model';
import Assignment from '../../models/Assignment.model';
import { AcademicYear } from '../../models/AcademicYear.model';

import { Subject } from '../../models/Subject.model';
import { Student } from '../../models/Student.model';

// --- Dashboard & Overviews ---
export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;

  // 1. Get subjects assigned to this teacher
  const subjects = await Subject.find({ teacher: teacherId, isActive: true }).lean();
  const subjectNames = subjects.map(s => s.name);

  // 2. Count active students enrolled in those subjects
  const totalStudents = await (Student as any).countDocuments({
    courses: { $in: subjectNames },
    enrollmentStatus: 'Active',
    status: true,
  });

  // 3. Upcoming Exams
  const upcomingExams = await Exam.find({
    createdBy: teacherId,
    status: 'Upcoming',
    date: { $gte: new Date() },
  }).sort({ date: 1 }).limit(5).populate('subject');

  // 4. Pending assignments
  const activeAssignments = await Assignment.find({
    createdBy: teacherId,
    status: 'Active',
    dueDate: { $gte: new Date() },
  }).sort({ dueDate: 1 }).limit(5).populate('subject');

  return ApiResponse.success(res, {
    totalClasses: 0,
    totalSubjects: subjects.length,
    totalStudents,
    upcomingExams,
    activeAssignments,
    assignments: subjects.map(s => ({ subject: s })), // map for frontend compat
  }, 'Dashboard data fetched');
});

// --- Students (Strictly Exclude Fee Info for Teachers) ---
export const getMyStudents = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { subjectId } = req.query;

  // Validate teacher is assigned to this subject
  const query: any = { teacher: teacherId, isActive: true };
  if (subjectId) query['_id'] = subjectId;

  const validSubjects = await Subject.find(query);
  if (validSubjects.length === 0) {
    return ApiResponse.success(res, [], 'No students found (unauthorized or no subjects)');
  }

  const validSubjectNames = validSubjects.map(s => s.name);

  const students = await (Student as any).find({
    courses: { $in: validSubjectNames },
    enrollmentStatus: 'Active',
    status: true,
  }).select('-fee -registrationFee'); // Teachers CANNOT see financial fee information

  // Map to "enrollment" shape for frontend compat
  const enrollments = (students as any[]).map((student: any) => ({ student }));

  return ApiResponse.success(res, enrollments, 'Students fetched successfully');
});

// --- Attendance ---
export const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { subjectId, date, records } = req.body;

  const subject = await Subject.findOne({ _id: subjectId, teacher: teacherId });
  if (!subject) {
    throw new ApiError(403, 'Not authorized to take attendance for this subject');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const operations = records.map((record: any) => ({
    updateOne: {
      filter: { 
        student: record.student, 
        subject: subjectId,
        date: attendanceDate,
      },
      update: {
        $set: {
          status: record.status,
          recordedBy: teacherId,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Attendance.bulkWrite(operations);
  }

  return ApiResponse.success(res, null, 'Attendance recorded successfully');
});

export const getAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { subjectId, date } = req.query;

  const subject = await Subject.findOne({ _id: subjectId as string, teacher: teacherId as string });
  if (!subject) {
    throw new ApiError(403, 'Not authorized to view attendance for this subject');
  }

  const queryDate = new Date(date as string);
  queryDate.setHours(0, 0, 0, 0);

  const query: any = {
    subject: subjectId,
    date: queryDate,
  };

  const records = await Attendance.find(query).populate({
    path: 'student',
    select: '-fee -registrationFee',
  });

  return ApiResponse.success(res, records, 'Attendance fetched');
});

// --- Exams & Marks ---
const getGrade = (score: number, maxMarks: number) => {
  const percentage = (score / maxMarks) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const createExam = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { name, type, date, maxMarks, subject: subjectId } = req.body;

  const subject = await Subject.findOne({ _id: subjectId, teacher: teacherId });
  if (!subject) throw new ApiError(403, 'Not authorized for this subject');

  const exam = await Exam.create({
    name,
    type,
    date,
    maxMarks,
    subject: subjectId,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, exam, 'Exam created');
});

export const getExams = catchAsync(async (req: Request, res: Response) => {
  const exams = await Exam.find({ createdBy: req.teacherId }).populate('subject').sort('-createdAt');
  return ApiResponse.success(res, exams, 'Exams fetched');
});

export const enterMarks = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { examId, records } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  if (exam.createdBy.toString() !== teacherId) throw new ApiError(403, 'Not authorized');

  const operations: any[] = [];
  for (const record of records) {
    if (typeof record.score !== 'number' || record.score < 0 || record.score > exam.maxMarks) {
      throw new ApiError(400, `Score ${record.score} is invalid or exceeds max marks ${exam.maxMarks}`);
    }
    operations.push({
      updateOne: {
        filter: { exam: exam._id, student: record.student },
        update: {
          $set: {
            score: record.score,
            grade: getGrade(record.score, exam.maxMarks),
            remarks: record.remarks,
            recordedBy: teacherId,
          },
        },
        upsert: true,
      },
    });
  }

  if (operations.length > 0) {
    await Mark.bulkWrite(operations);
  }

  return ApiResponse.success(res, null, 'Marks recorded');
});

// --- Assignments ---
export const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { title, description, dueDate, subject: subjectId } = req.body;

  const auth = await Subject.findOne({ _id: subjectId, teacher: teacherId });
  if (!auth) throw new ApiError(403, 'Not authorized');

  const assignment = await Assignment.create({
    title,
    description,
    dueDate,
    subject: subjectId,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, assignment, 'Assignment created');
});

export const getAssignments = catchAsync(async (req: Request, res: Response) => {
  const assignments = await Assignment.find({ createdBy: req.teacherId }).populate('subject').sort('-createdAt');
  return ApiResponse.success(res, assignments, 'Assignments fetched');
});
