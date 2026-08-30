"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnrollment = exports.getEnrollments = exports.createEnrollment = void 0;
const Enrollment_model_1 = require("../../models/Enrollment.model");
const Student_model_1 = require("../../models/Student.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.createEnrollment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { student, academicYear } = req.body;
    const existing = await Enrollment_model_1.Enrollment.findOne({ student, academicYear });
    if (existing)
        throw ApiError_1.ApiError.conflict('Student is already enrolled in this academic year');
    const enrollment = await Enrollment_model_1.Enrollment.create(req.body);
    // Update student enrollmentStatus
    await Student_model_1.Student.findByIdAndUpdate(student, { enrollmentStatus: 'Active' });
    const populated = await enrollment.populate([
        { path: 'student', select: 'studentId firstName lastName' },
        { path: 'academicYear', select: 'year' },
        { path: 'class', select: 'name' },
        { path: 'section', select: 'name' },
    ]);
    ApiResponse_1.ApiResponse.created(res, populated);
});
exports.getEnrollments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { academicYear, class: classId, section, status } = req.query;
    const query = {};
    if (academicYear)
        query.academicYear = academicYear;
    if (classId)
        query.class = classId;
    if (section)
        query.section = section;
    if (status)
        query.status = status;
    const enrollments = await Enrollment_model_1.Enrollment.find(query)
        .populate('student', 'studentId firstName lastName')
        .populate('academicYear', 'year')
        .populate('class', 'name')
        .populate('section', 'name')
        .sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, enrollments);
});
exports.updateEnrollment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const enrollment = await Enrollment_model_1.Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!enrollment)
        throw ApiError_1.ApiError.notFound('Enrollment not found');
    ApiResponse_1.ApiResponse.success(res, enrollment);
});
