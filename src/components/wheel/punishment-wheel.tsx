"use client";

import { motion } from "motion/react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { DIFFICULTY_META, WHEEL_COLORS } from "@/constants/difficulty";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";
import {
  useActivePunishments,
  useCanSpin,
  useSelectedParticipant,
} from "@/store/selectors";
import { WheelSvg } from "./wheel-svg";
import { useWheelSpin } from "./use-wheel-spin";

function Pointer() {
  return (
    <div className="wheel-pointer" aria-hidden="true">
      <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
        <defs>
          <linearGradient id="pointer-gradient" x1="8" y1="6" x2="46" y2="58">
            <stop stopColor="#fda4af" />
            <stop offset="0.45" stopColor="#f472b6" />
            <stop offset="1" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <path
          d="M27 64C24.2 64 21.8 62.5 20.4 60L3.2 22.4C-0.7 13.8 5.6 4 15 4H39C48.4 4 54.7 13.8 50.8 22.4L32.9 59.4C31.6 62.3 29 64 27 64Z"
          fill="url(#pointer-gradient)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />
        <circle cx="27" cy="18" r="5.5" fill="rgba(255,255,255,0.9)" />
        <circle cx="27" cy="18" r="2.2" fill="#be185d" />
      </svg>
    </div>
  );
}

export function PunishmentWheel({ className }: { className?: string }) {
  const activePunishments = useActivePunishments();
  const selectedParticipant = useSelectedParticipant();
  const canSpin = useCanSpin();
  const isSpinning = useGameStore((state) => state.isSpinning);
  const lastResult = useGameStore((state) => state.lastResult);
  const { rotation, spin } = useWheelSpin();

  const spinDisabled = !canSpin || isSpinning;
  const helperText = !selectedParticipant
    ? "Pick a player to unlock the wheel"
    : activePunishments.length === 0
      ? "Add an active punishment to unlock the wheel"
      : isSpinning
        ? "Round and round it goes…"
        : "Locked and loaded";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-full">
        <div className="wheel-outer-glow" aria-hidden="true" />

        <div className="wheel-shell">
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ rotate: rotation }}
          >
            <WheelSvg punishments={activePunishments} />
          </motion.div>

          <Pointer />

          <button
            type="button"
            className="spin-hub group"
            onClick={spin}
            disabled={spinDisabled}
            aria-label={
              isSpinning
                ? "Wheel is spinning"
                : selectedParticipant
                  ? `Spin the wheel for ${selectedParticipant.name}`
                  : "Spin the wheel — select a player first"
            }
          >
            <span className="flex flex-col items-center gap-1">
              {isSpinning ? (
                <Loader2 className="size-5 animate-spin sm:size-6" />
              ) : (
                <Play
                  className="size-5 fill-current transition-transform duration-200 group-hover:scale-110 sm:size-6"
                  strokeWidth={1.5}
                />
              )}
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/85 sm:text-[0.62rem]">
                {isSpinning ? "Wait" : "Spin"}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="mt-7 flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {(["easy", "medium", "hard"] as const).map((difficulty) => (
            <span
              key={difficulty}
              className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium text-white/40"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: WHEEL_COLORS[difficulty][1],
                  boxShadow: `0 0 8px ${DIFFICULTY_META[difficulty].color}66`,
                }}
              />
              {DIFFICULTY_META[difficulty].label}
            </span>
          ))}
          <span className="text-[0.65rem] text-white/25">
            {activePunishments.length} on the wheel
          </span>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinDisabled}
          className={cn(
            "group relative inline-flex h-13 w-full max-w-sm items-center justify-center gap-2.5 overflow-hidden rounded-full border px-6 text-sm font-bold tracking-wide transition-all duration-200",
            spinDisabled
              ? "cursor-not-allowed border-white/[0.07] bg-white/[0.04] text-white/30"
              : "border-white/20 bg-gradient-to-b from-fuchsia-500 to-purple-600 text-white shadow-[0_12px_45px_-12px_rgba(217,70,239,0.85)] hover:from-fuchsia-400 hover:to-purple-500 hover:shadow-[0_16px_55px_-10px_rgba(244,114,182,0.7)] active:scale-[0.985]",
          )}
        >
          {!spinDisabled && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 transition group-hover:animate-[shimmer_1.8s_linear_infinite] group-hover:opacity-100"
            />
          )}
          <Sparkles className="relative size-4" />
          <span className="relative truncate">
            {isSpinning
              ? "Spinning…"
              : selectedParticipant
                ? `Spin for ${selectedParticipant.name}`
                : "Spin the wheel"}
          </span>
          {selectedParticipant && !isSpinning && (
            <span
              className="relative size-2 rounded-full"
              style={{
                backgroundColor: selectedParticipant.color,
                boxShadow: `0 0 10px ${selectedParticipant.color}`,
              }}
            />
          )}
        </button>

        <p className="text-center text-xs text-white/35">
          {helperText}
          {lastResult && !isSpinning && (
            <span className="block pt-1 text-white/25">
              Last spin: {lastResult.outcome.punishment.title}
            </span>
          )}
        </p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {isSpinning
          ? `The wheel is spinning for ${selectedParticipant?.name ?? "the selected player"}.`
          : lastResult
            ? `${lastResult.outcome.participantName} received ${lastResult.outcome.punishment.title}.`
            : "Wheel ready."}
      </p>
    </div>
  );
}
