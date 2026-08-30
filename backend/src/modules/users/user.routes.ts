import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changeUserPassword,
  toggleUserStatus,
  deleteUser,
} from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/change-password', changeUserPassword);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;