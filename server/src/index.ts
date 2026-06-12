import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { startWorker } from './jobs/worker';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
  startWorker();
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
