import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deactivateUser } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';
import { createUserSchema, updateUserSchema } from '../../validators/user.schema';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.patch('/:id/deactivate', deactivateUser);

export default router;