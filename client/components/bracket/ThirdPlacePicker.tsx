"use client";

type ThirdTeam = { tla: string; name: string; crest: string; group: string };
/**
 * Lets the user pick exactly 8 of the 12 third-placed teams to advance,
 * matching the 2026 format. Click to toggle; a counter enforces the 8 cap.
 */
export default function ThirdPlacePicker({
  thirdPlaced,
  chosen,
  onChange,
  onBack,
  onContinue,
}: {
  thirdPlaced: ThirdTeam[];
  chosen: string[];
  onChange: (next: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const LIMIT = 8;

  function toggle(tla: string) {
    if (chosen.includes(tla)) {
      onChange(chosen.filter((t) => t !== tla));
    } else if (chosen.length < LIMIT) {
      onChange([...chosen, tla]);
    }
    // if at limit and not selected, ignore the click
  }

  const full = chosen.length === LIMIT;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="font-display font-bold text-sm">
          Selected <span className={full ? "text-live" : "text-volt"}>{chosen.length}</span> / {LIMIT}
        </span>
        {full && <span className="text-live text-xs font-body tracking-wide">All third-place spots filled ✓</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {thirdPlaced.map((t) => {
          const picked = chosen.includes(t.tla);
          const disabled = !picked && full;
          return (
            <button
              key={t.tla}
              onClick={() => toggle(t.tla)}
              disabled={disabled}
              className={`flex items-center gap-3 px-4 py-3 rounded-md border text-left transition-all
                ${picked ? "bg-volt/15 border-volt glow-gold" : "bg-panel border-line"}
                ${disabled ? "opacity-40 cursor-not-allowed" : "card-hover cursor-pointer"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.crest} alt="" className="h-6 w-6 object-contain" />
              <div className="flex-1">
                <div className="font-display font-bold text-sm">{t.tla}</div>
                <div className="text-ink-dim text-[10px] font-body uppercase tracking-wider">
                  3rd · {t.group.replace("_", " ")}
                </div>
              </div>
              {picked && <span className="text-volt font-display font-black text-lg">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="text-ink-dim hover:text-volt-bright transition-colors font-body text-sm px-4 py-2"
        >
          ← Back to groups
        </button>
        <button
          onClick={onContinue}
          disabled={!full}
          className="btn-volt text-white font-display font-bold tracking-wide px-8 py-3 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          CONTINUE TO KNOCKOUT →
        </button>
      </div>
    </>
  );
}