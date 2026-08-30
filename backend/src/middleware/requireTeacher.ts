import { Request, Response, NextFunction } from 'express';
import { Teacher } from '../models/Teacher.model';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      teacherId?: string;
    }
  }
}

export const requireTeacherProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    throw new ApiError(403, 'Access denied. Teachers only.');
  }

  // Find the teacher profile associated with this user
  const teacher = await Teacher.findOne({ user: req.user.userId });
  
  if (!teacher) {
    throw new ApiError(403, 'Teacher profile not found for this account.');
  }

  // Attach teacher ID to request for downstream controllers
  req.teacherId = teacher._id.toString();
  next();
});
