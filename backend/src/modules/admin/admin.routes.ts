import { Router } from 'express';
import { getDashboardStats } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/dashboard-stats', getDashboardStats);

export default router;