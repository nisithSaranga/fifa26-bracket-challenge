import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Two-token strategy (industry standard):
 *  - ACCESS token: short-lived (15 min), sent in the Authorization header.
 *    If stolen, it expires quickly.
 *  - REFRESH token: long-lived (7 days), stored in an httpOnly cookie that
 *    JavaScript cannot read (protects against XSS theft). Used only to mint
 *    new access tokens. Its hash is stored in the DB so we can revoke it.
 */

export interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtAccessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtRefreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}
