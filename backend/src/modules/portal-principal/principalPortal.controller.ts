import { Request, Response } from 'express';
import { Student } from '../../models/Student.model';
import { Teacher } from '../../models/Teacher.model';
import { Class } from '../../models/Class.model';
import { Section } from '../../models/Section.model';
import { Subject } from '../../models/Subject.model';
import { AcademicYear } from '../../models/AcademicYear.model';
import Attendance from '../../models/Attendance.model';
import Exam from '../../models/Exam.model';
import Mark from '../../models/Mark.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeAcademicYear,
    recentExams,
  ] = await Promise.all([
    Student.countDocuments({ status: true }),
    Teacher.countDocuments({ employmentStatus: 'Active' }),
    Class.countDocuments({ isActive: true }),
    Section.countDocuments({ isActive: true }),
    Subject.countDocuments({ isActive: true }),
    AcademicYear.findOne({ isActive: true }),
    Exam.find().sort({ createdAt: -1 }).limit(5).populate('class subject createdBy', 'name firstName lastName'),
  ]);

  ApiResponse.success(res, {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeAcademicYear: activeAcademicYear?.year || 'None',
    recentExams,
  });
});

export const getAttendanceMonitoring = catchAsync(async (req: Request, res: Response) => {
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
    .populate('student', 'studentId fullName phone courses')
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 });

  ApiResponse.success(res, attendance);
});

export const getAcademicPerformance = catchAsync(async (_req: Request, res: Response) => {
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

export const getAllExams = catchAsync(async (_req: Request, res: Response) => {
  const exams = await Exam.find()
    .populate('class', 'name')
    .populate('section', 'name')
    .populate('subject', 'name code')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, exams);
});
