"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeacher = exports.deleteTimetableEntry = exports.updateTimetableEntry = exports.createTimetableEntry = exports.getTimetable = exports.getAssignments = exports.createAssignment = exports.updateTeacher = exports.createTeacher = exports.getTeacher = exports.getTeachers = void 0;
const Teacher_model_1 = require("../../models/Teacher.model");
const Subject_model_1 = require("../../models/Subject.model");
const User_model_1 = require("../../models/User.model");
const TeacherAssignment_model_1 = require("../../models/TeacherAssignment.model");
const Timetable_model_1 = require("../../models/Timetable.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const mongoose_1 = __importDefault(require("mongoose"));
// --- Teachers ---
exports.getTeachers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { search, status, page = '1', limit = '20' } = req.query;
    const query = {};
    if (search) {
        const re = new RegExp(search, 'i');
        query.$or = [{ fullName: re }, { teacherId: re }];
    }
    if (status)
        query.employmentStatus = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [teachers, total] = await Promise.all([
        Teacher_model_1.Teacher.find(query).populate('user', 'email role username').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
        Teacher_model_1.Teacher.countDocuments(query),
    ]);
    ApiResponse_1.ApiResponse.paginate(res, teachers, total, pageNum, limitNum);
});
exports.getTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacher = await Teacher_model_1.Teacher.findById(req.params.id).populate('user', 'email role isActive username');
    if (!teacher)
        throw ApiError_1.ApiError.notFound('Teacher not found');
    const assignments = await TeacherAssignment_model_1.TeacherAssignment.find({ teacher: teacher._id })
        .populate('subject', 'name code')
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('academicYear', 'year');
    ApiResponse_1.ApiResponse.success(res, { teacher, assignments });
});
exports.createTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { teacherId, username, password, ...rest } = req.body;
    const existing = await Teacher_model_1.Teacher.findOne({ teacherId });
    if (existing)
        throw ApiError_1.ApiError.conflict('Teacher ID already exists');
    const existingName = await Teacher_model_1.Teacher.findOne({ fullName: req.body.fullName });
    if (existingName)
        throw ApiError_1.ApiError.conflict('A teacher with this name already exists');
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let userId = null;
        // If username and password are provided, create the user account
        if (username && password) {
            const existingUser = await User_model_1.User.findOne({ username: username.toLowerCase() }).session(session);
            if (existingUser) {
                throw ApiError_1.ApiError.conflict('Username already exists');
            }
            const names = (req.body.fullName || '').split(' ');
            const firstName = names[0] || 'Teacher';
            const lastName = names.slice(1).join(' ') || '.';
            const newUser = new User_model_1.User({
                username,
                password,
                firstName,
                lastName,
                phone: req.body.phone,
                role: 'TEACHER',
            });
            await newUser.save({ session });
            userId = newUser._id;
        }
        const teacher = new Teacher_model_1.Teacher({
            teacherId,
            ...rest,
            user: userId,
        });
        await teacher.save({ session });
        // Automatically upsert subjects
        if (rest.subjects && Array.isArray(rest.subjects)) {
            for (const subjectName of rest.subjects) {
                if (subjectName.trim()) {
                    await Subject_model_1.Subject.findOneAndUpdate({ name: subjectName.trim() }, { $setOnInsert: { name: subjectName.trim(), isActive: true } }, { upsert: true, session });
                }
            }
        }
        await session.commitTransaction();
        ApiResponse_1.ApiResponse.created(res, teacher);
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.updateTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacher = await Teacher_model_1.Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher)
        throw ApiError_1.ApiError.notFound('Teacher not found');
    // Automatically upsert subjects
    if (req.body.subjects && Array.isArray(req.body.subjects)) {
        for (const subjectName of req.body.subjects) {
            if (subjectName.trim()) {
                await Subject_model_1.Subject.findOneAndUpdate({ name: subjectName.trim() }, { $setOnInsert: { name: subjectName.trim(), isActive: true } }, { upsert: true });
            }
        }
    }
    ApiResponse_1.ApiResponse.success(res, teacher);
});
// --- Teacher Assignments ---
exports.createAssignment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const existing = await TeacherAssignment_model_1.TeacherAssignment.findOne({
        teacher: req.body.teacher,
        subject: req.body.subject,
        section: req.body.section,
        academicYear: req.body.academicYear,
    });
    if (existing)
        throw ApiError_1.ApiError.conflict('This teacher is already assigned to this subject/section for this academic year');
    const assignment = await TeacherAssignment_model_1.TeacherAssignment.create(req.body);
    const populated = await assignment.populate([
        { path: 'teacher', select: 'teacherId firstName lastName' },
        { path: 'subject', select: 'name code' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' },
    ]);
    ApiResponse_1.ApiResponse.created(res, populated);
});
exports.getAssignments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { academicYear, teacher } = req.query;
    const query = {};
    if (academicYear)
        query.academicYear = academicYear;
    if (teacher)
        query.teacher = teacher;
    const assignments = await TeacherAssignment_model_1.TeacherAssignment.find(query)
        .populate('teacher', 'teacherId firstName lastName')
        .populate('subject', 'name code')
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('academicYear', 'year');
    ApiResponse_1.ApiResponse.success(res, assignments);
});
// --- Timetable ---
exports.getTimetable = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { academicYear, term, section } = req.query;
    const query = {};
    if (academicYear)
        query.academicYear = academicYear;
    if (term)
        query.term = term;
    if (section)
        query.section = section;
    const entries = await Timetable_model_1.Timetable.find(query)
        .populate('teacher', 'firstName lastName')
        .populate('subject', 'name')
        .populate('class', 'name')
        .populate('section', 'name')
        .sort({ dayOfWeek: 1, startTime: 1 });
    ApiResponse_1.ApiResponse.success(res, entries);
});
exports.createTimetableEntry = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { teacher, section, dayOfWeek, startTime, endTime, academicYear, term } = req.body;
    // Conflict: same teacher same slot
    const teacherConflict = await Timetable_model_1.Timetable.findOne({ teacher, dayOfWeek, startTime, academicYear, term });
    if (teacherConflict)
        throw ApiError_1.ApiError.conflict('Teacher already has a class at this time slot');
    // Conflict: same section same slot
    const sectionConflict = await Timetable_model_1.Timetable.findOne({ section, dayOfWeek, startTime, academicYear, term });
    if (sectionConflict)
        throw ApiError_1.ApiError.conflict('This section already has a class at this time slot');
    const entry = await Timetable_model_1.Timetable.create(req.body);
    ApiResponse_1.ApiResponse.created(res, entry);
});
exports.updateTimetableEntry = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const entry = await Timetable_model_1.Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entry)
        throw ApiError_1.ApiError.notFound('Timetable entry not found');
    ApiResponse_1.ApiResponse.success(res, entry);
});
exports.deleteTimetableEntry = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const entry = await Timetable_model_1.Timetable.findByIdAndDelete(req.params.id);
    if (!entry)
        throw ApiError_1.ApiError.notFound('Timetable entry not found');
    ApiResponse_1.ApiResponse.noContent(res);
});
exports.deleteTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacher = await Teacher_model_1.Teacher.findByIdAndDelete(req.params.id);
    if (!teacher)
        throw ApiError_1.ApiError.notFound('Teacher not found');
    // Also delete the associated user account if exists
    if (teacher.user) {
        await (await Promise.resolve().then(() => __importStar(require('../../models/User.model')))).User.findByIdAndDelete(teacher.user);
    }
    ApiResponse_1.ApiResponse.success(res, null, 'Teacher deleted successfully');
});
