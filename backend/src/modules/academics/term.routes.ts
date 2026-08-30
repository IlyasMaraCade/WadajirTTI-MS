import { Router } from 'express';
import { getTerms, getTerm, createTerm, updateTerm, deleteTerm } from './term.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getTerms);
router.get('/:id', getTerm);
router.post('/', createTerm);
router.put('/:id', updateTerm);
router.patch('/:id/deactivate', deleteTerm); // Soft delete

export default router;
