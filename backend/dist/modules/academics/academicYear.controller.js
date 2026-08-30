"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAcademicYear = exports.updateAcademicYear = exports.createAcademicYear = exports.getAcademicYear = exports.getAcademicYears = void 0;
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getAcademicYears = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await AcademicYear_model_1.AcademicYear.find().sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getAcademicYear = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await AcademicYear_model_1.AcademicYear.findById(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('AcademicYear not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createAcademicYear = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if ('isActive' in req.body && req.body.isActive && 'AcademicYear' === 'AcademicYear') {
        await AcademicYear_model_1.AcademicYear.updateMany({}, { isActive: false });
    }
    const record = await AcademicYear_model_1.AcademicYear.create(req.body);
    ApiResponse_1.ApiResponse.created(res, record);
});
exports.updateAcademicYear = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if ('isActive' in req.body && req.body.isActive && 'AcademicYear' === 'AcademicYear') {
        await AcademicYear_model_1.AcademicYear.updateMany({}, { isActive: false });
    }
    const record = await AcademicYear_model_1.AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('AcademicYear not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteAcademicYear = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await AcademicYear_model_1.AcademicYear.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('AcademicYear not found');
    ApiResponse_1.ApiResponse.success(res, record, 'AcademicYear deactivated');
});
