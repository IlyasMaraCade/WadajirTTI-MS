"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExams = exports.getAcademicPerformance = exports.getAttendanceMonitoring = exports.getDashboard = void 0;
const Student_model_1 = require("../../models/Student.model");
const Teacher_model_1 = require("../../models/Teacher.model");
const Class_model_1 = require("../../models/Class.model");
const Section_model_1 = require("../../models/Section.model");
const Subject_model_1 = require("../../models/Subject.model");
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
const Attendance_model_1 = __importDefault(require("../../models/Attendance.model"));
const Exam_model_1 = __importDefault(require("../../models/Exam.model"));
const Mark_model_1 = __importDefault(require("../../models/Mark.model"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const [totalStudents, totalTeachers, totalClasses, totalSections, totalSubjects, activeAcademicYear, recentExams,] = await Promise.all([
        Student_model_1.Student.countDocuments({ status: true }),
        Teacher_model_1.Teacher.countDocuments({ employmentStatus: 'Active' }),
        Class_model_1.Class.countDocuments({ isActive: true }),
        Section_model_1.Section.countDocuments({ isActive: true }),
        Subject_model_1.Subject.countDocuments({ isActive: true }),
        AcademicYear_model_1.AcademicYear.findOne({ isActive: true }),
        Exam_model_1.default.find().sort({ createdAt: -1 }).limit(5).populate('class subject createdBy', 'name firstName lastName'),
    ]);
    ApiResponse_1.ApiResponse.success(res, {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
        totalSubjects,
        activeAcademicYear: activeAcademicYear?.year || 'None',
        recentExams,
    });
});
exports.getAttendanceMonitoring = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { date, classId, sectionId } = req.query;
    const query = {};
    if (classId)
        query.class = classId;
    if (sectionId)
        query.section = sectionId;
    if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        query.date = d;
    }
    const attendance = await Attendance_model_1.default.find(query)
        .populate('student', 'studentId fullName phone courses')
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('recordedBy', 'firstName lastName')
        .sort({ date: -1 });
    ApiResponse_1.ApiResponse.success(res, attendance);
});
exports.getAcademicPerformance = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const marks = await Mark_model_1.default.find()
        .populate('student', 'studentId fullName courses')
        .populate({
        path: 'exam',
        populate: { path: 'class subject', select: 'name' },
    });
    const studentPerformance = {};
    marks.forEach((m) => {
        if (!m.student || !m.exam)
            return;
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
        if (percentage >= 90)
            grade = 'A';
        else if (percentage >= 80)
            grade = 'B';
        else if (percentage >= 70)
            grade = 'C';
        else if (percentage >= 60)
            grade = 'D';
        return {
            ...item,
            avgPercentage: Math.round(percentage * 10) / 10,
            grade,
        };
    });
    ApiResponse_1.ApiResponse.success(res, report);
});
exports.getAllExams = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const exams = await Exam_model_1.default.find()
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('subject', 'name code')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, exams);
});
