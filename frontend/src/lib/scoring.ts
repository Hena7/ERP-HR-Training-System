/**
 * Utility for calculating HR Education applicant scores based on standard rules.
 */

export interface ScoringInputs {
  experienceYears: number;
  experienceMonths: number;
  performance1: number;
  performance2: number;
  hasDiscipline: boolean;
  gender: string; // 'Male' | 'Female'
  isDisabled: boolean;
}

export interface ScoringResult {
  experienceScore: number;
  performanceScore: number;
  disciplineScore: number;
  affirmativeBonus: number;
  finalTotalScore: number;
}

/**
 * Calculates scores based on the rules:
 * 1. Experience (30% weight, max 30 points)
 *    - < 2 years = 0 points
 *    - 2 years = 6 points
 *    - Each additional year = 3 points
 *    - Each additional month = 0.25 points
 *    - Cap at 30 points (10+ years)
 * 2. Performance (60% weight, max 60 points)
 *    - Avg of two scores
 *    - 80-85 -> 50
 *    - 85-90 -> 53
 *    - 90-95 -> 56
 *    - 95-100 -> 60
 * 3. Discipline (10% weight, 10 points max)
 *    - No record = 10 points
 *    - Record = 0 points
 * 4. Affirmative Bonus
 *    - Female: +3%
 *    - Disabled Male: +3%
 *    - Disabled Female: +5%
 *    - (Highest bonus only)
 */
export function calculateEducationScore(inputs: ScoringInputs): ScoringResult {
  const {
    experienceYears,
    experienceMonths,
    performance1,
    performance2,
    hasDiscipline,
    gender,
    isDisabled,
  } = inputs;

  // 1. Experience Score (30%)
  let experienceScore = 0;
  if (experienceYears >= 2) {
    // Base 6 pts for 2 years, then 3 pts per year (0.25 per month)
    const basePoints = 6;
    const additionalYears = experienceYears - 2;
    experienceScore = basePoints + additionalYears * 3 + experienceMonths * 0.25;
  }
  // Cap at 30
  experienceScore = Math.min(30, experienceScore);

  // 2. Performance Score (60%)
  const avgPerformance = (performance1 + performance2) / 2;
  let performanceScore = 0;
  if (avgPerformance >= 95) performanceScore = 60;
  else if (avgPerformance >= 90) performanceScore = 56;
  else if (avgPerformance >= 85) performanceScore = 53;
  else if (avgPerformance >= 80) performanceScore = 50;
  else {
    // If below 80, we could either give 0 or interpolate. 
    // The rules don't specify < 80, so we default to 0 to be safe or maybe a minimum.
    // Based on the table provided, it starts at 80.
    performanceScore = 0;
  }

  // 3. Discipline Score (10%)
  const disciplineScore = hasDiscipline ? 0 : 10;

  // 4. Affirmative Action Bonus
  let affirmativeBonus = 0;
  const isFemale = gender?.toLowerCase() === "female";

  if (isFemale && isDisabled) {
    affirmativeBonus = 5;
  } else if (isFemale || isDisabled) {
    affirmativeBonus = 3;
  }

  // 5. Total Score
  const totalRaw = experienceScore + performanceScore + disciplineScore;
  const finalTotalScore = Number((totalRaw + affirmativeBonus).toFixed(2));

  return {
    experienceScore: Number(experienceScore.toFixed(2)),
    performanceScore: Number(performanceScore.toFixed(2)),
    disciplineScore: Number(disciplineScore.toFixed(2)),
    affirmativeBonus: Number(affirmativeBonus.toFixed(2)),
    finalTotalScore,
  };
}
