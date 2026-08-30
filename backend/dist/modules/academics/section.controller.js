"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.createSection = exports.getSection = exports.getSections = void 0;
const Section_model_1 = require("../../models/Section.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getSections = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await Section_model_1.Section.find().sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getSection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Section_model_1.Section.findById(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('Section not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createSection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Section_model_1.Section.updateMany({}, { isActive: false });
    }
    const record = await Section_model_1.Section.create(req.body);
    ApiResponse_1.ApiResponse.created(res, record);
});
exports.updateSection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Section_model_1.Section.updateMany({}, { isActive: false });
    }
    const record = await Section_model_1.Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Section not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteSection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Section_model_1.Section.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Section not found');
    ApiResponse_1.ApiResponse.success(res, record, 'Section deactivated');
});
