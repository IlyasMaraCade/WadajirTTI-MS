"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStudentStatus = exports.updateStudent = exports.createStudent = exports.getStudent = exports.getStudents = void 0;
const Student_model_1 = require("../../models/Student.model");
const Enrollment_model_1 = require("../../models/Enrollment.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { search, status, page = '1', limit = '20' } = req.query;
    const query = {};
    if (search) {
        const re = new RegExp(search, 'i');
        query.$or = [{ firstName: re }, { lastName: re }, { studentId: re }];
    }
    if (status !== undefined)
        query.status = status === 'true';
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [students, total] = await Promise.all([
        Student_model_1.Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Student_model_1.Student.countDocuments(query),
    ]);
    ApiResponse_1.ApiResponse.paginate(res, students, total, pageNum, limitNum);
});
exports.getStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const student = await Student_model_1.Student.findById(req.params.id);
    if (!student)
        throw ApiError_1.ApiError.notFound('Student not found');
    const enrollments = await Enrollment_model_1.Enrollment.find({ student: student._id })
        .populate('academicYear', 'year')
        .populate('class', 'name')
        .populate('section', 'name')
        .sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, { student, enrollments });
});
exports.createStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const existing = await Student_model_1.Student.findOne({ studentId: req.body.studentId });
    if (existing)
        throw ApiError_1.ApiError.conflict('Student ID already exists');
    const student = await Student_model_1.Student.create(req.body);
    ApiResponse_1.ApiResponse.created(res, student);
});
exports.updateStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const student = await Student_model_1.Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student)
        throw ApiError_1.ApiError.notFound('Student not found');
    ApiResponse_1.ApiResponse.success(res, student);
});
exports.toggleStudentStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const student = await Student_model_1.Student.findById(req.params.id);
    if (!student)
        throw ApiError_1.ApiError.notFound('Student not found');
    student.status = !student.status;
    await student.save();
    ApiResponse_1.ApiResponse.success(res, student, `Student ${student.status ? 'activated' : 'deactivated'}`);
});
