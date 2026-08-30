import { Router } from 'express';
import { login, logout, getMe } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter } from '../../middleware/rateLimiter';
import { loginSchema } from '../../validators/auth.schema';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
