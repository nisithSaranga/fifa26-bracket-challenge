import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash?: string; // optional: Google-authenticated users have no password
  country?: string;
  /** Hashed refresh token — lets us revoke sessions (logout) server-side. */
  refreshTokenHash: string | null;
  /** Set when the account was created/linked via Google sign-in. */
  googleId?: string;
  authProvider: 'local' | 'google';
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can contain letters, numbers and _ only'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    // Not required: Google users authenticate via Google and have no local password.
    passwordHash: { type: String, required: false },
    country: { type: String, maxlength: 3 }, // ISO code e.g. "LKA"
    refreshTokenHash: { type: String, default: null },
    googleId: { type: String, required: false, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  },
  { timestamps: true }
);

/** Compare a plaintext password attempt against the stored bcrypt hash.
 *  Returns false for accounts with no password (e.g. Google sign-in users). */
userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);