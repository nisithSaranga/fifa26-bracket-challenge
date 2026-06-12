/**
 * Scoring rules for match predictions:
 *   - EXACT score (predicted 2-1, result 2-1)            -> 3 points
 *   - Correct OUTCOME only (right winner, or both draws) -> 1 point
 *   - Wrong outcome                                      -> 0 points
 *
 * Deliberately a PURE function: numbers in, number out. No database,
 * no dates, no network. Pure functions are trivial to test — and code
 * that decides points for thousands of users deserves bulletproof tests.
 */
export function scorePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): number {
  // Exact scoreline
  if (predHome === actualHome && predAway === actualAway) return 3;

  // Math.sign(home - away): 1 = home win, 0 = draw, -1 = away win.
  // Two predictions agree on OUTCOME exactly when their signs match.
  const predictedOutcome = Math.sign(predHome - predAway);
  const actualOutcome = Math.sign(actualHome - actualAway);

  return predictedOutcome === actualOutcome ? 1 : 0;
}