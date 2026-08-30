"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = require("./class.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN));
router.get('/', class_controller_1.getClasss);
router.get('/:id', class_controller_1.getClass);
router.post('/', class_controller_1.createClass);
router.put('/:id', class_controller_1.updateClass);
router.patch('/:id/deactivate', class_controller_1.deleteClass); // Soft delete
exports.default = router;
