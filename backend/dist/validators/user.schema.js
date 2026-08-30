"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        role: zod_1.z.enum(['SUPER_ADMIN', 'FINANCE', 'TEACHER', 'PRINCIPAL'], { message: 'Invalid role' }),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['SUPER_ADMIN', 'FINANCE', 'TEACHER', 'PRINCIPAL']).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
