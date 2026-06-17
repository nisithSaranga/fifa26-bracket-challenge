import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import { errorHandler } from './middleware/errorHandler';
import predictionRoutes from './routes/prediction.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import standingsRoutes from "./routes/standings.routes";

/**
 * The Express app, assembled in one place.
 * Kept separate from index.ts so tests can import the app
 * without starting a real network listener.
 */
export function createApp() {
  const app = express();

  app.use(helmet());                       // sets security HTTP headers
  app.use(
    cors({
      origin: env.clientOrigin,            // only our frontend may call us...
      credentials: true,                   // ...and may include the refresh cookie
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use("/api/standings", standingsRoutes);

  app.use(errorHandler);                   // must be registered LAST
  return app;
}
