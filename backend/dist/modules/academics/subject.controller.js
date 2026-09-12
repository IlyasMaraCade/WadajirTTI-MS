"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllSubjects = exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getSubject = exports.getSubjects = void 0;
const Subject_model_1 = require("../../models/Subject.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getSubjects = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await Subject_model_1.Subject.find().populate('teacher', 'fullName _id').sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Subject_model_1.Subject.findById(req.params.id).populate('teacher', 'fullName _id');
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const existing = await Subject_model_1.Subject.findOne({ name: req.body.name });
    if (existing)
        throw ApiError_1.ApiError.conflict('A subject with this name already exists');
    const record = await Subject_model_1.Subject.create(req.body);
    const populated = await record.populate('teacher', 'fullName _id');
    ApiResponse_1.ApiResponse.created(res, populated);
});
exports.updateSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Subject_model_1.Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('teacher', 'fullName _id');
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Subject_model_1.Subject.findByIdAndDelete(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, null, 'Subject deleted successfully');
});
exports.clearAllSubjects = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    await Subject_model_1.Subject.deleteMany({});
    ApiResponse_1.ApiResponse.success(res, null, 'All subjects cleared');
});
