import { Router, Request, Response } from 'express';
import { INSTITUTION } from '../config/constants';
import authRoutes from '../modules/auth/auth.routes';
import adminRoutes from '../modules/admin/admin.routes';
import userRoutes from '../modules/users/user.routes';
import studentRoutes from '../modules/students/student.routes';
import teacherRoutes from '../modules/teachers/teacher.routes';
import academicRoutes from '../modules/academics';
import teacherPortalRoutes from '../modules/portal-teacher/teacherPortal.routes';
import principalPortalRoutes from '../modules/portal-principal/principalPortal.routes';
import financeRoutes from '../modules/finance/finance.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      system: INSTITUTION.LONG_NAME,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    },
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/academics', academicRoutes);
router.use('/teacher', teacherPortalRoutes);
router.use('/principal', principalPortalRoutes);
router.use('/finance', financeRoutes);

export default router;