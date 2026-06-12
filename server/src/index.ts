import { createServer } from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { startWorker } from './jobs/worker';

async function main() {
  await connectDB();

  const app = createApp();
  // Express rides on a plain Node HTTP server; Socket.io attaches to
  // the same server, so one port serves both HTTP and WebSockets.
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  startWorker();
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});