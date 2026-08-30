import { Router } from 'express';
import { getSubjects, getSubject, createSubject, updateSubject, deleteSubject } from './subject.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.patch('/:id/deactivate', deleteSubject); // Soft delete

export default router;
