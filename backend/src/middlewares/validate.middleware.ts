import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

export interface ValidationTargets {
  body?:   ZodTypeAny;
  query?:  ZodTypeAny;
  params?: ZodTypeAny;
}

function toFieldErrors(error: ZodError) {
  return error.issues.map(issue => ({
    field:   issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/**
 * Parses whichever request parts a route declares and stashes the coerced
 * result on `req.validated`. Raw `req.query` is left untouched because Express
 * defines it as a prototype getter.
 */
export function validate(targets: ValidationTargets): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    req.validated = req.validated ?? { body: undefined, query: undefined, params: undefined };

    try {
      if (targets.body)   req.validated.body   = targets.body.parse(req.body);
      if (targets.query)  req.validated.query  = targets.query.parse(req.query);
      if (targets.params) req.validated.params = targets.params.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors:  toFieldErrors(error),
        });
        return;
      }
      next(error);
    }
  };
}
