import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, toggleStudentStatus } from './student.controller';
import { createEnrollment, getEnrollments, updateEnrollment } from './enrollment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

// Students
router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.patch('/:id/toggle-status', toggleStudentStatus);

// Enrollments (nested or separate)
router.get('/enrollments/all', getEnrollments);
router.post('/enrollments', createEnrollment);
router.put('/enrollments/:id', updateEnrollment);

export default router;
