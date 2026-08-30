import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as principalPortalController from './principalPortal.controller';

const router = Router();

// Apply auth and role middlewares
router.use(authenticate);
router.use(authorize('PRINCIPAL'));

router.get('/dashboard', principalPortalController.getDashboard);
router.get('/attendance-monitoring', principalPortalController.getAttendanceMonitoring);
router.get('/academic-performance', principalPortalController.getAcademicPerformance);

export default router;
