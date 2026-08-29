export interface DifficultySettings {
  min: number;
  max: number;
  maxAttempts: number;
  xpMultiplier: number;
  coinMultiplier: number;
}

export const DIFFICULTY_CONFIGS: Record<string, DifficultySettings> = {
  easy: { min: 1, max: 50, maxAttempts: 10, xpMultiplier: 1.0, coinMultiplier: 1.0 },
  medium: { min: 1, max: 500, maxAttempts: 8, xpMultiplier: 1.5, coinMultiplier: 1.5 },
  hard: { min: 1, max: 10000, maxAttempts: 7, xpMultiplier: 2.5, coinMultiplier: 2.5 },
  insane: { min: 1, max: 1000000, maxAttempts: 6, xpMultiplier: 5.0, coinMultiplier: 5.0 }
};

export interface GuessEvaluation {
  guess: number;
  comparison: 'high' | 'low' | 'correct';
  distance: number;
  percentageDistance: number;
  hotness: 'cold' | 'warm' | 'hot' | 'very_hot';
  message: string;
  propertyHint?: string;
}

export function evaluateGuess(
  guess: number,
  secretNumber: number,
  minRange: number,
  maxRange: number,
  attemptsUsed: number
): GuessEvaluation {
  const totalRange = Math.max(1, maxRange - minRange);
  const distance = Math.abs(guess - secretNumber);
  const percentageDistance = (distance / totalRange) * 100;

  let comparison: 'high' | 'low' | 'correct' = 'correct';
  if (guess > secretNumber) comparison = 'high';
  else if (guess < secretNumber) comparison = 'low';

  let hotness: 'cold' | 'warm' | 'hot' | 'very_hot' = 'cold';
  let message = '';

  if (comparison === 'correct') {
    hotness = 'very_hot';
    message = '🎯 BINGO! That is the exact number!';
  } else if (percentageDistance < 5) {
    hotness = 'very_hot';
    message = `🔥 VERY HOT — Only ${distance.toLocaleString()} away!`;
  } else if (percentageDistance <= 10) {
    hotness = 'hot';
    message = `⚡ HOT — Within ${distance.toLocaleString()} of the target!`;
  } else if (percentageDistance <= 30) {
    hotness = 'warm';
    message = `🟡 WARM — Getting closer (${distance.toLocaleString()} away).`;
  } else {
    hotness = 'cold';
    message = `❄️ COLD — Far off (${distance.toLocaleString()} away).`;
  }

  // Generate intelligent property hints on certain attempts (e.g. attempt 2, 4, 6)
  let propertyHint: string | undefined;
  if (comparison !== 'correct') {
    if (attemptsUsed === 2) {
      propertyHint = secretNumber % 2 === 0 ? '💡 Hint: The secret number is EVEN.' : '💡 Hint: The secret number is ODD.';
    } else if (attemptsUsed === 4) {
      if (secretNumber % 5 === 0) {
        propertyHint = '💡 Hint: The secret number is divisible by 5.';
      } else if (secretNumber % 3 === 0) {
        propertyHint = '💡 Hint: The secret number is divisible by 3.';
      } else {
        propertyHint = `💡 Hint: The secret number is NOT divisible by 3 or 5.`;
      }
    } else if (attemptsUsed === 6) {
      const lowerQuarter = Math.floor(minRange + totalRange * 0.25);
      const upperQuarter = Math.floor(minRange + totalRange * 0.75);
      if (secretNumber < lowerQuarter) {
        propertyHint = `💡 Hint: The secret number is in the lower 25% (below ${lowerQuarter.toLocaleString()}).`;
      } else if (secretNumber > upperQuarter) {
        propertyHint = `💡 Hint: The secret number is in the upper 25% (above ${upperQuarter.toLocaleString()}).`;
      } else {
        propertyHint = `💡 Hint: The secret number is in the middle 50% (${lowerQuarter.toLocaleString()} – ${upperQuarter.toLocaleString()}).`;
      }
    }
  }

  return {
    guess,
    comparison,
    distance,
    percentageDistance: Math.round(percentageDistance * 10) / 10,
    hotness,
    message,
    propertyHint
  };
}

