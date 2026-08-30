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

// --- Dashboard & Overviews ---
export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;

  // 1. Get assignments to know classes/subjects
  const assignments = await TeacherAssignment.find({ teacher: teacherId })
    .populate('class section subject')
    .lean();

  const classIds = [...new Set(assignments.map((a: any) => a.class?._id?.toString()).filter(Boolean))];
  const sectionIds = [...new Set(assignments.map((a: any) => a.section?._id?.toString()).filter(Boolean))];

  // 2. Count active enrollments in those classes/sections
  const activeYear = await AcademicYear.findOne({ isActive: true });
  const totalStudents = await Enrollment.countDocuments({
    class: { $in: classIds },
    section: { $in: sectionIds },
    academicYear: activeYear?._id,
    status: 'Active',
  });

  // 3. Upcoming Exams
  const upcomingExams = await Exam.find({
    createdBy: teacherId,
    status: 'Upcoming',
    date: { $gte: new Date() },
  }).sort({ date: 1 }).limit(5).populate('class subject');

  // 4. Pending assignments
  const activeAssignments = await Assignment.find({
    createdBy: teacherId,
    status: 'Active',
    dueDate: { $gte: new Date() },
  }).sort({ dueDate: 1 }).limit(5).populate('class subject');

  return ApiResponse.success(res, {
    totalClasses: classIds.length,
    totalSubjects: assignments.length,
    totalStudents,
    upcomingExams,
    activeAssignments,
    assignments,
  }, 'Dashboard data fetched');
});

// --- Students (Strictly Exclude Fee Info for Teachers) ---
export const getMyStudents = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { classId, sectionId } = req.query;

  // Validate teacher is assigned to this class/section
  const query: any = { teacher: teacherId };
  if (classId) query['class'] = classId;
  if (sectionId) query['section'] = sectionId;

  const validAssignments = await TeacherAssignment.find(query);
  if (validAssignments.length === 0) {
    return ApiResponse.success(res, [], 'No students found (unauthorized or no assignments)');
  }

  const validClassIds = validAssignments.map((a: any) => a.class);
  const validSectionIds = validAssignments.map((a: any) => a.section);

  const activeYear = await AcademicYear.findOne({ isActive: true });

  const enrollments = await Enrollment.find({
    class: { $in: validClassIds },
    section: { $in: validSectionIds },
    academicYear: activeYear?._id,
    status: 'Active',
  }).populate({
    path: 'student',
    select: '-fee -registrationFee', // Teachers CANNOT see financial fee information
  }).populate('class section');

  return ApiResponse.success(res, enrollments, 'Students fetched successfully');
});

// --- Attendance ---
export const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { classId, sectionId, date, records } = req.body;

  const queryAuth: any = { teacher: teacherId, class: classId, section: sectionId };
  const assignment = await TeacherAssignment.findOne(queryAuth);
  if (!assignment) {
    throw new ApiError(403, 'Not authorized to take attendance for this class/section');
  }

  const activeYear = await AcademicYear.findOne({ isActive: true });
  if (!activeYear) throw new ApiError(400, 'No active academic year');

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const operations = records.map((record: any) => ({
    updateOne: {
      filter: { 
        student: record.student, 
        class: classId, 
        section: sectionId,
        date: attendanceDate,
      },
      update: {
        $set: {
          status: record.status,
          recordedBy: teacherId,
          academicYear: activeYear._id,
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
  const { classId, sectionId, date } = req.query;

  const authQuery: any = { teacher: teacherId, class: classId, section: sectionId };
  const assignment = await TeacherAssignment.findOne(authQuery);
  if (!assignment) {
    throw new ApiError(403, 'Not authorized to view attendance for this class/section');
  }

  const queryDate = new Date(date as string);
  queryDate.setHours(0, 0, 0, 0);

  const query: any = {
    class: classId,
    section: sectionId,
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
  const { name, type, date, maxMarks, class: classId, section: sectionId, subject: subjectId } = req.body;

  const authQuery: any = { teacher: teacherId, class: classId, section: sectionId, subject: subjectId };
  const assignment = await TeacherAssignment.findOne(authQuery);
  if (!assignment) throw new ApiError(403, 'Not authorized for this subject/class');

  const activeYear = await AcademicYear.findOne({ isActive: true });

  const exam = await Exam.create({
    name,
    type,
    date,
    maxMarks,
    class: classId,
    section: sectionId,
    subject: subjectId,
    academicYear: activeYear?._id,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, exam, 'Exam created');
});

export const getExams = catchAsync(async (req: Request, res: Response) => {
  const exams = await Exam.find({ createdBy: req.teacherId }).populate('class section subject').sort('-createdAt');
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
  const { title, description, dueDate, class: classId, section: sectionId, subject: subjectId } = req.body;

  const authQuery: any = { teacher: teacherId, class: classId, section: sectionId, subject: subjectId };
  const auth = await TeacherAssignment.findOne(authQuery);
  if (!auth) throw new ApiError(403, 'Not authorized');

  const activeYear = await AcademicYear.findOne({ isActive: true });

  const assignment = await Assignment.create({
    title,
    description,
    dueDate,
    class: classId,
    section: sectionId,
    subject: subjectId,
    academicYear: activeYear?._id,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, assignment, 'Assignment created');
});

export const getAssignments = catchAsync(async (req: Request, res: Response) => {
  const assignments = await Assignment.find({ createdBy: req.teacherId }).populate('class section subject').sort('-createdAt');
  return ApiResponse.success(res, assignments, 'Assignments fetched');
});
