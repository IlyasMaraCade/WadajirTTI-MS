"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.toggleStudentStatus = exports.updateStudent = exports.createStudent = exports.getStudent = exports.getStudents = void 0;
const Student_model_1 = require("../../models/Student.model");
const Payment_model_1 = require("../../models/Payment.model");
const MonthlyFee_model_1 = require("../../models/MonthlyFee.model");
const Enrollment_model_1 = require("../../models/Enrollment.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getStudents = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { search, status, enrollmentStatus, page = '1', limit = '50' } = req.query;
    const query = {};
    if (search) {
        const re = new RegExp(search, 'i');
        query.$or = [{ fullName: re }, { studentId: re }, { parentName: re }, { phone: re }, { parentPhone: re }];
    }
    if (status !== undefined && status !== '')
        query.status = status === 'true';
    if (enrollmentStatus)
        query.enrollmentStatus = enrollmentStatus;
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
    // Duplicate check by full name (case-insensitive)
    const duplicateName = await Student_model_1.Student.findOne({ fullName: { $regex: new RegExp(`^${req.body.fullName?.trim()}$`, 'i') } });
    if (duplicateName)
        throw ApiError_1.ApiError.conflict(`A student named "${req.body.fullName}" already exists (ID: ${duplicateName.studentId})`);
    let studentId = req.body.studentId;
    if (!studentId) {
        const count = await Student_model_1.Student.countDocuments();
        studentId = `STU-${String(count + 1).padStart(4, '0')}`;
    }
    const existing = await Student_model_1.Student.findOne({ studentId });
    if (existing) {
        studentId = `STU-${Date.now().toString().slice(-6)}`;
    }
    const student = await Student_model_1.Student.create({
        ...req.body,
        studentId,
    });
    // Automatically create Payment records for Registration Fee and First Month Fee
    const userId = req.user?.userId; // Assumes auth middleware sets req.user
    const now = new Date();
    if (student.registrationFee > 0) {
        await Payment_model_1.Payment.create({
            paymentNumber: `PAY-REG-${student.studentId}-${Date.now().toString().slice(-4)}`,
            student: student._id,
            studentName: student.fullName,
            amount: student.registrationFee,
            paymentMethod: 'Cash',
            receivedBy: userId || student._id, // Fallback if no user
            notes: 'Initial Registration Fee'
        });
    }
    if (student.fee > 0) {
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // Create MonthlyFee tracker record
        await MonthlyFee_model_1.MonthlyFee.create({
            student: student._id,
            month: currentMonth,
            year: currentYear,
            amount: student.fee,
            status: 'Paid',
            paymentDate: now,
            recordedBy: userId || student._id,
            notes: 'First Month Tuition'
        });
        // Create Payment transaction record
        await Payment_model_1.Payment.create({
            paymentNumber: `PAY-MTH-${student.studentId}-${Date.now().toString().slice(-4)}`,
            student: student._id,
            studentName: student.fullName,
            amount: student.fee,
            paymentMethod: 'Cash',
            receivedBy: userId || student._id,
            notes: `Monthly Tuition - ${currentMonth}/${currentYear}`
        });
    }
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
exports.deleteStudent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const student = await Student_model_1.Student.findByIdAndDelete(req.params.id);
    if (!student)
        throw ApiError_1.ApiError.notFound('Student not found');
    ApiResponse_1.ApiResponse.success(res, null, 'Student removed successfully');
});
