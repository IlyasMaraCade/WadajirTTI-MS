import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ApiResponse } from '../../utils/ApiResponse';
import { Student } from '../../models/Student.model';
import { Teacher } from '../../models/Teacher.model';
import { Class } from '../../models/Class.model';
import Attendance from '../../models/Attendance.model';
import Exam from '../../models/Exam.model';
import Mark from '../../models/Mark.model';
import { AcademicYear } from '../../models/AcademicYear.model';

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const activeYear = await AcademicYear.findOne({ isActive: true });
  
  const totalStudents = await Student.countDocuments({ status: true });
  const totalTeachers = await Teacher.countDocuments({ employmentStatus: 'Active' });
  const totalClasses = await Class.countDocuments({ isActive: true });

  // Compute attendance rate for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await Attendance.aggregate([
    { $match: { date: today, academicYear: activeYear?._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  let presentCount = 0;
  let totalRecorded = 0;
  todayAttendance.forEach(a => {
    totalRecorded += a.count;
    if (a._id === 'Present') presentCount += a.count;
  });
  
  const attendanceRate = totalRecorded > 0 ? ((presentCount / totalRecorded) * 100).toFixed(1) : 0;

  // Recent Exams
  const recentExams = await Exam.find({ academicYear: activeYear?._id })
    .populate('class subject createdBy')
    .sort({ createdAt: -1 })
    .limit(5);

  return ApiResponse.success(res, {
    totalStudents,
    totalTeachers,
    totalClasses,
    todayAttendance,
    attendanceRate,
    recentExams,
    activeYear: activeYear?.year || 'None'
  }, 'Principal dashboard fetched');
});

export const getAttendanceMonitoring = catchAsync(async (req: Request, res: Response) => {
  const { date, classId } = req.query;
  const activeYear = await AcademicYear.findOne({ isActive: true });

  const queryDate = date ? new Date(date as string) : new Date();
  queryDate.setHours(0,0,0,0);

  const query: any = { date: queryDate, academicYear: activeYear?._id };
  if (classId) query['class'] = classId;

  const records = await Attendance.find(query)
    .populate('student class section subject recordedBy');
  
  return ApiResponse.success(res, records, 'Attendance monitoring fetched');
});

export const getAcademicPerformance = catchAsync(async (req: Request, res: Response) => {
  // Aggregate average scores per class/subject
  const performance = await Mark.aggregate([
    {
      $lookup: {
        from: 'exams',
        localField: 'exam',
        foreignField: '_id',
        as: 'examDetails'
      }
    },
    { $unwind: '$examDetails' },
    {
      $group: {
        _id: { class: '$examDetails.class', subject: '$examDetails.subject' },
        averageScore: { $avg: { $multiply: [ { $divide: ['$score', '$examDetails.maxMarks'] }, 100 ] } },
        totalExams: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id.class',
        foreignField: '_id',
        as: 'classDetails'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id.subject',
        foreignField: '_id',
        as: 'subjectDetails'
      }
    },
    { $unwind: '$classDetails' },
    { $unwind: '$subjectDetails' },
    {
      $project: {
        className: '$classDetails.name',
        subjectName: '$subjectDetails.name',
        averageScore: { $round: ['$averageScore', 2] },
        totalExams: 1
      }
    }
  ]);

  return ApiResponse.success(res, performance, 'Academic performance fetched');
});

