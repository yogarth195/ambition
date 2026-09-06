/**
 * Errors thrown anywhere in the service or repository layer. The error
 * middleware reads `statusCode` to decide the HTTP response; anything that
 * isn't an AppError is treated as a 500.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest   = (msg: string, details?: unknown) => new AppError(msg, 400, details);
export const unauthorized = (msg = 'Unauthorized')           => new AppError(msg, 401);
export const forbidden    = (msg = 'Forbidden')              => new AppError(msg, 403);
export const notFound     = (msg = 'Not found')              => new AppError(msg, 404);
export const unprocessable = (msg: string)                   => new AppError(msg, 422);
