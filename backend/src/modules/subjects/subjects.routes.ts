import { Request, Response } from 'express';
import { Subject } from '../../models/Subject.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { authenticate } from '../../middleware/authenticate';
import { Router } from 'express';

export const getSubjects = catchAsync(async (_req: Request, res: Response) => {
  const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
  ApiResponse.success(res, subjects);
});

export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest('Subject name is required');
  const subject = await Subject.findOneAndUpdate(
    { name: name.trim() },
    { setOnInsert: { name: name.trim(), isActive: true } },
    { upsert: true, new: true }
  );
  ApiResponse.created(res, subject);
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) throw ApiError.notFound('Subject not found');
  ApiResponse.success(res, null, 'Subject deleted');
});

const router = Router();
// Public route for fetching subjects (e.g. for landing page)
router.get('/', getSubjects);

// Protected routes
router.use(authenticate);
router.post('/', createSubject);
router.delete('/:id', deleteSubject);

export default router;
