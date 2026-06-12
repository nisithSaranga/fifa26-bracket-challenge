import { scorePrediction } from './scoring';

/**
 * Each test is a claim about how scoring MUST behave.
 * If a future change breaks a rule, these fail loudly before users notice.
 */
describe('scorePrediction', () => {
  it('awards 3 points for the exact score', () => {
    expect(scorePrediction(2, 1, 2, 1)).toBe(3);
  });

  it('awards 3 points for an exact draw', () => {
    expect(scorePrediction(0, 0, 0, 0)).toBe(3);
  });

  it('awards 1 point for correct home-win outcome with wrong score', () => {
    expect(scorePrediction(1, 0, 3, 1)).toBe(1);
  });

  it('awards 1 point for correct away-win outcome with wrong score', () => {
    expect(scorePrediction(0, 2, 1, 4)).toBe(1);
  });

  it('awards 1 point for a draw predicted with different numbers', () => {
    expect(scorePrediction(1, 1, 2, 2)).toBe(1);
  });

  it('awards 0 points for the wrong outcome', () => {
    expect(scorePrediction(2, 0, 0, 1)).toBe(0);
  });

  it('awards 0 when predicting a draw but a team wins', () => {
    expect(scorePrediction(1, 1, 2, 1)).toBe(0);
  });
});