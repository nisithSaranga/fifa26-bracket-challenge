"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

/*
 * Background music: a rotating playlist with a mute toggle.
 * Audio can only START after a user gesture (browser autoplay policy) —
 * the splash ENTER button calls start(). Tracks then rotate on end.
 */

const TRACKS = [
  "/audio/track1.mp3", 
  "/audio/track2.mp3", 
  "/audio/track3.mp3"];

interface AudioState {
  started: boolean;
  muted: boolean;
  start: () => void;
  toggleMute: () => void;
}

const AudioCtx = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.25;
    audioRef.current = audio;
    audio.addEventListener("ended", () => playRandom());
    return () => audio.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function playRandom() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = TRACKS[Math.floor(Math.random() * TRACKS.length)];
    audio.src = next;
    audio.play().catch(() => {}); // missing file -> silent, no crash
  }

  function start() {
    if (started) return;
    setStarted(true);
    playRandom();
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  }

  return (
    <AudioCtx.Provider value={{ started, muted, start, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}