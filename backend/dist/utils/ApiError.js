"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, errors, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errors) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }
    static conflict(message) {
        return new ApiError(409, message);
    }
    static internal(message = 'Internal server error') {
        return new ApiError(500, message, undefined, false);
    }
}
exports.ApiError = ApiError;
