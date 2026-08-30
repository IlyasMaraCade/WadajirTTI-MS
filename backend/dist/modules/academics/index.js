"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academicYear_routes_1 = __importDefault(require("./academicYear.routes"));
const term_routes_1 = __importDefault(require("./term.routes"));
const class_routes_1 = __importDefault(require("./class.routes"));
const section_routes_1 = __importDefault(require("./section.routes"));
const subject_routes_1 = __importDefault(require("./subject.routes"));
const router = (0, express_1.Router)();
router.use('/academicYears', academicYear_routes_1.default);
router.use('/terms', term_routes_1.default);
router.use('/classs', class_routes_1.default);
router.use('/sections', section_routes_1.default);
router.use('/subjects', subject_routes_1.default);
exports.default = router;
