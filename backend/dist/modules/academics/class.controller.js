"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.updateClass = exports.createClass = exports.getClass = exports.getClasss = void 0;
const Class_model_1 = require("../../models/Class.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getClasss = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await Class_model_1.Class.find().sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getClass = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Class_model_1.Class.findById(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('Class not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createClass = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Class_model_1.Class.updateMany({}, { isActive: false });
    }
    const record = await Class_model_1.Class.create(req.body);
    ApiResponse_1.ApiResponse.created(res, record);
});
exports.updateClass = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Class_model_1.Class.updateMany({}, { isActive: false });
    }
    const record = await Class_model_1.Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Class not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteClass = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Class_model_1.Class.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Class not found');
    ApiResponse_1.ApiResponse.success(res, record, 'Class deactivated');
});
