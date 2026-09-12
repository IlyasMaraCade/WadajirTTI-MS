"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION = exports.HTTP_STATUS = exports.USER_ROLES = exports.INSTITUTION = void 0;
exports.INSTITUTION = {
    LONG_NAME: 'Wadajir Technical and Training Institute',
    SHORT_NAME: 'Wadajir Institute',
};
exports.USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    FINANCE: 'FINANCE',
    TEACHER: 'TEACHER',
    PRINCIPAL: 'PRINCIPAL',
    REGISTRATION: 'REGISTRATION',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
