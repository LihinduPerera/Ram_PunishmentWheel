export const WHEEL_POINTER_ANGLE = -90;
/**
 * Maximum fraction of half a slice used for landing jitter. The wheel never
 * lands closer than ~19% of a slice to a segment border.
 */
export const WHEEL_JITTER_FRACTION = 0.62;

export function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return ((angle % 360) + 360) % 360;
}

export function getSegmentAngle(segmentCount: number): number {
  if (segmentCount <= 0) return 0;
  return 360 / segmentCount;
}

/**
 * A segment's center in wheel-local coordinates. Segment 0 starts at the top
 * (-90deg) and segments proceed clockwise.
 */
export function getSegmentCenterAngle(
  index: number,
  segmentCount: number,
): number {
  const segmentAngle = getSegmentAngle(segmentCount);
  return WHEEL_POINTER_ANGLE + (index + 0.5) * segmentAngle;
}

export interface TargetRotationInput {
  currentRotation: number;
  index: number;
  segmentCount: number;
  /** Fraction in [-1, 1] of the allowed landing jitter. */
  jitter?: number;
  extraTurns?: number;
}

/**
 * Computes a clockwise target rotation that lands the pointer inside the
 * selected segment. This is the bridge that guarantees the animation agrees
 * with the punishment chosen by the engine.
 */
export function computeTargetRotation({
  currentRotation,
  index,
  segmentCount,
  jitter = 0,
  extraTurns = 7,
}: TargetRotationInput): number {
  if (segmentCount <= 0) return currentRotation;

  const safeIndex = Math.min(Math.max(0, index), segmentCount - 1);
  const segmentAngle = getSegmentAngle(segmentCount);
  const centerOffset = (safeIndex + 0.5) * segmentAngle;
  const safeJitter = Math.min(1, Math.max(-1, jitter));
  const jitterOffset = safeJitter * (segmentAngle / 2) * WHEEL_JITTER_FRACTION;

  // At rotation R the pointer sits at local angle (-90 - R). Solving for the
  // chosen center plus jitter gives R = -(center offset + jitter).
  const targetMod = normalizeAngle(-(centerOffset + jitterOffset));
  const currentMod = normalizeAngle(currentRotation);
  const forwardDelta = normalizeAngle(targetMod - currentMod);
  const turns = Math.max(0, Math.floor(extraTurns));

  return currentRotation + turns * 360 + forwardDelta;
}

/**
 * Resolves which segment is under the pointer for a given rotation. Mirrors
 * the geometry in computeTargetRotation and is used by tests and debugging.
 */
export function getWinningSegmentIndex(
  rotation: number,
  segmentCount: number,
): number {
  if (segmentCount <= 0) return -1;

  const segmentAngle = getSegmentAngle(segmentCount);
  const pointerLocal = normalizeAngle(WHEEL_POINTER_ANGLE - rotation);
  const offset = normalizeAngle(pointerLocal - WHEEL_POINTER_ANGLE);
  const index = Math.floor(offset / segmentAngle + 1e-9) % segmentCount;

  return index;
}

/** Converts a rotation into a friendly 0..359 degree value. */
export function getRotationDegrees(rotation: number): number {
  return Math.round(normalizeAngle(rotation));
}
