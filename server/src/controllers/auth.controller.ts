import { Response, NextFunction, Request } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { env } from '../config/env';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(env.googleClientId);

const REFRESH_COOKIE = 'fifa26_refresh';

/** Standard options for the refresh-token cookie. */
function refreshCookieOptions() {
  return {
    httpOnly: true,                          // JS on the page can NEVER read it
    secure: env.nodeEnv === 'production',    // HTTPS-only in production
    sameSite: 'lax' as const,
    path: '/api/auth',                       // only sent to auth endpoints
    maxAge: 7 * 24 * 60 * 60 * 1000,         // 7 days
  };
}

/** Issue both tokens + persist the refresh token hash for revocation. */
async function issueTokens(res: Response, userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(userId, { refreshTokenHash });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

/** POST /api/auth/register */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password, country } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, 'username, email and password are required');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      throw new ApiError(409, 'Username or email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash, country });

    const accessToken = await issueTokens(res, user.id);
    res.status(201).json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      throw new ApiError(400, 'emailOrUsername and password are required');
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    // Same error for "no such user" and "wrong password" —
    // never reveal which one failed (prevents account enumeration).
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const accessToken = await issueTokens(res, user.id);
    res.json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/google — verify a Google ID token, find/create user, issue our tokens. */
export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = req.body; // Google ID token from the frontend
    if (!credential) throw new ApiError(400, 'Missing Google credential');

    // Verify the token with Google.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new ApiError(401, 'Invalid Google token');

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name;

    // Find by googleId or existing email (link if they signed up locally before).
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user — build a unique username from their name/email.
      const base =
        (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || 'player';
      let username = base;
      let n = 1;
      while (await User.findOne({ username })) {
        username = `${base}${n++}`.slice(0, 20);
      }
      user = await User.create({ username, email, googleId, authProvider: 'google' });
    } else if (!user.googleId) {
      // Existing local account, first Google sign-in → link it.
      user.googleId = googleId;
      await user.save();
    }

    // Reuse the SAME token/cookie logic as login — identical session behavior.
    const accessToken = await issueTokens(res, user.id);
    res.json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}
/** POST /api/auth/refresh — mint a new access token from the cookie. */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new ApiError(401, 'No refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokenHash) throw new ApiError(401, 'Session revoked');

    // The cookie must match the hash we stored — a logged-out (revoked)
    // or rotated token fails here even if its signature is still valid.
    const matches = await bcrypt.compare(token, user.refreshTokenHash);
    if (!matches) throw new ApiError(401, 'Session revoked');

    // Token rotation: every refresh issues a brand-new refresh token.
    const accessToken = await issueTokens(res, user.id);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout — revoke the session. */
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, { refreshTokenHash: null });
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — who am I? */
export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId).select('username email country createdAt');
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
