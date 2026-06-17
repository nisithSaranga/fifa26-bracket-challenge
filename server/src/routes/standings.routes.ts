import { Router, Request, Response, NextFunction } from "express";
import { Match } from "../models/Match";

const router = Router();

/**
 * GET /api/standings
 * Computes real World Cup group tables from finished/in-play match data.
 * Returns each group with teams ranked by points, then goal difference,
 * then goals for — the standard football tiebreakers.
 *
 * This is derived data: we never store standings, we calculate them live
 * from the source of truth (the matches collection) on each request.
 */
interface TeamStanding {
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

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Only group-stage matches that have a result or are in progress
    const matches = await Match.find({
      group: { $ne: null },
      status: { $in: ["IN_PLAY", "PAUSED", "FINISHED"] },
      "score.home": { $ne: null },
      "score.away": { $ne: null },
    });

    // group -> (tla -> standing)
    const groups: Record<string, Record<string, TeamStanding>> = {};

    function ensure(group: string, team: { tla: string; name: string; crest: string }) {
      if (!groups[group]) groups[group] = {};
      if (!groups[group][team.tla]) {
        groups[group][team.tla] = {
          tla: team.tla, name: team.name, crest: team.crest,
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
        };
      }
      return groups[group][team.tla];
    }

    for (const m of matches) {
      const g = m.group as string;
      const home = ensure(g, m.homeTeam);
      const away = ensure(g, m.awayTeam);
      const hs = m.score.home as number;
      const as = m.score.away as number;

      home.played++; away.played++;
      home.goalsFor += hs; home.goalsAgainst += as;
      away.goalsFor += as; away.goalsAgainst += hs;

      if (hs > as) { home.won++; home.points += 3; away.lost++; }
      else if (hs < as) { away.won++; away.points += 3; home.lost++; }
      else { home.drawn++; away.drawn++; home.points++; away.points++; }
    }

    // Finalize: compute GD and sort each group
    const result = Object.keys(groups).sort().map((groupName) => {
      const teams = Object.values(groups[groupName]).map((t) => ({
        ...t,
        goalDiff: t.goalsFor - t.goalsAgainst,
      }));
      teams.sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDiff - a.goalDiff ||
          b.goalsFor - a.goalsFor
      );
      return { group: groupName, teams };
    });

    res.json({ standings: result });
  } catch (err) {
    next(err);
  }
});

export default router;