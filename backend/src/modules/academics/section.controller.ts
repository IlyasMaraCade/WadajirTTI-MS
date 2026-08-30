import { Request, Response } from 'express';
import { Section } from '../../models/Section.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getSections = catchAsync(async (req: Request, res: Response) => {
  const records = await Section.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getSection = catchAsync(async (req: Request, res: Response) => {
  const record = await Section.findById(req.params.id);
  if (!record) throw ApiError.notFound('Section not found');
  ApiResponse.success(res, record);
});

export const createSection = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Section.updateMany({}, { isActive: false });
  }
  const record = await Section.create(req.body);
  ApiResponse.created(res, record);
});

export const updateSection = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Section.updateMany({}, { isActive: false });
  }
  const record = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('Section not found');
  ApiResponse.success(res, record);
});

export const deleteSection = catchAsync(async (req: Request, res: Response) => {
  const record = await Section.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('Section not found');
  ApiResponse.success(res, record, 'Section deactivated');
});
