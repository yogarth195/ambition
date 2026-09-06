import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 does not catch rejected promises from async handlers, so every
 * async handler is wrapped in this to route failures into the error middleware
 * instead of hanging the request.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
