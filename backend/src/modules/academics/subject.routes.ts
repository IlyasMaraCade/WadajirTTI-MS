import { Router } from 'express';
import { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, clearAllSubjects } from './subject.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL));

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.patch('/:id', updateSubject);
router.patch('/:id/deactivate', deleteSubject);
router.delete('/clear-all', clearAllSubjects);
router.delete('/:id', deleteSubject);

export default router;