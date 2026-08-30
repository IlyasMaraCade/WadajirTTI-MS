"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// Super Admin and Principal access to academic reports and views
router.get('/dashboard-stats', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN), admin_controller_1.getDashboardStats);
router.get('/attendance', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), admin_controller_1.getAllAttendance);
router.get('/marks', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), admin_controller_1.getAllMarks);
router.get('/performance-report', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), admin_controller_1.getPerformanceReport);
exports.default = router;
