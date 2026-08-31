"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignments = exports.createAssignment = exports.enterMarks = exports.getExams = exports.createExam = exports.getAttendance = exports.markAttendance = exports.getMyStudents = exports.getDashboard = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const Attendance_model_1 = __importDefault(require("../../models/Attendance.model"));
const Exam_model_1 = __importDefault(require("../../models/Exam.model"));
const Mark_model_1 = __importDefault(require("../../models/Mark.model"));
const Assignment_model_1 = __importDefault(require("../../models/Assignment.model"));
const Subject_model_1 = require("../../models/Subject.model");
const Student_model_1 = require("../../models/Student.model");
// --- Dashboard & Overviews ---
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    // 1. Get subjects assigned to this teacher
    const subjects = await Subject_model_1.Subject.find({ teacher: teacherId, isActive: true }).lean();
    const subjectNames = subjects.map(s => s.name);
    // 2. Count active students enrolled in those subjects
    const totalStudents = await Student_model_1.Student.countDocuments({
        courses: { $in: subjectNames },
        enrollmentStatus: 'Active',
        status: true,
    });
    // 3. Upcoming Exams
    const upcomingExams = await Exam_model_1.default.find({
        createdBy: teacherId,
        status: 'Upcoming',
        date: { $gte: new Date() },
    }).sort({ date: 1 }).limit(5).populate('subject');
    // 4. Pending assignments
    const activeAssignments = await Assignment_model_1.default.find({
        createdBy: teacherId,
        status: 'Active',
        dueDate: { $gte: new Date() },
    }).sort({ dueDate: 1 }).limit(5).populate('subject');
    return ApiResponse_1.ApiResponse.success(res, {
        totalClasses: 0,
        totalSubjects: subjects.length,
        totalStudents,
        upcomingExams,
        activeAssignments,
        assignments: subjects.map(s => ({ subject: s })), // map for frontend compat
    }, 'Dashboard data fetched');
});
// --- Students (Strictly Exclude Fee Info for Teachers) ---
exports.getMyStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { subjectId } = req.query;
    // Validate teacher is assigned to this subject
    const query = { teacher: teacherId, isActive: true };
    if (subjectId)
        query['_id'] = subjectId;
    const validSubjects = await Subject_model_1.Subject.find(query);
    if (validSubjects.length === 0) {
        return ApiResponse_1.ApiResponse.success(res, [], 'No students found (unauthorized or no subjects)');
    }
    const validSubjectNames = validSubjects.map(s => s.name);
    const students = await Student_model_1.Student.find({
        courses: { $in: validSubjectNames },
        enrollmentStatus: 'Active',
        status: true,
    }).select('-fee -registrationFee'); // Teachers CANNOT see financial fee information
    // Map to "enrollment" shape for frontend compat
    const enrollments = students.map((student) => ({ student }));
    return ApiResponse_1.ApiResponse.success(res, enrollments, 'Students fetched successfully');
});
// --- Attendance ---
exports.markAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { subjectId, date, records } = req.body;
    const subject = await Subject_model_1.Subject.findOne({ _id: subjectId, teacher: teacherId });
    if (!subject) {
        throw new ApiError_1.ApiError(403, 'Not authorized to take attendance for this subject');
    }
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const operations = records.map((record) => ({
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
        await Attendance_model_1.default.bulkWrite(operations);
    }
    return ApiResponse_1.ApiResponse.success(res, null, 'Attendance recorded successfully');
});
exports.getAttendance = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { subjectId, date } = req.query;
    const subject = await Subject_model_1.Subject.findOne({ _id: subjectId, teacher: teacherId });
    if (!subject) {
        throw new ApiError_1.ApiError(403, 'Not authorized to view attendance for this subject');
    }
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const query = {
        subject: subjectId,
        date: queryDate,
    };
    const records = await Attendance_model_1.default.find(query).populate({
        path: 'student',
        select: '-fee -registrationFee',
    });
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
    const { name, type, date, maxMarks, subject: subjectId } = req.body;
    const subject = await Subject_model_1.Subject.findOne({ _id: subjectId, teacher: teacherId });
    if (!subject)
        throw new ApiError_1.ApiError(403, 'Not authorized for this subject');
    const exam = await Exam_model_1.default.create({
        name,
        type,
        date,
        maxMarks,
        subject: subjectId,
        createdBy: teacherId,
    });
    return ApiResponse_1.ApiResponse.success(res, exam, 'Exam created');
});
exports.getExams = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const exams = await Exam_model_1.default.find({ createdBy: req.teacherId }).populate('subject').sort('-createdAt');
    return ApiResponse_1.ApiResponse.success(res, exams, 'Exams fetched');
});
exports.enterMarks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacherId = req.teacherId;
    const { examId, records } = req.body;
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
                        recordedBy: teacherId,
                    },
                },
                upsert: true,
            },
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
    const { title, description, dueDate, subject: subjectId } = req.body;
    const auth = await Subject_model_1.Subject.findOne({ _id: subjectId, teacher: teacherId });
    if (!auth)
        throw new ApiError_1.ApiError(403, 'Not authorized');
    const assignment = await Assignment_model_1.default.create({
        title,
        description,
        dueDate,
        subject: subjectId,
        createdBy: teacherId,
    });
    return ApiResponse_1.ApiResponse.success(res, assignment, 'Assignment created');
});
exports.getAssignments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const assignments = await Assignment_model_1.default.find({ createdBy: req.teacherId }).populate('subject').sort('-createdAt');
    return ApiResponse_1.ApiResponse.success(res, assignments, 'Assignments fetched');
});
