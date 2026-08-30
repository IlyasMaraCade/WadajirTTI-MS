import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync';

export const validate = (schema: z.ZodSchema) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  });
