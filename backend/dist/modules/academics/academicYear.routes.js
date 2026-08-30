"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academicYear_controller_1 = require("./academicYear.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN));
router.get('/', academicYear_controller_1.getAcademicYears);
router.get('/:id', academicYear_controller_1.getAcademicYear);
router.post('/', academicYear_controller_1.createAcademicYear);
router.put('/:id', academicYear_controller_1.updateAcademicYear);
router.patch('/:id/deactivate', academicYear_controller_1.deleteAcademicYear); // Soft delete
exports.default = router;
