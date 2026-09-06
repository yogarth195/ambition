import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { unauthorized } from './appError';

export interface TokenPayload {
  id:    string;
  email: string;
  role:  string;
  name:  string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
    throw unauthorized('Invalid or expired token');
  }
}
