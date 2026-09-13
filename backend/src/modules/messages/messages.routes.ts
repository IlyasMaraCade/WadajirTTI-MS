import { Router } from 'express';
import { createMessage, getMessages, markAsRead, deleteMessage } from './messages.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Public route for contact form
router.post('/', createMessage);

// Protected routes (for principal)
router.use(authenticate);
router.get('/', getMessages);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;
