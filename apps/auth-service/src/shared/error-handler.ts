import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@packages/shared-utils/src/errors/http-exception';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      status: false,
      statusCode: res.statusCode,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: false,
    statusCode: res.statusCode,
    message: err.message || 'Internal server error',
    errors: err.stack,
  });
};
