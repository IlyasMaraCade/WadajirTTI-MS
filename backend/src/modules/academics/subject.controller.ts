import { Request, Response } from 'express';
import { Subject } from '../../models/Subject.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const records = await Subject.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getSubject = catchAsync(async (req: Request, res: Response) => {
  const record = await Subject.findById(req.params.id);
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, record);
});

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Subject.updateMany({}, { isActive: false });
  }
  const record = await Subject.create(req.body);
  ApiResponse.created(res, record);
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Subject.updateMany({}, { isActive: false });
  }
  const record = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, record);
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const record = await Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, record, 'Subject deactivated');
});
