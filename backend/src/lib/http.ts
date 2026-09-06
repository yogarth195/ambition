import { Response } from 'express';

/**
 * Response envelope shared by every route. Shapes match what the frontend
 * already expects: `{ success, data }` for a single record and
 * `{ success, count, data }` for collections.
 */
export function sendSuccess<T>(res: Response, data: T, status = 200, message?: string) {
  res.status(status).json({ success: true, ...(message ? { message } : {}), data });
}

export function sendList<T>(res: Response, data: T[], status = 200) {
  res.status(status).json({ success: true, count: data.length, data });
}

export function sendMessage(res: Response, message: string, status = 200) {
  res.status(status).json({ success: true, message });
}
