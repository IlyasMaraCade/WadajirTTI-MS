"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcademicPerformance = exports.getAttendanceMonitoring = exports.getDashboard = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const ApiResponse_1 = require("../../utils/ApiResponse");
const Student_model_1 = require("../../models/Student.model");
const Teacher_model_1 = require("../../models/Teacher.model");
const Class_model_1 = require("../../models/Class.model");
const Attendance_model_1 = __importDefault(require("../../models/Attendance.model"));
const Exam_model_1 = __importDefault(require("../../models/Exam.model"));
const Mark_model_1 = __importDefault(require("../../models/Mark.model"));
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const totalStudents = await Student_model_1.Student.countDocuments({ status: true });
    const totalTeachers = await Teacher_model_1.Teacher.countDocuments({ employmentStatus: 'Active' });
    const totalClasses = await Class_model_1.Class.countDocuments({ isActive: true });
    // Compute attendance rate for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance_model_1.default.aggregate([
        { $match: { date: today, academicYear: activeYear?._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    let presentCount = 0;
    let totalRecorded = 0;
    todayAttendance.forEach(a => {
        totalRecorded += a.count;
        if (a._id === 'Present')
            presentCount += a.count;
    });
    const attendanceRate = totalRecorded > 0 ? ((presentCount / totalRecorded) * 100).toFixed(1) : 0;
    // Recent Exams
    const recentExams = await Exam_model_1.default.find({ academicYear: activeYear?._id })
        .populate('class subject createdBy')
        .sort({ createdAt: -1 })
        .limit(5);
    return ApiResponse_1.ApiResponse.success(res, {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendance,
        attendanceRate,
        recentExams,
        activeYear: activeYear?.year || 'None'
    }, 'Principal dashboard fetched');
});
exports.getAttendanceMonitoring = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { date, classId } = req.query;
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const query = { date: queryDate, academicYear: activeYear?._id };
    if (classId)
        query['class'] = classId;
    const records = await Attendance_model_1.default.find(query)
        .populate('student class section subject recordedBy');
    return ApiResponse_1.ApiResponse.success(res, records, 'Attendance monitoring fetched');
});
exports.getAcademicPerformance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // Aggregate average scores per class/subject
    const performance = await Mark_model_1.default.aggregate([
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
                averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$examDetails.maxMarks'] }, 100] } },
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
    return ApiResponse_1.ApiResponse.success(res, performance, 'Academic performance fetched');
});
