import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { requireTeacherProfile } from '../../middleware/requireTeacher';
import * as teacherPortalController from './teacherPortal.controller';

const router = Router();

// Apply auth, role, and teacher profile middlewares to all routes
router.use(authenticate);
router.use(authorize('TEACHER'));
router.use(requireTeacherProfile);

router.get('/dashboard', teacherPortalController.getDashboard);
router.get('/students', teacherPortalController.getMyStudents);

router.post('/attendance', teacherPortalController.markAttendance);
router.get('/attendance', teacherPortalController.getAttendance);

router.post('/exams', teacherPortalController.createExam);
router.get('/exams', teacherPortalController.getExams);
router.post('/marks', teacherPortalController.enterMarks);

router.post('/assignments', teacherPortalController.createAssignment);
router.get('/assignments', teacherPortalController.getAssignments);

export default router;
