"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import {
  WHEEL_DURATION_MAX_MS,
  WHEEL_DURATION_MIN_MS,
  WHEEL_TURNS_MAX,
  WHEEL_TURNS_MIN,
} from "@/constants/difficulty";
import { audio } from "@/lib/audio";
import { normalizeAngle, computeTargetRotation } from "@/lib/wheel";
import { randomInt } from "@/lib/random";
import { toast } from "@/store/toast-store";
import { useGameStore } from "@/store/game-store";

const EASE = [0.1, 0.76, 0.08, 1] as const;

export function useWheelSpin() {
  const rotation = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const spinAgainToken = useGameStore((state) => state.spinAgainToken);
  const resetWheelToken = useGameStore((state) => state.resetWheelToken);

  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef(0);
  const lastTickTimeRef = useRef(0);
  const consumedSpinAgainRef = useRef(spinAgainToken);
  const consumedResetRef = useRef(resetWheelToken);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const spin = useCallback(() => {
    const state = useGameStore.getState();
    if (state.isSpinning) return;

    const request = state.requestSpin();
    if (!request.ok) {
      toast({ title: request.error, variant: "error" });
      return;
    }

    const { outcome } = request;
    const activeCount = state.punishments.filter((item) => item.active).length;
    if (activeCount === 0) return;

    const reduced = reducedMotion === true;
    const animations = state.settings.animationsEnabled;
    const extraTurns =
      !animations || reduced
        ? 2
        : randomInt(WHEEL_TURNS_MIN, WHEEL_TURNS_MAX + 1);
    const durationMs = !animations
      ? 450
      : reduced
        ? 1300
        : randomInt(WHEEL_DURATION_MIN_MS, WHEEL_DURATION_MAX_MS + 1);

    const currentRotation = rotation.get();
    const targetRotation = computeTargetRotation({
      currentRotation,
      index: outcome.punishmentIndex,
      segmentCount: activeCount,
      jitter: outcome.jitter,
      extraTurns,
    });

    const segmentAngle = 360 / activeCount;
    lastTickSegmentRef.current = Math.floor(rotation.get() / segmentAngle);
    lastTickTimeRef.current = 0;

    audio.spinStart();
    controlsRef.current?.stop();

    // The engine has already chosen the punishment. The wheel only animates
    // to the segment that owns that exact punishment.
    const controls = animate(rotation, targetRotation, {
      duration: durationMs / 1000,
      ease: EASE,
      onUpdate: (latest) => {
        const segment = Math.floor(latest / segmentAngle);
        if (segment !== lastTickSegmentRef.current) {
          lastTickSegmentRef.current = segment;
          const now = Date.now();
          if (now - lastTickTimeRef.current > 32) {
            lastTickTimeRef.current = now;
            audio.tick();
          }
        }
      },
      onComplete: () => {
        controlsRef.current = null;
        rotation.set(normalizeAngle(targetRotation));
        audio.reveal();

        clearRevealTimer();
        revealTimerRef.current = window.setTimeout(
          () => {
            revealTimerRef.current = null;
            const completed = useGameStore.getState().completeSpin();
            if (completed) {
              try {
                navigator.vibrate?.([24, 38, 56]);
              } catch {
                // Haptics are optional.
              }
            }
          },
          !animations ? 120 : reduced ? 220 : 420,
        );
      },
    });

    controlsRef.current = controls;
  }, [clearRevealTimer, reducedMotion, rotation]);

  // Triggered by "Spin Again" in the result modal.
  useEffect(() => {
    if (spinAgainToken === consumedSpinAgainRef.current) return;
    consumedSpinAgainRef.current = spinAgainToken;

    const timer = window.setTimeout(() => spin(), 90);
    return () => window.clearTimeout(timer);
  }, [spinAgainToken, spin]);

  // Triggered by resetApp / resetWheel. Returns the wheel to its upright pose.
  useEffect(() => {
    if (resetWheelToken === consumedResetRef.current) return;
    consumedResetRef.current = resetWheelToken;

    controlsRef.current?.stop();
    controlsRef.current = null;
    const upright = Math.ceil(rotation.get() / 360) * 360;
    animate(rotation, upright, {
      duration: 0.65,
      ease: EASE,
    });
  }, [resetWheelToken, rotation]);

  // Never leave the store locked if the wheel unmounts mid-spin.
  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      clearRevealTimer();
      if (useGameStore.getState().isSpinning) {
        useGameStore.getState().cancelSpin();
      }
    };
  }, [clearRevealTimer]);

  return { rotation, spin };
}
