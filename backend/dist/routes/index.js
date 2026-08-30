"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constants_1 = require("../config/constants");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const student_routes_1 = __importDefault(require("../modules/students/student.routes"));
const teacher_routes_1 = __importDefault(require("../modules/teachers/teacher.routes"));
const academics_1 = __importDefault(require("../modules/academics"));
const teacherPortal_routes_1 = __importDefault(require("../modules/portal-teacher/teacherPortal.routes"));
const principalPortal_routes_1 = __importDefault(require("../modules/portal-principal/principalPortal.routes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        data: {
            system: constants_1.INSTITUTION.LONG_NAME,
            version: '1.0.0',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(process.uptime())}s`,
        },
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/students', student_routes_1.default);
router.use('/teachers', teacher_routes_1.default);
router.use('/academics', academics_1.default);
router.use('/teacher', teacherPortal_routes_1.default);
router.use('/principal', principalPortal_routes_1.default);
exports.default = router;
