import { Request, Response, NextFunction } from 'express';

/** Throw this anywhere in a controller to send a clean HTTP error. */
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

/**
 * Express catches errors passed to next(err) and funnels them here.
 * One single place decides what the client sees — controllers stay clean.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  // Unknown/unexpected error: log it fully, hide details from the client
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
