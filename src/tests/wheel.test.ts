import { describe, expect, it } from "vitest";
import {
  WHEEL_JITTER_FRACTION,
  WHEEL_POINTER_ANGLE,
  computeTargetRotation,
  getRotationDegrees,
  getSegmentAngle,
  getSegmentCenterAngle,
  getWinningSegmentIndex,
  normalizeAngle,
} from "@/lib/wheel";

describe("wheel geometry", () => {
  it("normalizes angles into 0..360", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(725)).toBe(5);
    expect(normalizeAngle(Number.NaN)).toBe(0);
  });

  it("computes segment angles and centres", () => {
    expect(getSegmentAngle(0)).toBe(0);
    expect(getSegmentAngle(18)).toBe(20);
    expect(getSegmentCenterAngle(0, 18)).toBe(WHEEL_POINTER_ANGLE + 10);
    expect(getSegmentCenterAngle(17, 18)).toBe(WHEEL_POINTER_ANGLE + 350);
  });

  it("lands the pointer inside the selected segment for every segment", () => {
    for (const segmentCount of [1, 2, 5, 18, 36]) {
      for (let index = 0; index < segmentCount; index += 1) {
        for (const jitter of [-1, -0.62, -0.2, 0, 0.2, 0.62, 1]) {
          for (const currentRotation of [0, 17, 359.9, 12345.67, -45]) {
            const target = computeTargetRotation({
              currentRotation,
              index,
              segmentCount,
              jitter,
              extraTurns: 7,
            });

            expect(getWinningSegmentIndex(target, segmentCount)).toBe(index);
            expect(target).toBeGreaterThan(currentRotation);
          }
        }
      }
    }
  });

  it("always spins clockwise by at least the requested turns", () => {
    const target = computeTargetRotation({
      currentRotation: 1_234,
      index: 3,
      segmentCount: 18,
      jitter: 0.3,
      extraTurns: 5,
    });

    expect(target - 1_234).toBeGreaterThanOrEqual(5 * 360);
    expect(target - 1_234).toBeLessThan(6 * 360 + 360);
  });

  it("clamps out-of-range jitter and indices instead of escaping the segment", () => {
    const segmentCount = 12;

    const clamped = computeTargetRotation({
      currentRotation: 0,
      index: 99,
      segmentCount,
      jitter: 8,
      extraTurns: 1,
    });
    expect(getWinningSegmentIndex(clamped, segmentCount)).toBe(segmentCount - 1);

    const negative = computeTargetRotation({
      currentRotation: 0,
      index: -10,
      segmentCount,
      jitter: -8,
      extraTurns: 1,
    });
    expect(getWinningSegmentIndex(negative, segmentCount)).toBe(0);
  });

  it("handles degenerate segment counts", () => {
    expect(
      computeTargetRotation({
        currentRotation: 123,
        index: 1,
        segmentCount: 0,
      }),
    ).toBe(123);
    expect(getWinningSegmentIndex(100, 0)).toBe(-1);
  });

  it("keeps landing jitter away from segment borders", () => {
    const segmentCount = 18;
    const segmentAngle = getSegmentAngle(segmentCount);

    for (let index = 0; index < segmentCount; index += 1) {
      const target = computeTargetRotation({
        currentRotation: 200,
        index,
        segmentCount,
        jitter: 1,
        extraTurns: 3,
      });
      const center = getSegmentCenterAngle(index, segmentCount);

      // Rotation R puts the pointer at local angle -90 - R. With full jitter
      // the pointer should still sit inside the centre 62% of the slice.
      const pointerLocal = normalizeAngle(WHEEL_POINTER_ANGLE - target);
      const pointerOffset = normalizeAngle(pointerLocal - WHEEL_POINTER_ANGLE);
      const localCentre = normalizeAngle(center - WHEEL_POINTER_ANGLE);
      const angularDistance = Math.abs(
        (((pointerOffset - localCentre + 540) % 360) - 180),
      );

      expect(getWinningSegmentIndex(target, segmentCount)).toBe(index);
      expect(angularDistance).toBeLessThanOrEqual(
        segmentAngle * 0.5 * WHEEL_JITTER_FRACTION + 1e-9,
      );
      expect(angularDistance).toBeLessThan(segmentAngle / 2);
    }
  });

  it("reports friendly rotation degrees", () => {
    expect(getRotationDegrees(-90)).toBe(270);
    expect(getRotationDegrees(360.4)).toBe(0);
    expect(getRotationDegrees(12.6)).toBe(13);
  });
});
