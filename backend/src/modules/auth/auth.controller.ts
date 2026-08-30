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
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated');
  }

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
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
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
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, avatarUrl } = req.body;
  const user = await User.findById(req.user?.userId);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (firstName) user.firstName = firstName.trim();
  if (lastName) user.lastName = lastName.trim();
  if (email !== undefined) user.email = email ? email.trim().toLowerCase() : undefined;
  if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl ? avatarUrl.trim() : undefined;

  await user.save();

  ApiResponse.success(res, {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
  }, 'Profile updated successfully');
});

export const changeMyPassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user?.userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (currentPassword) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password does not match');
    }
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'Password changed successfully');
});
