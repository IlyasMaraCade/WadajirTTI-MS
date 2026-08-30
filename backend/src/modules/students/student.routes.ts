import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, toggleStudentStatus, deleteStudent } from './student.controller';
import { createEnrollment, getEnrollments, updateEnrollment } from './enrollment.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();
router.use(authenticate);

// Students (Super Admin and Principal can view/create/edit)
router.get('/', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.FINANCE), getStudents);
router.get('/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.FINANCE), getStudent);
router.post('/', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), createStudent);
router.put('/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), updateStudent);
router.patch('/:id/toggle-status', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), toggleStudentStatus);
router.delete('/:id', authorize(USER_ROLES.SUPER_ADMIN), deleteStudent);

// Enrollments
router.get('/enrollments/all', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), getEnrollments);
router.post('/enrollments', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), createEnrollment);
router.put('/enrollments/:id', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL), updateEnrollment);

export default router;
