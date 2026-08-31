"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeMyPassword = exports.updateProfile = exports.getMe = exports.logout = exports.login = void 0;
const User_model_1 = require("../../models/User.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const generateToken_1 = require("../../utils/generateToken");
exports.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { username, password } = req.body;
    const user = await User_model_1.User.findOne({ username: username.toLowerCase() }).select('+password +isActive');
    if (!user || !(await user.comparePassword(password))) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    if (!user.isActive) {
        throw ApiError_1.ApiError.forbidden('Account is deactivated');
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    // Record audit log
    const { AuditLog } = await Promise.resolve().then(() => __importStar(require('../../models/AuditLog.model')));
    await AuditLog.create({
        user: user.id,
        action: 'LOGIN',
        details: 'User logged in successfully',
        ipAddress: req.ip,
    });
    const accessToken = (0, generateToken_1.generateTokens)({
        userId: user.id,
        role: user.role,
        username: user.username,
    }, res);
    ApiResponse_1.ApiResponse.success(res, {
        accessToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role,
        },
    });
});
exports.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    ApiResponse_1.ApiResponse.success(res, null, 'Logged out successfully');
});
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await User_model_1.User.findById(req.user?.userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    ApiResponse_1.ApiResponse.success(res, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
    });
});
exports.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { firstName, lastName, email, phone, avatarUrl } = req.body;
    const user = await User_model_1.User.findById(req.user?.userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (firstName)
        user.firstName = firstName.trim();
    if (lastName)
        user.lastName = lastName.trim();
    if (email !== undefined)
        user.email = email ? email.trim().toLowerCase() : undefined;
    if (phone !== undefined)
        user.phone = phone ? phone.trim() : undefined;
    if (avatarUrl !== undefined)
        user.avatarUrl = avatarUrl ? avatarUrl.trim() : undefined;
    await user.save();
    ApiResponse_1.ApiResponse.success(res, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
    }, 'Profile updated successfully');
});
exports.changeMyPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        throw ApiError_1.ApiError.badRequest('New password must be at least 6 characters');
    }
    const user = await User_model_1.User.findById(req.user?.userId).select('+password');
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (currentPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw ApiError_1.ApiError.badRequest('Current password does not match');
        }
    }
    user.password = newPassword;
    await user.save();
    ApiResponse_1.ApiResponse.success(res, null, 'Password changed successfully');
});
