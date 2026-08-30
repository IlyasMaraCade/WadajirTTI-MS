import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../config/constants';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role ${req.user.role} is not authorized to access this route`));
    }
    
    next();
  };
};
