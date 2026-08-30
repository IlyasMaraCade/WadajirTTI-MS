import { Request, Response } from 'express';
import { Class } from '../../models/Class.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getClasss = catchAsync(async (req: Request, res: Response) => {
  const records = await Class.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getClass = catchAsync(async (req: Request, res: Response) => {
  const record = await Class.findById(req.params.id);
  if (!record) throw ApiError.notFound('Class not found');
  ApiResponse.success(res, record);
});

export const createClass = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Class.updateMany({}, { isActive: false });
  }
  const record = await Class.create(req.body);
  ApiResponse.created(res, record);
});

export const updateClass = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Class.updateMany({}, { isActive: false });
  }
  const record = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('Class not found');
  ApiResponse.success(res, record);
});

export const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const record = await Class.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('Class not found');
  ApiResponse.success(res, record, 'Class deactivated');
});
