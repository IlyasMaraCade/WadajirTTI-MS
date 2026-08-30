import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';
import bcrypt from 'bcryptjs';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  ApiResponse.success(res, users);
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user);
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw ApiError.conflict('Username is already taken');

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw ApiError.conflict('Email is already in use');
  }

  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    role,
    isActive: true,
  });

  const userResponse = user.toObject();
  delete (userResponse as any).password;
  ApiResponse.created(res, userResponse);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { password, ...updateData } = req.body;
  
  // If updating password as well
  if (password && password.trim().length >= 6) {
    const salt = await bcrypt.genSalt(10);
    (updateData as any).password = await bcrypt.hash(password, salt);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user);
});

export const changeUserPassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'Password updated successfully');
});

export const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = !user.isActive;
  await user.save();
  ApiResponse.success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, null, 'User deleted permanently');
});