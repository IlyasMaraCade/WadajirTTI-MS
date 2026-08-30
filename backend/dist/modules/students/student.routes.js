"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const enrollment_controller_1 = require("./enrollment.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN));
// Students
router.get('/', student_controller_1.getStudents);
router.get('/:id', student_controller_1.getStudent);
router.post('/', student_controller_1.createStudent);
router.put('/:id', student_controller_1.updateStudent);
router.patch('/:id/toggle-status', student_controller_1.toggleStudentStatus);
// Enrollments (nested or separate)
router.get('/enrollments/all', enrollment_controller_1.getEnrollments);
router.post('/enrollments', enrollment_controller_1.createEnrollment);
router.put('/enrollments/:id', enrollment_controller_1.updateEnrollment);
exports.default = router;
