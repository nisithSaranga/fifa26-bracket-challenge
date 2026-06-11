import dotenv from 'dotenv';
dotenv.config();

/**
 * Central place for ALL environment variables.
 * If a required variable is missing we crash immediately on startup —
 * far better than a mysterious failure at 2am during a live match.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: required('MONGO_URI'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  footballDataKey: process.env.FOOTBALL_DATA_KEY || '',
  apiFootballKey: process.env.API_FOOTBALL_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};
