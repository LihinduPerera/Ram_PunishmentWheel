import { describe, expect, it } from "vitest";
import { DEFAULT_DIFFICULTY_WEIGHTS } from "@/constants/difficulty";
import { cloneSeedPunishments } from "@/constants/seed";
import {
  computeWeightedPool,
  normalizeTierWeights,
  resolveProfile,
  selectPunishment,
} from "@/lib/punishment-engine";
import { computeTargetRotation, getWinningSegmentIndex } from "@/lib/wheel";
import type { Difficulty, Punishment, TierWeights } from "@/types";

const activePunishments = cloneSeedPunishments();
const weights = DEFAULT_DIFFICULTY_WEIGHTS;

function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function countByTier(punishments: readonly Punishment[]) {
  return {
    easy: punishments.filter((item) => item.difficulty === "easy").length,
    medium: punishments.filter((item) => item.difficulty === "medium").length,
    hard: punishments.filter((item) => item.difficulty === "hard").length,
  };
}

describe("weighted punishment engine", () => {
  it("keeps every active punishment on the wheel", () => {
    const pool = computeWeightedPool(activePunishments, "normal", weights);
    const ids = new Set(pool.entries.map((entry) => entry.punishment.id));

    expect(pool.entries).toHaveLength(activePunishments.length);
    expect(ids.size).toBe(activePunishments.length);
    for (const punishment of activePunishments) {
      expect(ids.has(punishment.id)).toBe(true);
    }
    expect(pool.totalWeight).toBeCloseTo(1, 10);
  });

  it("uses the Easy profile for Lihindu exactly as configured", () => {
    const pool = computeWeightedPool(activePunishments, "easy", weights);
    const counts = countByTier(activePunishments);

    expect(pool.profileUsed).toBe("easy");
    expect(pool.tierProbabilities.easy).toBeCloseTo(0.7, 10);
    expect(pool.tierProbabilities.medium).toBeCloseTo(0.25, 10);
    expect(pool.tierProbabilities.hard).toBeCloseTo(0.05, 10);

    for (const entry of pool.entries) {
      expect(entry.probability).toBeCloseTo(
        pool.tierProbabilities[entry.punishment.difficulty] /
          counts[entry.punishment.difficulty],
        10,
      );
    }

    // Lihindu should still have a small, non-zero chance at a hard dare.
    const hardProbability = pool.entries
      .filter((entry) => entry.punishment.difficulty === "hard")
      .reduce((sum, entry) => sum + entry.probability, 0);
    expect(hardProbability).toBeCloseTo(0.05, 10);
    expect(hardProbability).toBeGreaterThan(0);
  });

  it("applies the documented Normal and Hard profile mixes", () => {
    const normal = computeWeightedPool(activePunishments, "normal", weights);
    expect(normal.tierProbabilities.easy).toBeCloseTo(0.34, 10);
    expect(normal.tierProbabilities.medium).toBeCloseTo(0.33, 10);
    expect(normal.tierProbabilities.hard).toBeCloseTo(0.33, 10);

    const hard = computeWeightedPool(activePunishments, "hard", weights);
    expect(hard.tierProbabilities.easy).toBeCloseTo(0.15, 10);
    expect(hard.tierProbabilities.medium).toBeCloseTo(0.3, 10);
    expect(hard.tierProbabilities.hard).toBeCloseTo(0.55, 10);
  });

  it("resolves the Random profile deterministically from the RNG", () => {
    expect(resolveProfile("random", () => 0)).toBe("easy");
    expect(resolveProfile("random", () => 0.34)).toBe("normal");
    expect(resolveProfile("random", () => 0.99)).toBe("hard");
    expect(resolveProfile("easy", () => 0.99)).toBe("easy");
  });

  it("renormalizes when a difficulty tier has no punishments", () => {
    const mediumOnly = activePunishments.filter(
      (item) => item.difficulty === "medium",
    );
    const pool = computeWeightedPool(mediumOnly, "easy", weights);

    expect(pool.tierProbabilities.easy).toBe(0);
    expect(pool.tierProbabilities.hard).toBe(0);
    expect(pool.tierProbabilities.medium).toBeCloseTo(1, 10);
    expect(pool.entries.every((entry) => entry.punishment.difficulty === "medium")).toBe(
      true,
    );
  });

  it("falls back to a balanced tier mix when every weight is zero", () => {
    const zeroWeights: Record<"easy" | "normal" | "hard", TierWeights> = {
      easy: { easy: 0, medium: 0, hard: 0 },
      normal: { easy: 0, medium: 0, hard: 0 },
      hard: { easy: 0, medium: 0, hard: 0 },
    };

    const pool = computeWeightedPool(activePunishments, "normal", zeroWeights);
    expect(pool.tierProbabilities.easy).toBeCloseTo(1 / 3, 10);
    expect(pool.tierProbabilities.medium).toBeCloseTo(1 / 3, 10);
    expect(pool.tierProbabilities.hard).toBeCloseTo(1 / 3, 10);
    expect(pool.totalWeight).toBeCloseTo(1, 10);
  });

  it("returns an empty pool instead of throwing when nothing is active", () => {
    const pool = computeWeightedPool([], "easy", weights);
    expect(pool.entries).toHaveLength(0);
    expect(pool.totalWeight).toBe(0);
    expect(selectPunishment([], "easy", weights)).toBeNull();
  });

  it("selects a punishment whose index matches the active list and the wheel", () => {
    const selection = selectPunishment(activePunishments, "normal", weights, () => 0.42);

    expect(selection).not.toBeNull();
    if (!selection) return;

    expect(activePunishments[selection.index]?.id).toBe(selection.punishment.id);
    expect(selection.jitter).toBeGreaterThanOrEqual(-1);
    expect(selection.jitter).toBeLessThanOrEqual(1);

    const target = computeTargetRotation({
      currentRotation: 137,
      index: selection.index,
      segmentCount: activePunishments.length,
      jitter: selection.jitter,
      extraTurns: 7,
    });
    expect(
      getWinningSegmentIndex(target, activePunishments.length),
    ).toBe(selection.index);
  });

  it("matches the configured distribution over many spins", () => {
    const rng = makeRng(20260214);
    const counts: Record<Difficulty, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    const seen = new Set<string>();
    const spins = 20_000;

    for (let index = 0; index < spins; index += 1) {
      const selection = selectPunishment(
        activePunishments,
        "easy",
        weights,
        rng,
      );
      expect(selection).not.toBeNull();
      if (!selection) continue;
      counts[selection.punishment.difficulty] += 1;
      seen.add(selection.punishment.id);
    }

    expect(seen.size).toBe(activePunishments.length);
    expect(counts.easy / spins).toBeGreaterThan(0.65);
    expect(counts.easy / spins).toBeLessThan(0.75);
    expect(counts.medium / spins).toBeGreaterThan(0.2);
    expect(counts.medium / spins).toBeLessThan(0.3);
    expect(counts.hard / spins).toBeGreaterThan(0.02);
    expect(counts.hard / spins).toBeLessThan(0.09);
  });

  it("normalizes arbitrary weights for previews", () => {
    expect(normalizeTierWeights({ easy: 2, medium: 2, hard: 1 })).toEqual({
      easy: 0.4,
      medium: 0.4,
      hard: 0.2,
    });
    expect(normalizeTierWeights({ easy: 0, medium: 0, hard: 0 })).toEqual({
      easy: 1 / 3,
      medium: 1 / 3,
      hard: 1 / 3,
    });
    expect(normalizeTierWeights({ easy: -5, medium: 0, hard: 0 })).toEqual({
      easy: 1 / 3,
      medium: 1 / 3,
      hard: 1 / 3,
    });
  });
});
