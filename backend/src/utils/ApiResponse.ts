import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown[]
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static paginate<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success'
  ) {
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return ApiResponse.success(res, data, message, 200, meta);
  }
}
