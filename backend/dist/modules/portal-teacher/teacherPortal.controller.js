"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignments = exports.createAssignment = exports.enterMarks = exports.getExams = exports.createExam = exports.getAttendance = exports.markAttendance = exports.getMyStudents = exports.getDashboard = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const TeacherAssignment_model_1 = require("../../models/TeacherAssignment.model");
const Enrollment_model_1 = require("../../models/Enrollment.model");
const Attendance_model_1 = __importDefault(require("../../models/Attendance.model"));
const Exam_model_1 = __importDefault(require("../../models/Exam.model"));
const Mark_model_1 = __importDefault(require("../../models/Mark.model"));
const Assignment_model_1 = __importDefault(require("../../models/Assignment.model"));
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
// --- Dashboard & Overviews ---
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    // 1. Get assignments to know classes/subjects
    const assignments = await TeacherAssignment_model_1.TeacherAssignment.find({ teacher: teacherId })
        .populate('class section subject')
        .lean();
    const classIds = [...new Set(assignments.map((a) => a.class._id.toString()))];
    const sectionIds = [...new Set(assignments.map((a) => a.section._id.toString()))];
    // 2. Count active enrollments in those classes/sections
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const totalStudents = await Enrollment_model_1.Enrollment.countDocuments({
        class: { $in: classIds },
        section: { $in: sectionIds },
        academicYear: activeYear?._id,
        status: 'Active'
    });
    // 3. Upcoming Exams
    const upcomingExams = await Exam_model_1.default.find({
        createdBy: teacherId,
        status: 'Upcoming',
        date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(5).populate('class subject');
    // 4. Pending assignments
    const activeAssignments = await Assignment_model_1.default.find({
        createdBy: teacherId,
        status: 'Active',
        dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 }).limit(5).populate('class subject');
    return ApiResponse_1.ApiResponse.success(res, {
        totalClasses: classIds.length,
        totalSubjects: assignments.length,
        totalStudents,
        upcomingExams,
        activeAssignments,
        assignments
    }, 'Dashboard data fetched');
});
// --- Students ---
exports.getMyStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { classId, sectionId } = req.query;
    // Validate teacher is assigned to this class/section
    const query = { teacher: teacherId };
    if (classId)
        query['class'] = classId;
    if (sectionId)
        query['section'] = sectionId;
    const validAssignments = await TeacherAssignment_model_1.TeacherAssignment.find(query);
    if (validAssignments.length === 0) {
        return ApiResponse_1.ApiResponse.success(res, [], 'No students found (unauthorized or no assignments)');
    }
    const validClassIds = validAssignments.map((a) => a.class);
    const validSectionIds = validAssignments.map((a) => a.section);
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const enrollments = await Enrollment_model_1.Enrollment.find({
        class: { $in: validClassIds },
        section: { $in: validSectionIds },
        academicYear: activeYear?._id,
        status: 'Active'
    }).populate('student class section');
    return ApiResponse_1.ApiResponse.success(res, enrollments, 'Students fetched successfully');
});
// --- Attendance ---
exports.markAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { classId, sectionId, date, records } = req.body;
    // records: [{ student: id, status: 'Present' }]
    const queryAuth = { teacher: teacherId, class: classId, section: sectionId };
    const assignment = await TeacherAssignment_model_1.TeacherAssignment.findOne(queryAuth);
    if (!assignment) {
        throw new ApiError_1.ApiError(403, 'Not authorized to take attendance for this class/section');
    }
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    if (!activeYear)
        throw new ApiError_1.ApiError(400, 'No active academic year');
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    // Upsert each record
    const operations = records.map((record) => ({
        updateOne: {
            filter: {
                student: record.student,
                class: classId,
                section: sectionId,
                date: attendanceDate
            },
            update: {
                $set: {
                    status: record.status,
                    recordedBy: teacherId,
                    academicYear: activeYear._id,
                }
            },
            upsert: true
        }
    }));
    if (operations.length > 0) {
        await Attendance_model_1.default.bulkWrite(operations);
    }
    return ApiResponse_1.ApiResponse.success(res, null, 'Attendance recorded successfully');
});
exports.getAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { classId, sectionId, date } = req.query;
    const authQuery = { teacher: teacherId, class: classId, section: sectionId };
    const assignment = await TeacherAssignment_model_1.TeacherAssignment.findOne(authQuery);
    if (!assignment) {
        throw new ApiError_1.ApiError(403, 'Not authorized to view attendance for this class/section');
    }
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const query = {
        class: classId,
        section: sectionId,
        date: queryDate
    };
    const records = await Attendance_model_1.default.find(query).populate('student');
    return ApiResponse_1.ApiResponse.success(res, records, 'Attendance fetched');
});
// --- Exams & Marks ---
const getGrade = (score, maxMarks) => {
    const percentage = (score / maxMarks) * 100;
    if (percentage >= 90)
        return 'A';
    if (percentage >= 80)
        return 'B';
    if (percentage >= 70)
        return 'C';
    if (percentage >= 60)
        return 'D';
    return 'F';
};
exports.createExam = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { name, type, date, maxMarks, class: classId, section: sectionId, subject: subjectId } = req.body;
    const authQuery = { teacher: teacherId, class: classId, section: sectionId, subject: subjectId };
    const assignment = await TeacherAssignment_model_1.TeacherAssignment.findOne(authQuery);
    if (!assignment)
        throw new ApiError_1.ApiError(403, 'Not authorized for this subject/class');
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const exam = await Exam_model_1.default.create({
        name, type, date, maxMarks,
        class: classId, section: sectionId, subject: subjectId,
        academicYear: activeYear?._id,
        createdBy: teacherId
    });
    return ApiResponse_1.ApiResponse.success(res, exam, 'Exam created');
});
exports.getExams = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const exams = await Exam_model_1.default.find({ createdBy: req.teacherId }).populate('class section subject').sort('-createdAt');
    return ApiResponse_1.ApiResponse.success(res, exams, 'Exams fetched');
});
exports.enterMarks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { examId, records } = req.body;
    // records: [{ student, score, remarks }]
    const exam = await Exam_model_1.default.findById(examId);
    if (!exam)
        throw new ApiError_1.ApiError(404, 'Exam not found');
    if (exam.createdBy.toString() !== teacherId)
        throw new ApiError_1.ApiError(403, 'Not authorized');
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
                        recordedBy: teacherId
                    }
                },
                upsert: true
            }
        });
    }
    if (operations.length > 0) {
        await Mark_model_1.default.bulkWrite(operations);
    }
    return ApiResponse_1.ApiResponse.success(res, null, 'Marks recorded');
});
// --- Assignments ---
exports.createAssignment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { title, description, dueDate, class: classId, section: sectionId, subject: subjectId } = req.body;
    const authQuery = { teacher: teacherId, class: classId, section: sectionId, subject: subjectId };
    const auth = await TeacherAssignment_model_1.TeacherAssignment.findOne(authQuery);
    if (!auth)
        throw new ApiError_1.ApiError(403, 'Not authorized');
    const activeYear = await AcademicYear_model_1.AcademicYear.findOne({ isActive: true });
    const assignment = await Assignment_model_1.default.create({
        title, description, dueDate,
        class: classId, section: sectionId, subject: subjectId,
        academicYear: activeYear?._id,
        createdBy: teacherId
    });
    return ApiResponse_1.ApiResponse.success(res, assignment, 'Assignment created');
});
exports.getAssignments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const assignments = await Assignment_model_1.default.find({ createdBy: req.teacherId }).populate('class section subject').sort('-createdAt');
    return ApiResponse_1.ApiResponse.success(res, assignments, 'Assignments fetched');
});
