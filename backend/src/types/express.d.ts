import { TokenPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      /** Set by auth.middleware once a Bearer token has been verified. */
      user?: TokenPayload;
      /**
       * Set by validate.middleware. Holds the Zod-parsed (and coerced) input,
       * so handlers never read raw `req.body` / `req.query` on validated routes.
       */
      validated: {
        body:   any;
        query:  any;
        params: any;
      };
    }
  }
}

export {};
