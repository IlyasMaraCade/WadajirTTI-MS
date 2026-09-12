import { Request, Response } from 'express';
import { Subject } from '../../models/Subject.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const records = await Subject.find().populate('teacher', 'fullName _id').sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const getSubject = catchAsync(async (req: Request, res: Response) => {
  const record = await Subject.findById(req.params.id).populate('teacher', 'fullName _id');
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, record);
});

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const existing = await Subject.findOne({ name: req.body.name });
  if (existing) throw ApiError.conflict('A subject with this name already exists');
  const record = await Subject.create(req.body);
  const populated = await record.populate('teacher', 'fullName _id');
  ApiResponse.created(res, populated);
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const record = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('teacher', 'fullName _id');
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, record);
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const record = await Subject.findByIdAndDelete(req.params.id);
  if (!record) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, null, 'Subject deleted successfully');
});

export const clearAllSubjects = catchAsync(async (_req: Request, res: Response) => {
  await Subject.deleteMany({});
  ApiResponse.success(res, null, 'All subjects cleared');
});