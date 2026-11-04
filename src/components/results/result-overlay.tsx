"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Heart,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { RESULT_HEADLINES } from "@/constants/seed";
import { pickOne } from "@/lib/random";
import { cn } from "@/lib/cn";
import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { ParticipantAvatar } from "@/components/participants/participant-avatar";
import { Confetti } from "./confetti";
import { buildResultSubline } from "./result-message";

export function ResultOverlay() {
  const result = useGameStore((state) => state.lastResult);
  const animationsEnabled = useGameStore(
    (state) => state.settings.animationsEnabled,
  );
  const canSpinAgain = useGameStore((state) => {
    const participantId = state.lastResult?.outcome.participantId;
    if (!participantId) return false;
    return (
      state.participants.some(
        (participant) => participant.id === participantId && participant.active,
      ) && state.punishments.some((punishment) => punishment.active)
    );
  });
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const acceptResult = useGameStore((state) => state.acceptResult);
  const skipResult = useGameStore((state) => state.skipResult);
  const dismissResult = useGameStore((state) => state.dismissResult);
  const spinAgain = useGameStore((state) => state.spinAgain);

  const headline = useMemo(
    () => (result ? (pickOne(RESULT_HEADLINES) ?? "OH NO! 😈") : "OH NO! 😈"),
    [result],
  );
  const subline = useMemo(
    () => buildResultSubline(result?.outcome.participantName ?? "Someone"),
    [result?.outcome.participantName],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!result || !dialog) return;

    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [result]);

  if (!result) return null;

  const { outcome } = result;
  const spinAgainAllowed = canSpinAgain;

  const handleAccept = () => {
    audio.accept();
    acceptResult();
    toast({
      title: "Punishment accepted 😈",
      description: "Absolute legend behaviour.",
      variant: "success",
    });
  };

  const handleSkip = () => {
    audio.skip();
    skipResult();
    toast({
      title: "Skipped — no pressure 💜",
      description: "Comfort always comes first.",
      variant: "info",
    });
  };

  const handleSpinAgain = () => {
    if (!spinAgainAllowed) return;
    spinAgain();
    toast({
      title: "One more round…",
      description: `${outcome.participantName} is feeling brave.`,
      variant: "default",
    });
  };

  const content = (
    <dialog
      ref={dialogRef}
      aria-labelledby="result-headline"
      className="fixed inset-0 z-[120] m-0 h-dvh w-screen max-w-none bg-transparent p-0"
      onCancel={(event) => {
        event.preventDefault();
        dismissResult();
      }}
      onClose={() => {
        if (useGameStore.getState().lastResult) dismissResult();
      }}
    >
      <div className="relative flex min-h-dvh w-full items-center justify-center overflow-y-auto p-3 py-8 sm:p-6">
        {animationsEnabled && !reducedMotion && <Confetti active />}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,rgba(168,85,247,0.24),transparent_72%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
          className="relative z-10 w-full max-w-xl"
        >
          <div className="glass-panel overflow-hidden rounded-[2rem] border-white/12 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
            <div className="relative px-5 pb-6 pt-8 text-center sm:px-8 sm:pb-8 sm:pt-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[130%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(244,114,182,0.2),transparent_65%)]"
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[0.64rem] font-bold uppercase tracking-[0.26em] text-pink-300/80"
              >
                The wheel has spoken
              </motion.p>

              <motion.h2
                id="result-headline"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14, type: "spring", stiffness: 250 }}
                className="mt-3 font-display text-4xl font-extrabold tracking-tight text-gradient-warm sm:text-5xl"
              >
                {headline}
              </motion.h2>

              <p className="mt-2 text-xs leading-relaxed text-white/40">
                {subline}
              </p>

              <div className="mt-7 flex flex-col items-center gap-2">
                <ParticipantAvatar
                  name={outcome.participantName}
                  color={outcome.participantColor}
                  size="xl"
                  ring
                />
                <p className="mt-1 font-display text-lg font-semibold text-white">
                  {outcome.participantName}
                </p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                  your punishment is…
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-5 sm:px-6">
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                  <DifficultyBadge
                    difficulty={outcome.punishment.difficulty}
                    size="md"
                  />
                  {outcome.punishment.category && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-medium text-white/45">
                      {outcome.punishment.category}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                  {outcome.punishment.title}
                </h3>
                {outcome.punishment.description && (
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/50">
                    {outcome.punishment.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  size="lg"
                  onClick={handleAccept}
                  autoFocus
                  className="w-full"
                >
                  <Check className="size-4" />
                  Accept punishment
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleSpinAgain}
                    disabled={!spinAgainAllowed}
                    title={
                      spinAgainAllowed
                        ? "Spin again for the same player"
                        : "Add an active player and punishment first"
                    }
                  >
                    <RotateCcw className="size-4" />
                    Spin again
                  </Button>
                  <Button variant="secondary" onClick={dismissResult}>
                    <ArrowLeft className="size-4" />
                    Back to game
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className={cn(
                  "mx-auto mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/40",
                  "transition hover:bg-white/[0.05] hover:text-white/70",
                )}
              >
                <Heart className="size-3" />
                Skip this one — no pressure
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-white/[0.06] bg-black/20 px-5 py-3 text-[0.64rem] leading-relaxed text-white/30">
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-300/60" />
              Keep it kind, safe and consensual. Everyone can opt out.
            </div>
          </div>
        </motion.div>
      </div>
    </dialog>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
