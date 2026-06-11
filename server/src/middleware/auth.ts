import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from './errorHandler';

/** Request with the authenticated user's id attached. */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Gatekeeper middleware. Reads "Authorization: Bearer <token>",
 * verifies it, and attaches userId to the request.
 * Any route behind this is guaranteed an authenticated user.
 */
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.userId;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
