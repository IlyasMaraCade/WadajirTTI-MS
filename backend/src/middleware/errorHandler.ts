import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    stack: err.stack,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Known operational errors
  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' &&
      (err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Unknown errors — never expose details in production
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};