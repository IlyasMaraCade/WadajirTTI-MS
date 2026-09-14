"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../../middleware/authenticate");
const authorize_1 = require("../../middleware/authorize");
const principalPortalController = __importStar(require("./principalPortal.controller"));
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
// Apply auth and role middlewares
router.use(authenticate_1.authenticate);
router.use((0, authorize_1.authorize)(constants_1.USER_ROLES.PRINCIPAL, constants_1.USER_ROLES.SUPER_ADMIN, constants_1.USER_ROLES.REGISTRATION));
router.get('/dashboard', principalPortalController.getDashboard);
router.get('/attendance-monitoring', principalPortalController.getAttendanceMonitoring);
router.get('/academic-performance', principalPortalController.getAcademicPerformance);
router.get('/exams', principalPortalController.getAllExams);
router.post('/exams', principalPortalController.createExam);
router.post('/exams/marks', principalPortalController.enterMarks);
router.delete('/exams/:id', principalPortalController.deleteExam);
router.post('/attendance/mark', principalPortalController.markAttendanceByReg);
router.get('/attendance/by-date', principalPortalController.getAttendanceByDate);
exports.default = router;
