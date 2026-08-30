"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const catchAsync_1 = require("../utils/catchAsync");
const User_model_1 = require("../models/User.model");
exports.authenticate = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        throw ApiError_1.ApiError.unauthorized('Not authorized, no token provided');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.ACCESS_TOKEN_SECRET);
        // Check if user still exists and is active
        const user = await User_model_1.User.findById(decoded.userId).select('+isActive');
        if (!user) {
            throw ApiError_1.ApiError.unauthorized('User no longer exists');
        }
        if (!user.isActive) {
            throw ApiError_1.ApiError.forbidden('User account is deactivated');
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        throw ApiError_1.ApiError.unauthorized('Not authorized, token failed');
    }
});
