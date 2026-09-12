"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const enrollment_controller_1 = require("./enrollment.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// Students (Super Admin and Principal can view/create/edit; Registration can register new students)
router.get('/', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL, constants_1.USER_ROLES.FINANCE, constants_1.USER_ROLES.REGISTRATION), student_controller_1.getStudents);
router.get('/:id', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL, constants_1.USER_ROLES.FINANCE, constants_1.USER_ROLES.REGISTRATION), student_controller_1.getStudent);
router.post('/', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL, constants_1.USER_ROLES.REGISTRATION), student_controller_1.createStudent);
router.put('/:id', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), student_controller_1.updateStudent);
router.patch('/:id/toggle-status', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), student_controller_1.toggleStudentStatus);
router.delete('/:id', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), student_controller_1.deleteStudent);
// Enrollments
router.get('/enrollments/all', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), enrollment_controller_1.getEnrollments);
router.post('/enrollments', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), enrollment_controller_1.createEnrollment);
router.put('/enrollments/:id', (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL), enrollment_controller_1.updateEnrollment);
exports.default = router;
