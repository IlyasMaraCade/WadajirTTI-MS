import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import { generateTokens } from '../../utils/generateToken';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.toLowerCase() }).select('+password +isActive');
  
  if (!user || !(await user.comparePassword(password))) {
    // Avoid revealing if username exists or not
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Record audit log
  const { AuditLog } = await import('../../models/AuditLog.model');
  await AuditLog.create({
    user: user.id,
    action: 'LOGIN',
    details: 'User logged in successfully',
    ipAddress: req.ip,
  });

  const accessToken = generateTokens(
    {
      userId: user.id,
      role: user.role,
      username: user.username,
    },
    res
  );

  ApiResponse.success(res, {
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
    },
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  ApiResponse.success(res, null, 'Logged out successfully');
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  ApiResponse.success(res, {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    role: user.role,
  });
});


