"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacherProfile = void 0;
const Teacher_model_1 = require("../models/Teacher.model");
const ApiError_1 = require("../utils/ApiError");
const catchAsync_1 = require("../utils/catchAsync");
exports.requireTeacherProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user || req.user.role !== 'TEACHER') {
        throw new ApiError_1.ApiError(403, 'Access denied. Teachers only.');
    }
    // Find the teacher profile associated with this user
    const teacher = await Teacher_model_1.Teacher.findOne({ user: req.user.userId });
    if (!teacher) {
        throw new ApiError_1.ApiError(403, 'Teacher profile not found for this account.');
    }
    // Attach teacher ID to request for downstream controllers
    req.teacherId = teacher._id.toString();
    next();
});
