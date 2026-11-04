"use client";

import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "@/store/game-store";
import {
  useActiveParticipants,
  useActivePunishments,
  useSelectedParticipant,
} from "@/store/selectors";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { ParticipantRail } from "@/components/participants/participant-rail";
import { PunishmentWheel } from "@/components/wheel/punishment-wheel";
import { RecentSpins } from "./recent-spins";
import { QuickStats } from "./quick-stats";

export function GameScreen() {
  const participants = useGameStore((state) => state.participants);
  const activePunishments = useActivePunishments();
  const activeParticipants = useActiveParticipants();
  const selectedParticipant = useSelectedParticipant();
  const selectedParticipantId = useGameStore(
    (state) => state.selectedParticipantId,
  );
  const isSpinning = useGameStore((state) => state.isSpinning);
  const selectParticipant = useGameStore((state) => state.selectParticipant);
  const resetWheel = useGameStore((state) => state.resetWheel);

  const handleSelect = (id: string) => {
    const result = selectParticipant(id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
    }
  };

  const handleReset = () => {
    const result = resetWheel();
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Wheel reset",
      description: "Pick a new victim when you're ready.",
      variant: "info",
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
      <PageHeader
        eyebrow="Game night"
        title="Spin for a punishment"
        description="Pick tonight's victim, give the wheel a whirl, and let fate handle the rest. Keep it kind, keep it consensual, keep it chaotic."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={isSpinning}
            >
              <RotateCcw className="size-3.5" />
              Reset wheel
            </Button>
            <Link
              href="/settings"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              <SlidersHorizontal className="size-3.5" />
              Tune the odds
            </Link>
          </>
        }
      />

      {activePunishments.length === 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-amber-100/75">
              <span className="font-semibold text-amber-100">
                The wheel is empty.
              </span>{" "}
              Activate at least one punishment before you can spin.
            </p>
          </div>
          <Link
            href="/punishments"
            className={buttonStyles({
              variant: "secondary",
              size: "sm",
              className: "shrink-0",
            })}
          >
            Manage punishments
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <SectionCard className="relative overflow-hidden px-4 py-6 sm:px-8 sm:py-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(168,85,247,0.16),transparent_70%)]"
          />
          <div className="relative">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.65rem] font-semibold text-white/55">
                <Sparkles className="size-3 text-fuchsia-300/80" />
                {selectedParticipant
                  ? `${selectedParticipant.name} is on the spot`
                  : "Waiting for a victim"}
              </span>
              {activePunishments.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.65rem] font-semibold text-white/40">
                  {activePunishments.length} dares loaded
                </span>
              )}
            </div>

            <PunishmentWheel />
          </div>
        </SectionCard>

        <div className="flex flex-col gap-4">
          <ParticipantRail
            participants={activeParticipants}
            selectedId={selectedParticipantId}
            totalParticipants={participants.length}
            onSelect={handleSelect}
          />
          <QuickStats />
          <RecentSpins />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Pick a player",
            description:
              "Tap someone from the crew. Their odds are already tuned in the background.",
          },
          {
            title: "Spin the wheel",
            description:
              "Every dare stays on the wheel. The engine secretly rolls the odds, then the wheel lands on it.",
          },
          {
            title: "Accept or skip",
            description:
              "Every result is saved to history. Skips are always allowed — comfort comes first.",
          },
        ].map((item, index) => (
          <div
            key={item.title}
            className={cn(
              "glass-panel-soft rounded-2xl px-4 py-4",
              index === 0 && "sm:rounded-r-xl",
              index === 2 && "sm:rounded-l-xl",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-fuchsia-500/15 text-[0.6rem] font-bold text-fuchsia-200">
                {index + 1}
              </span>
              <h3 className="text-xs font-semibold text-white/80">
                {item.title}
              </h3>
            </div>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-white/35">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/10 bg-emerald-500/[0.035] px-4 py-3 text-center text-[0.68rem] leading-relaxed text-white/35">
        <ShieldCheck className="size-3.5 shrink-0 text-emerald-300/60" />
        House rule: everyone can opt out at any time. No pressure, no
        hard feelings.
      </div>
    </div>
  );
}
