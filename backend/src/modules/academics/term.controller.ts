import { Request, Response } from 'express';
import { Term } from '../../models/Term.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getTerms = catchAsync(async (req: Request, res: Response) => {
  const records = await Term.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getTerm = catchAsync(async (req: Request, res: Response) => {
  const record = await Term.findById(req.params.id);
  if (!record) throw ApiError.notFound('Term not found');
  ApiResponse.success(res, record);
});

export const createTerm = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Term.updateMany({}, { isActive: false });
  }
  const record = await Term.create(req.body);
  ApiResponse.created(res, record);
});

export const updateTerm = catchAsync(async (req: Request, res: Response) => {
  if (false) {
    await Term.updateMany({}, { isActive: false });
  }
  const record = await Term.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('Term not found');
  ApiResponse.success(res, record);
});

export const deleteTerm = catchAsync(async (req: Request, res: Response) => {
  const record = await Term.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('Term not found');
  ApiResponse.success(res, record, 'Term deactivated');
});
