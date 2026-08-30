import { Router } from 'express';
import { getClasss, getClass, createClass, updateClass, deleteClass } from './class.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL));

router.get('/', getClasss);
router.get('/:id', getClass);
router.post('/', createClass);
router.put('/:id', updateClass);
router.patch('/:id/deactivate', deleteClass);

export default router;
