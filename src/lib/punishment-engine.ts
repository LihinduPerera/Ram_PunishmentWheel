import {
  DIFFICULTIES,
  DIFFICULTY_PROFILES,
  type Difficulty,
  type DifficultyProfile,
  type DifficultyWeights,
  type ParticipantDifficulty,
  type Punishment,
} from "@/types";
import {
  clamp,
  pickOne,
  secureRandom,
  weightedIndex,
  type RandomSource,
} from "./random";

export interface WeightedPoolEntry {
  punishment: Punishment;
  /** Index within the active punishment list. */
  index: number;
  weight: number;
  /** Probability of this punishment's difficulty tier for the spin. */
  tierProbability: number;
  /** Final probability of this exact punishment. */
  probability: number;
}

export interface WeightedPool {
  profileUsed: DifficultyProfile;
  entries: WeightedPoolEntry[];
  tierProbabilities: Record<Difficulty, number>;
  totalWeight: number;
}

export interface PunishmentSelection {
  punishment: Punishment;
  index: number;
  /** Fraction in [-1, 1] used to land somewhere inside the winning slice. */
  jitter: number;
  profileUsed: DifficultyProfile;
  tierProbabilities: Record<Difficulty, number>;
}

function emptyTierProbabilities(): Record<Difficulty, number> {
  return { easy: 0, medium: 0, hard: 0 };
}

function isPositiveWeight(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * "Random" picks a fresh profile for each spin, so the wheel's mix stays
 * unpredictable while still using the configurable profile matrix.
 */
export function resolveProfile(
  participantDifficulty: ParticipantDifficulty,
  rng: RandomSource = secureRandom,
): DifficultyProfile {
  if (participantDifficulty === "random") {
    return pickOne(DIFFICULTY_PROFILES, rng) ?? "normal";
  }

  return participantDifficulty;
}

/**
 * Builds the weighted pool behind the wheel. Every active punishment gets a
 * chance: tier weights are divided evenly among the punishments in that tier.
 * Empty tiers are removed and the remaining weights renormalized.
 */
export function computeWeightedPool(
  activePunishments: readonly Punishment[],
  participantDifficulty: ParticipantDifficulty,
  weights: DifficultyWeights,
  rng: RandomSource = secureRandom,
): WeightedPool {
  const profileUsed = resolveProfile(participantDifficulty, rng);
  const tierProbabilities = emptyTierProbabilities();

  if (activePunishments.length === 0) {
    return { profileUsed, entries: [], tierProbabilities, totalWeight: 0 };
  }

  const punishmentsByTier: Record<Difficulty, Punishment[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const punishment of activePunishments) {
    punishmentsByTier[punishment.difficulty].push(punishment);
  }

  const profileWeights = weights[profileUsed];
  const availableTiers = DIFFICULTIES.filter(
    (tier) => punishmentsByTier[tier].length > 0,
  );

  let availableWeightTotal = 0;
  for (const tier of availableTiers) {
    const tierWeight = profileWeights?.[tier];
    if (isPositiveWeight(tierWeight)) {
      availableWeightTotal += tierWeight;
    }
  }

  // If every configured weight is zero, fall back to a balanced tier mix.
  const tierWeights: Record<Difficulty, number> = {
    easy: isPositiveWeight(profileWeights?.easy) ? profileWeights.easy : 0,
    medium: isPositiveWeight(profileWeights?.medium)
      ? profileWeights.medium
      : 0,
    hard: isPositiveWeight(profileWeights?.hard) ? profileWeights.hard : 0,
  };

  if (availableWeightTotal <= 0) {
    for (const tier of availableTiers) {
      tierWeights[tier] = 1;
      availableWeightTotal += 1;
    }
  }

  const entries: WeightedPoolEntry[] = [];
  let totalWeight = 0;

  for (const tier of availableTiers) {
    const tierProbability = tierWeights[tier] / availableWeightTotal;
    tierProbabilities[tier] = tierProbability;

    const tierPunishments = punishmentsByTier[tier];
    const individualWeight = tierProbability / tierPunishments.length;

    for (const punishment of tierPunishments) {
      const index = activePunishments.indexOf(punishment);
      entries.push({
        punishment,
        index,
        weight: individualWeight,
        tierProbability,
        probability: individualWeight,
      });
      totalWeight += individualWeight;
    }
  }

  return { profileUsed, entries, tierProbabilities, totalWeight };
}

/**
 * Selects a punishment with the participant's weighted difficulty profile,
 * plus a small jitter used by the wheel animation.
 */
export function selectPunishment(
  activePunishments: readonly Punishment[],
  participantDifficulty: ParticipantDifficulty,
  weights: DifficultyWeights,
  rng: RandomSource = secureRandom,
): PunishmentSelection | null {
  const pool = computeWeightedPool(
    activePunishments,
    participantDifficulty,
    weights,
    rng,
  );

  if (pool.entries.length === 0) return null;

  const selectedIndex = weightedIndex(
    pool.entries.map((entry) => entry.weight),
    rng,
  );
  if (selectedIndex === null) return null;

  const selected = pool.entries[selectedIndex];
  if (!selected) return null;

  const jitter = clamp(rng() * 2 - 1, -1, 1);

  return {
    punishment: selected.punishment,
    index: selected.index,
    jitter,
    profileUsed: pool.profileUsed,
    tierProbabilities: pool.tierProbabilities,
  };
}

/** Convenience helper used by tests and the settings preview. */
export function normalizeTierWeights(
  weights: Record<Difficulty, number>,
): Record<Difficulty, number> {
  const total = DIFFICULTIES.reduce(
    (sum, tier) =>
      sum + (isPositiveWeight(weights[tier]) ? weights[tier] : 0),
    0,
  );

  if (total <= 0) {
    return { easy: 1 / 3, medium: 1 / 3, hard: 1 / 3 };
  }

  return {
    easy: (isPositiveWeight(weights.easy) ? weights.easy : 0) / total,
    medium: (isPositiveWeight(weights.medium) ? weights.medium : 0) / total,
    hard: (isPositiveWeight(weights.hard) ? weights.hard : 0) / total,
  };
}
