import { Router } from 'express';
import { getAcademicYears, getAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear } from './academicYear.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getAcademicYears);
router.get('/:id', getAcademicYear);
router.post('/', createAcademicYear);
router.put('/:id', updateAcademicYear);
router.patch('/:id/deactivate', deleteAcademicYear); // Soft delete

export default router;
