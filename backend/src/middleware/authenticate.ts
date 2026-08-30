import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { User } from '../models/User.model';
import { TokenPayload } from '../utils/generateToken';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }
  
  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    
    if (!user.isActive) {
      throw ApiError.forbidden('User account is deactivated');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    throw ApiError.unauthorized('Not authorized, token failed');
  }
});
