import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

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
  const user = await User.create(req.body);
  const userResponse = user.toObject();
  delete (userResponse as any).password;
  ApiResponse.created(res, userResponse);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user);
});

export const deactivateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user, 'User deactivated');
});