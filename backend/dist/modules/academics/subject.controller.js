"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getSubject = exports.getSubjects = void 0;
const Subject_model_1 = require("../../models/Subject.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getSubjects = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await Subject_model_1.Subject.find().sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Subject_model_1.Subject.findById(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Subject_model_1.Subject.updateMany({}, { isActive: false });
    }
    const record = await Subject_model_1.Subject.create(req.body);
    ApiResponse_1.ApiResponse.created(res, record);
});
exports.updateSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Subject_model_1.Subject.updateMany({}, { isActive: false });
    }
    const record = await Subject_model_1.Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteSubject = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Subject_model_1.Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Subject not found');
    ApiResponse_1.ApiResponse.success(res, record, 'Subject deactivated');
});
