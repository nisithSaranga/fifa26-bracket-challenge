/**
 * The ONLY place the frontend talks to the backend.
 * Every page imports from here — never raw fetch() in components.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Shapes mirrored from the server's Match model. */
export interface TeamRef {
  fdId: number | null;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  _id: string;
  fdMatchId: number;
  stage: string;
  group: string | null;
  matchday: number | null;
  kickoff: string;
  status: string;
  minute: number | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: { home: number | null; away: number | null };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

export function getUpcomingMatches() {
  return get<{ matches: Match[] }>("/api/matches/upcoming");
}

export function getLiveMatches() {
  return get<{ matches: Match[] }>("/api/matches/live");
}

export function getFinishedMatches() {
  return get<{ count: number; matches: Match[] }>("/api/matches?status=FINISHED");
}