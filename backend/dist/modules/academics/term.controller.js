"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTerm = exports.updateTerm = exports.createTerm = exports.getTerm = exports.getTerms = void 0;
const Term_model_1 = require("../../models/Term.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getTerms = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const records = await Term_model_1.Term.find().sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, records);
});
exports.getTerm = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Term_model_1.Term.findById(req.params.id);
    if (!record)
        throw ApiError_1.ApiError.notFound('Term not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.createTerm = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Term_model_1.Term.updateMany({}, { isActive: false });
    }
    const record = await Term_model_1.Term.create(req.body);
    ApiResponse_1.ApiResponse.created(res, record);
});
exports.updateTerm = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (false) {
        await Term_model_1.Term.updateMany({}, { isActive: false });
    }
    const record = await Term_model_1.Term.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Term not found');
    ApiResponse_1.ApiResponse.success(res, record);
});
exports.deleteTerm = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const record = await Term_model_1.Term.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!record)
        throw ApiError_1.ApiError.notFound('Term not found');
    ApiResponse_1.ApiResponse.success(res, record, 'Term deactivated');
});
