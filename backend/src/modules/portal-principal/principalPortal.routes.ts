import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as principalPortalController from './principalPortal.controller';
import { USER_ROLES } from '../../config/constants';

const router = Router();

// Apply auth and role middlewares
router.use(authenticate);
router.use(authorize(USER_ROLES.PRINCIPAL, USER_ROLES.SUPER_ADMIN, USER_ROLES.REGISTRATION));

router.get('/dashboard', principalPortalController.getDashboard);
router.get('/attendance-monitoring', principalPortalController.getAttendanceMonitoring);
router.get('/academic-performance', principalPortalController.getAcademicPerformance);
router.get('/exams', principalPortalController.getAllExams);
router.post('/exams', principalPortalController.createExam);
router.post('/exams/marks', principalPortalController.enterMarks);
router.delete('/exams/:id', principalPortalController.deleteExam);
router.post('/attendance/mark', principalPortalController.markAttendanceByReg);
router.get('/attendance/by-date', principalPortalController.getAttendanceByDate);

export default router;
