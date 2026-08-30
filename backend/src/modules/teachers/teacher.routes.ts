import { Router } from 'express';
import {
  getTeachers, getTeacher, createTeacher, updateTeacher,
  createAssignment, getAssignments,
  getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
} from './teacher.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();
router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

// Teachers
router.get('/', getTeachers);
router.get('/:id', getTeacher);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);

// Assignments
router.get('/assignments/all', getAssignments);
router.post('/assignments', createAssignment);

// Timetable
router.get('/timetable/all', getTimetable);
router.post('/timetable', createTimetableEntry);
router.put('/timetable/:id', updateTimetableEntry);
router.delete('/timetable/:id', deleteTimetableEntry);

export default router;
