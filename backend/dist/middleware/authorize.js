"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const ApiError_1 = require("../utils/ApiError");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError_1.ApiError.unauthorized('Not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(ApiError_1.ApiError.forbidden(`Role ${req.user.role} is not authorized to access this route`));
        }
        next();
    };
};
exports.authorize = authorize;
