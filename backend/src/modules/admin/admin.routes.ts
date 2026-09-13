import { Router } from 'express';
import {
  getDashboardStats,
  getAllAttendance,
  getAllMarks,
  getPerformanceReport,
} from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate);

// Super Admin and Principal access to academic reports and views
router.get('/dashboard-stats', authorize(USER_ROLES.SUPER_ADMIN), getDashboardStats);
router.get('/attendance', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), getAllAttendance);
router.get('/marks', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION), getAllMarks);
router.get('/performance-report', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), getPerformanceReport);

export default router;