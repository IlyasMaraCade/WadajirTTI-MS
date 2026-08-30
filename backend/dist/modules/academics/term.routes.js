"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const term_controller_1 = require("./term.controller");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)(constants_1.USER_ROLES.SUPER_ADMIN));
router.get('/', term_controller_1.getTerms);
router.get('/:id', term_controller_1.getTerm);
router.post('/', term_controller_1.createTerm);
router.put('/:id', term_controller_1.updateTerm);
router.patch('/:id/deactivate', term_controller_1.deleteTerm); // Soft delete
exports.default = router;
