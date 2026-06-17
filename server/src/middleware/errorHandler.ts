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
  // Mongoose validation errors -> 400 with the first readable message
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    res.status(400).json({ error: messages[0] ?? 'Validation failed' });
    return;
  }

  // Duplicate key (e.g. email/username already taken) -> 409
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern ?? {})[0] ?? 'field';
    res.status(409).json({ error: `That ${field} is already taken` });
    return;
  }
  // Unknown/unexpected error: log it fully, hide details from the client
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
