"use client";

import { useAudio } from "@/lib/audio-context";

export default function MuteToggle() {
  const { started, muted, toggleMute } = useAudio();
  if (!started) return null;

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? "Unmute music" : "Mute music"}
      title={muted ? "Unmute" : "Mute"}
      className="text-ink-dim hover:text-gold transition-colors text-lg"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}