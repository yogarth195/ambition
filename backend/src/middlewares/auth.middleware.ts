import { NextFunction, Request, RequestHandler, Response } from 'express';
import { forbidden, unauthorized } from '../lib/appError';
import { verifyToken } from '../lib/jwt';

/**
 * Verifies `Authorization: Bearer <token>` and attaches the decoded payload to
 * `req.user`. Rejects with 401 when the header is missing or the token fails
 * verification.
 */
export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Missing or malformed Authorization header'));
    return;
  }

  try {
    req.user = verifyToken(header.slice('Bearer '.length).trim());
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role gate, applied after requireAuth. Only ADMIN exists today; MANAGER is
 * defined in the Prisma enum and ready to be granted access per-route.
 */
export function authorize(...roles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden('You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
