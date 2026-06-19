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

/* ---------- Auth ---------- */

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send/receive the httpOnly refresh cookie
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export function registerUser(input: {
  username: string;
  email: string;
  password: string;
  country?: string;
}) {
  return post<AuthResponse>("/api/auth/register", input);
}

export function loginUser(input: { emailOrUsername: string; password: string }) {
  return post<AuthResponse>("/api/auth/login", input);
}

/* ---------- Predictions ---------- */

export interface MatchPrediction {
  _id: string;
  match: string;
  predictedHome: number;
  predictedAway: number;
  pointsAwarded: number | null;
}

/** Authenticated calls need the access token in the header. */
function authPost<T>(path: string, token: string, body: unknown): Promise<T> {
  return authRequest<T>(path, token, "PUT", body);
}

async function authRequest<T>(path: string, token: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export function savePrediction(
  token: string,
  matchId: string,
  predictedHome: number,
  predictedAway: number
) {
  return authPost<{ prediction: MatchPrediction }>(
    `/api/predictions/${matchId}`,
    token,
    { predictedHome, predictedAway }
  );
}

export function getMyPredictions(token: string) {
  return authRequest<{ count: number; predictions: MatchPrediction[] }>(
    "/api/predictions/mine",
    token,
    "GET"
  );
}
/* ---------- Leaderboard ---------- */

export interface LeaderboardRow {
  rank: number;
  username: string;
  country?: string;
  totalPoints: number;
  predictionsScored: number;
  exactScores: number;
}

export function getLeaderboard() {
  return get<{ leaderboard: LeaderboardRow[] }>("/api/leaderboard");
}
/* ---------- Standings ---------- */

export interface StandingTeam {
  tla: string;
  name: string;
  crest: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  teams: StandingTeam[];
}

export function getStandings() {
  return get<{ standings: GroupStanding[] }>("/api/standings");
}