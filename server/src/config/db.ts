import mongoose from 'mongoose';
import { env } from './env';

/** Connect to MongoDB Atlas. Called once at server startup. */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1); // no point running an API without a database
  }
}
