"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceByDate = exports.markAttendanceByReg = exports.deleteExam = exports.enterMarks = exports.createExam = exports.getAllExams = exports.getAcademicPerformance = exports.getAttendanceMonitoring = exports.getDashboard = void 0;
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
const ApiError_1 = require("../../utils/ApiError");
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
    const mappedExams = exams.map(e => {
        const obj = e.toObject();
        if (!obj.subject && obj.subjectName) {
            obj.subject = { name: obj.subjectName };
        }
        return obj;
    });
    ApiResponse_1.ApiResponse.success(res, mappedExams);
});
exports.createExam = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { type, date, maxMarks, subjectName } = req.body;
    const name = `${type} - ${subjectName}`;
    const exam = await Exam_model_1.default.create({
        name, type, date, maxMarks, subjectName, createdBy: req.user?.userId
    });
    ApiResponse_1.ApiResponse.success(res, exam, 'Exam scheduled successfully');
});
function getGrade(score, maxMarks) {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 90)
        return 'A+';
    if (percentage >= 80)
        return 'A';
    if (percentage >= 70)
        return 'B';
    if (percentage >= 60)
        return 'C';
    if (percentage >= 50)
        return 'D';
    return 'F';
}
exports.enterMarks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    const { examId, records } = req.body;
    const exam = await Exam_model_1.default.findById(examId);
    if (!exam)
        throw new ApiError_1.ApiError(404, 'Exam not found');
    const operations = [];
    for (const record of records) {
        if (typeof record.score !== 'number' || record.score < 0 || record.score > exam.maxMarks) {
            throw new ApiError_1.ApiError(400, `Score ${record.score} is invalid or exceeds max marks ${exam.maxMarks}`);
        }
        operations.push({
            updateOne: {
                filter: { exam: exam._id, student: record.student },
                update: {
                    $set: {
                        score: record.score,
                        grade: getGrade(record.score, exam.maxMarks),
                        remarks: record.remarks,
                        recordedBy: userId,
                    },
                },
                upsert: true,
            },
        });
    }
    if (operations.length > 0) {
        await Mark_model_1.default.bulkWrite(operations);
    }
    return ApiResponse_1.ApiResponse.success(res, { count: operations.length }, 'Marks saved successfully');
});
exports.deleteExam = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const exam = await Exam_model_1.default.findById(id);
    if (!exam)
        throw new ApiError_1.ApiError(404, 'Exam not found');
    await Mark_model_1.default.deleteMany({ exam: exam._id });
    await Exam_model_1.default.findByIdAndDelete(id);
    return ApiResponse_1.ApiResponse.success(res, null, 'Exam deleted successfully');
});
exports.markAttendanceByReg = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.userId;
    const { subjectName, date, records } = req.body;
    if (!subjectName || !date || !records?.length) {
        throw new ApiError_1.ApiError(400, 'subjectName, date and records are required');
    }
    const subject = await Subject_model_1.Subject.findOne({ name: subjectName });
    if (!subject)
        throw new ApiError_1.ApiError(404, 'Subject not found');
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const operations = records.map((record) => ({
        updateOne: {
            filter: { student: record.studentId, subject: subject._id, date: attendanceDate },
            update: { $set: { status: record.status, recordedBy: userId } },
            upsert: true,
        },
    }));
    await Attendance_model_1.default.bulkWrite(operations);
    return ApiResponse_1.ApiResponse.success(res, { count: operations.length }, 'Attendance saved');
});
exports.getAttendanceByDate = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { subjectName, date } = req.query;
    const subject = await Subject_model_1.Subject.findOne({ name: subjectName });
    if (!subject)
        return ApiResponse_1.ApiResponse.success(res, [], 'No subject found');
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const records = await Attendance_model_1.default.find({ subject: subject._id, date: attendanceDate }).populate('student', 'fullName studentId phone');
    return ApiResponse_1.ApiResponse.success(res, records, 'Attendance fetched');
});
