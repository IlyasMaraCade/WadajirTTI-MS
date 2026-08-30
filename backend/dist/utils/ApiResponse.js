"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200, meta) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...(meta && { meta }),
        });
    }
    static created(res, data, message = 'Created successfully') {
        return ApiResponse.success(res, data, message, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static error(res, statusCode, message, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(errors && { errors }),
        });
    }
    static paginate(res, data, total, page, limit, message = 'Success') {
        const totalPages = Math.ceil(total / limit);
        const meta = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
        return ApiResponse.success(res, data, message, 200, meta);
    }
}
exports.ApiResponse = ApiResponse;
