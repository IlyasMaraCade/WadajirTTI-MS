"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const section_controller_1 = require("./section.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN));
router.get('/', section_controller_1.getSections);
router.get('/:id', section_controller_1.getSection);
router.post('/', section_controller_1.createSection);
router.put('/:id', section_controller_1.updateSection);
router.patch('/:id/deactivate', section_controller_1.deleteSection); // Soft delete
exports.default = router;
