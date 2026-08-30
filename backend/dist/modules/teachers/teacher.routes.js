"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("./teacher.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.PRINCIPAL));
// Teachers
router.get('/', teacher_controller_1.getTeachers);
router.get('/:id', teacher_controller_1.getTeacher);
router.post('/', teacher_controller_1.createTeacher);
router.put('/:id', teacher_controller_1.updateTeacher);
// Assignments
router.get('/assignments/all', teacher_controller_1.getAssignments);
router.post('/assignments', teacher_controller_1.createAssignment);
// Timetable
router.get('/timetable/all', teacher_controller_1.getTimetable);
router.post('/timetable', teacher_controller_1.createTimetableEntry);
router.put('/timetable/:id', teacher_controller_1.updateTimetableEntry);
router.delete('/timetable/:id', teacher_controller_1.deleteTimetableEntry);
exports.default = router;
