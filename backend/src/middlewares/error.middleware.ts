import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../lib/appError';

export const notFoundHandler: RequestHandler = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

interface NormalizedError {
  status:  number;
  message: string;
  errors?: unknown;
}

function normalize(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return { status: error.statusCode, message: error.message, errors: error.details };
  }

  if (error instanceof ZodError) {
    return {
      status:  400,
      message: 'Validation error',
      errors:  error.issues.map(i => ({ field: i.path.join('.') || '(root)', message: i.message })),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return { status: 404, message: 'Record not found' };
    if (error.code === 'P2002') return { status: 409, message: 'A record with that value already exists' };
    return { status: 400, message: 'Database request failed' };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { status: 400, message: 'Invalid query for this model' };
  }

  return {
    status:  500,
    message: error instanceof Error ? error.message : 'Internal server error',
  };
}

/**
 * Single place where an error becomes an HTTP response. Every layer below just
 * throws — AppError for expected failures, anything else for genuine bugs.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const { status, message, errors } = normalize(error);

  if (status >= 500) {
    console.error('[error]', error);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined }),
  });
};
