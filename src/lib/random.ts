export type RandomSource = () => number;

/**
 * Cryptographically secure random float in [0, 1). Falls back to Math.random
 * only when the Web Crypto API is unavailable.
 */
export const secureRandom: RandomSource = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    const high = values[0] ?? 0;
    const low = values[1] ?? 0;
    // 53 bits of precision, matching Number.MAX_SAFE_INTEGER.
    return (high * 2 ** 21 + (low >>> 11)) / 2 ** 53;
  }

  return Math.random();
};

export function randomId(prefix = "id"): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Integer in [min, maxExclusive). */
export function randomInt(
  min: number,
  maxExclusive: number,
  rng: RandomSource = secureRandom,
): number {
  if (!Number.isFinite(min) || !Number.isFinite(maxExclusive)) {
    return min;
  }

  const lower = Math.ceil(Math.min(min, maxExclusive));
  const upper = Math.floor(Math.max(min, maxExclusive));
  if (upper <= lower) return lower;

  return lower + Math.floor(rng() * (upper - lower));
}

export function pickOne<T>(
  items: readonly T[],
  rng: RandomSource = secureRandom,
): T | null {
  if (items.length === 0) return null;
  const index = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[index] ?? null;
}

/**
 * Picks an index from a list of non-negative weights. Returns null when no
 * positive weights exist. Uses a single RNG draw.
 */
export function weightedIndex(
  weights: readonly number[],
  rng: RandomSource = secureRandom,
): number | null {
  const safeWeights = weights.map((weight) =>
    Number.isFinite(weight) && weight > 0 ? weight : 0,
  );
  const total = safeWeights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return null;

  const target = Math.min(rng() * total, total - Number.EPSILON);
  let cursor = 0;

  for (let index = 0; index < safeWeights.length; index += 1) {
    cursor += safeWeights[index] ?? 0;
    if (target < cursor) return index;
  }

  return safeWeights.length - 1;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
