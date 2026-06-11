import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  country?: string;
  /** Hashed refresh token — lets us revoke sessions (logout) server-side. */
  refreshTokenHash: string | null;
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
    passwordHash: { type: String, required: true },
    country: { type: String, maxlength: 3 }, // ISO code e.g. "LKA"
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

/** Compare a plaintext password attempt against the stored bcrypt hash. */
userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
