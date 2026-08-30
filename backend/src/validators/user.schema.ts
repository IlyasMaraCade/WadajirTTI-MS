import { z } from 'zod';
import { USER_ROLES } from '../config/constants';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['SUPER_ADMIN', 'FINANCE', 'TEACHER', 'PRINCIPAL'] as const, { message: 'Invalid role' }),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['SUPER_ADMIN', 'FINANCE', 'TEACHER', 'PRINCIPAL'] as const).optional(),
    isActive: z.boolean().optional(),
  }),
});