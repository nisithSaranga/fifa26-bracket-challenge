/**
 * TEMPORARY theme smoke-test page.
 * Proves: colors, both fonts, and the angled-card signature render.
 * Will be replaced by the real home page.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <p className="text-ink-dim tracking-[0.35em] text-sm font-body uppercase">
          June 11 — July 19, 2026
        </p>
        <h1 className="font-display font-black text-6xl tracking-tight mt-3">
          FIFA 2026
          <span className="text-gold"> BRACKET CHALLENGE</span>
        </h1>
      </div>

      {/* Signature angled card — a fake match to test the silhouette */}
      <div className="card-angled bg-panel border border-line p-6 w-full max-w-md">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-2xl">MEX</span>
          <span className="font-display font-black text-4xl text-gold">2 — 1</span>
          <span className="font-display font-bold text-2xl">RSA</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-2 w-2 rounded-full bg-live animate-pulse" />
          <span className="text-live text-xs tracking-widest font-body">LIVE — 78&apos;</span>
        </div>
      </div>
    </main>
  );
}