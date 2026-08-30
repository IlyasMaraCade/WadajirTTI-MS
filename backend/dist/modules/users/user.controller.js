"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.changeUserPassword = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_model_1 = require("../../models/User.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
    const { username, email, password, firstName, lastName, role } = req.body;
    const existingUsername = await User_model_1.User.findOne({ username });
    if (existingUsername)
        throw ApiError_1.ApiError.conflict('Username is already taken');
    if (email) {
        const existingEmail = await User_model_1.User.findOne({ email });
        if (existingEmail)
            throw ApiError_1.ApiError.conflict('Email is already in use');
    }
    const user = await User_model_1.User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        isActive: true,
    });
    const userResponse = user.toObject();
    delete userResponse.password;
    ApiResponse_1.ApiResponse.created(res, userResponse);
});
exports.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { password, ...updateData } = req.body;
    // If updating password as well
    if (password && password.trim().length >= 6) {
        const salt = await bcryptjs_1.default.genSalt(10);
        updateData.password = await bcryptjs_1.default.hash(password, salt);
    }
    const user = await User_model_1.User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    ApiResponse_1.ApiResponse.success(res, user);
});
exports.changeUserPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        throw ApiError_1.ApiError.badRequest('New password must be at least 6 characters');
    }
    const user = await User_model_1.User.findById(req.params.id).select('+password');
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    user.password = newPassword;
    await user.save();
    ApiResponse_1.ApiResponse.success(res, null, 'Password updated successfully');
});
exports.toggleUserStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findById(req.params.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    user.isActive = !user.isActive;
    await user.save();
    ApiResponse_1.ApiResponse.success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findByIdAndDelete(req.params.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    ApiResponse_1.ApiResponse.success(res, null, 'User deleted permanently');
});
