"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_model_1 = require("../../models/User.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await User_model_1.User.find().select('-password').sort({ createdAt: -1 });
    ApiResponse_1.ApiResponse.success(res, users);
});
exports.getUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findById(req.params.id).select('-password');
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    ApiResponse_1.ApiResponse.success(res, user);
});
exports.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.create(req.body);
    const userResponse = user.toObject();
    delete userResponse.password;
    ApiResponse_1.ApiResponse.created(res, userResponse);
});
exports.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    ApiResponse_1.ApiResponse.success(res, user);
});
exports.deactivateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    ApiResponse_1.ApiResponse.success(res, user, 'User deactivated');
});
