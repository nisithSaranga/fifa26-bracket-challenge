/**
 * The autonomous heartbeat of the backend.
 *
 * Every minute: pull latest match data -> if anything changed,
 * score any newly-finished matches. Runs INSIDE the API process
 * (started from index.ts).
 *
 * The isRunning flag is an overlap guard: if one sync takes longer
 * than a minute (slow network), the next tick skips instead of
 * piling a second sync on top of the first.
 */
import cron from 'node-cron';
import { syncMatches } from './syncMatches';
import { applyScores } from './applyScores';

let isRunning = false;

export function startWorker(): void {
  // '* * * * *' = every minute (cron syntax: min hour day month weekday)
  cron.schedule('* * * * *', async () => {
    if (isRunning) {
      console.log('[worker] previous run still in progress — skipping tick');
      return;
    }
    isRunning = true;
    try {
      const changedIds = await syncMatches();
      if (changedIds.length > 0) {
        console.log(`[worker] ${changedIds.length} matches changed:`, changedIds);
        const scored = await applyScores();
        if (scored > 0) console.log(`[worker] scored ${scored} predictions`);
      }
    } catch (err) {
      // A failed tick must NEVER crash the API — log and wait for the next one.
      console.error('[worker] tick failed:', err);
    } finally {
      isRunning = false;
    }
  });

  console.log('[worker] started — syncing every minute');
}