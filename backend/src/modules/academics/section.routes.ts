import { Router } from 'express';
import { getSections, getSection, createSection, updateSection, deleteSection } from './section.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getSections);
router.get('/:id', getSection);
router.post('/', createSection);
router.put('/:id', updateSection);
router.patch('/:id/deactivate', deleteSection); // Soft delete

export default router;
