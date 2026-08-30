import { Request, Response } from 'express';
import { AcademicYear } from '../../models/AcademicYear.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getAcademicYears = catchAsync(async (req: Request, res: Response) => {
  const records = await AcademicYear.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const record = await AcademicYear.findById(req.params.id);
  if (!record) throw ApiError.notFound('AcademicYear not found');
  ApiResponse.success(res, record);
});

export const createAcademicYear = catchAsync(async (req: Request, res: Response) => {
  if ('isActive' in req.body && req.body.isActive && 'AcademicYear' === 'AcademicYear') {
    await AcademicYear.updateMany({}, { isActive: false });
  }
  const record = await AcademicYear.create(req.body);
  ApiResponse.created(res, record);
});

export const updateAcademicYear = catchAsync(async (req: Request, res: Response) => {
  if ('isActive' in req.body && req.body.isActive && 'AcademicYear' === 'AcademicYear') {
    await AcademicYear.updateMany({}, { isActive: false });
  }
  const record = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('AcademicYear not found');
  ApiResponse.success(res, record);
});

export const deleteAcademicYear = catchAsync(async (req: Request, res: Response) => {
  const record = await AcademicYear.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('AcademicYear not found');
  ApiResponse.success(res, record, 'AcademicYear deactivated');
});