export function calculateScore(
  won: boolean,
  attempts: number,
  maxAttempts: number,
  difficulty: string,
  timeTakenSeconds: number,
  timeLimitSeconds: number = 0,
  streak: number = 0
): { score: number; xp: number; coins: number } {
  if (!won) {
    const consolationXp = Math.floor(25 * (DIFFICULTY_CONFIGS[difficulty]?.xpMultiplier || 1));
    return { score: 0, xp: consolationXp, coins: 5 };
  }

  const diffMultiplier = DIFFICULTY_CONFIGS[difficulty]?.xpMultiplier || 1;
  const coinMultiplier = DIFFICULTY_CONFIGS[difficulty]?.coinMultiplier || 1;

  // Base attempt points
  let attemptPoints = 1000;
  if (attempts === 1) attemptPoints = 1000;
  else if (attempts === 2) attemptPoints = 750;
  else if (attempts === 3) attemptPoints = 500;
  else if (attempts === 4) attemptPoints = 350;
  else if (attempts === 5) attemptPoints = 250;
  else attemptPoints = Math.max(100, 200 - (attempts - 6) * 30);

  // Speed bonus
  let speedBonus = 0;
  if (timeLimitSeconds > 0) {
    const remainingRatio = Math.max(0, (timeLimitSeconds - timeTakenSeconds) / timeLimitSeconds);
    speedBonus = Math.floor(remainingRatio * 500);
  } else {
    // Under 15s gets quick reflex bonus
    if (timeTakenSeconds < 10) speedBonus = 300;
    else if (timeTakenSeconds < 20) speedBonus = 150;
  }

  // Streak bonus
  const streakBonus = Math.min(500, streak * 50);

  const totalScore = Math.floor((attemptPoints + speedBonus + streakBonus) * diffMultiplier);
  const xpEarned = Math.floor((150 + attemptPoints * 0.4 + speedBonus * 0.2 + streakBonus * 0.5) * diffMultiplier);
  const coinsEarned = Math.floor((30 + (attempts === 1 ? 50 : 20) + Math.floor(streak * 5)) * coinMultiplier);

  return {
    score: totalScore,
    xp: xpEarned,
    coins: coinsEarned
  };
}

export function calculateEloDelta(playerRating: number, opponentRating: number, won: boolean, kFactor: number = 32): number {
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const actual = won ? 1 : 0;
  const delta = Math.round(kFactor * (actual - expected));
  return delta;
}

// AI Strategy Generators
export function generateAIMove(
  difficulty: 'easy' | 'medium' | 'expert',
  currentMin: number,
  currentMax: number,
  secretNumber?: number
): { guess: number; reasoning: string } {
  const min = Math.max(1, currentMin);
  const max = Math.max(min, currentMax);

  if (min === max) {
    return { guess: min, reasoning: `Locked in bounds: only ${min} remains!` };
  }

  if (difficulty === 'expert') {
    // Pure optimal binary search
    const optimalGuess = Math.floor((min + max) / 2);
    return {
      guess: optimalGuess,
      reasoning: `Optimal binary split at midpoint [${min.toLocaleString()} ... ${optimalGuess.toLocaleString()} ... ${max.toLocaleString()}]`
    };
  }

  if (difficulty === 'medium') {
    // Binary search with small human variance (±10% offset)
    const mid = Math.floor((min + max) / 2);
    const spread = Math.max(1, Math.floor((max - min) * 0.1));
    const randomOffset = Math.floor((Math.random() * 2 - 1) * spread);
    const guess = Math.min(max, Math.max(min, mid + randomOffset));
    return {
      guess,
      reasoning: `Approximating midpoint around ${mid.toLocaleString()} with tactical search.`
    };
  }

  // Easy: Random exploration weighted toward middle
  const randomFactor = Math.random();
  const guess = Math.floor(min + randomFactor * (max - min));
  return {
    guess: Math.min(max, Math.max(min, guess)),
    reasoning: `Scanning randomly between ${min.toLocaleString()} and ${max.toLocaleString()}...`
  };
}
