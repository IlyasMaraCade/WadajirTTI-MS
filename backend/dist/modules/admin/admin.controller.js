"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceReport = exports.getAllMarks = exports.getAllAttendance = exports.getDashboardStats = void 0;
const User_model_1 = require("../../models/User.model");
const Student_model_1 = require("../../models/Student.model");
const Teacher_model_1 = require("../../models/Teacher.model");
const Class_model_1 = require("../../models/Class.model");
const Section_model_1 = require("../../models/Section.model");
const Subject_model_1 = require("../../models/Subject.model");
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
const Attendance_model_1 = __importDefault(require("../../models/Attendance.model"));
const Exam_model_1 = __importDefault(require("../../models/Exam.model"));
const Mark_model_1 = __importDefault(require("../../models/Mark.model"));
const Invoice_model_1 = require("../../models/Invoice.model");
const Payment_model_1 = require("../../models/Payment.model");
const Expense_model_1 = require("../../models/Expense.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getDashboardStats = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const [totalUsers, totalStudents, totalTeachers, totalClasses, totalSections, totalSubjects, activeAcademicYear, invoices, payments, expenses, recentStudents, recentExams,] = await Promise.all([
        User_model_1.User.countDocuments(),
        Student_model_1.Student.countDocuments({ status: true }),
        Teacher_model_1.Teacher.countDocuments({ employmentStatus: 'Active' }),
        Class_model_1.Class.countDocuments({ isActive: true }),
        Section_model_1.Section.countDocuments({ isActive: true }),
        Subject_model_1.Subject.countDocuments({ isActive: true }),
        AcademicYear_model_1.AcademicYear.findOne({ isActive: true }),
        Invoice_model_1.Invoice.find(),
        Payment_model_1.Payment.find(),
        Expense_model_1.Expense.find(),
        Student_model_1.Student.find().sort({ createdAt: -1 }).limit(5),
        Exam_model_1.default.find().sort({ createdAt: -1 }).limit(5).populate('class subject createdBy', 'name firstName lastName'),
    ]);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    ApiResponse_1.ApiResponse.success(res, {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSections,
        totalSubjects,
        activeAcademicYear: activeAcademicYear?.year || 'None',
        totalIncome: totalCollected,
        totalExpenses,
        outstandingFees: Math.max(0, totalInvoiced - totalCollected),
        netBalance: totalCollected - totalExpenses,
        recentStudents,
        recentExams,
    });
});
exports.getAllAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
        .populate('student', 'studentId fullName phone parentName parentPhone')
        .populate('subject', 'name')
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('recordedBy', 'firstName lastName')
        .sort({ date: -1 });
    ApiResponse_1.ApiResponse.success(res, attendance);
});
exports.getAllMarks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { examId, studentId } = req.query;
    const query = {};
    if (examId)
        query.exam = examId;
    if (studentId)
        query.student = studentId;
    const marks = await Mark_model_1.default.find(query)
        .populate('student', 'studentId fullName')
        .populate({
        path: 'exam',
        populate: { path: 'class subject createdBy', select: 'name firstName lastName' },
    })
        .populate('recordedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, marks);
});
exports.getPerformanceReport = (0, catchAsync_1.catchAsync)(async (_req, res) => {
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
