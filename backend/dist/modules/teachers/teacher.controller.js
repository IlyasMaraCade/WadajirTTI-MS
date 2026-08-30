"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimetableEntry = exports.updateTimetableEntry = exports.createTimetableEntry = exports.getTimetable = exports.getAssignments = exports.createAssignment = exports.updateTeacher = exports.createTeacher = exports.getTeacher = exports.getTeachers = void 0;
const Teacher_model_1 = require("../../models/Teacher.model");
const TeacherAssignment_model_1 = require("../../models/TeacherAssignment.model");
const Timetable_model_1 = require("../../models/Timetable.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
// --- Teachers ---
exports.getTeachers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { search, status, page = '1', limit = '20' } = req.query;
    const query = {};
    if (search) {
        const re = new RegExp(search, 'i');
        query.$or = [{ firstName: re }, { lastName: re }, { teacherId: re }, { specialization: re }];
    }
    if (status)
        query.employmentStatus = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [teachers, total] = await Promise.all([
        Teacher_model_1.Teacher.find(query).populate('user', 'email role').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
        Teacher_model_1.Teacher.countDocuments(query),
    ]);
    ApiResponse_1.ApiResponse.paginate(res, teachers, total, pageNum, limitNum);
});
exports.getTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacher = await Teacher_model_1.Teacher.findById(req.params.id).populate('user', 'email role isActive');
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
    const existing = await Teacher_model_1.Teacher.findOne({ teacherId: req.body.teacherId });
    if (existing)
        throw ApiError_1.ApiError.conflict('Teacher ID already exists');
    const teacher = await Teacher_model_1.Teacher.create(req.body);
    ApiResponse_1.ApiResponse.created(res, teacher);
});
exports.updateTeacher = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const teacher = await Teacher_model_1.Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher)
        throw ApiError_1.ApiError.notFound('Teacher not found');
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
