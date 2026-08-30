"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    logger_1.logger.error(`${req.method} ${req.path} — ${err.message}`, {
        stack: err.stack,
    });
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }
    // Known operational errors
    if (err instanceof ApiError_1.ApiError && err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
        return;
    }
    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' &&
        err.code === 11000) {
        res.status(409).json({
            success: false,
            message: 'A record with this value already exists',
        });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        });
        return;
    }
    // Unknown errors — never expose details in production
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
