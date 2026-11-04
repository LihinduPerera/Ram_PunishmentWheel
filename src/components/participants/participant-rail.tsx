"use client";

import Link from "next/link";
import { Check, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";
import type { Participant } from "@/types";
import { ParticipantAvatar } from "./participant-avatar";

export function ParticipantRail({
  participants,
  selectedId,
  totalParticipants,
  onSelect,
  className,
}: {
  participants: Participant[];
  selectedId: string | null;
  totalParticipants: number;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const isSpinning = useGameStore((state) => state.isSpinning);
  const inactiveCount = Math.max(0, totalParticipants - participants.length);

  return (
    <section
      className={cn("glass-panel rounded-3xl", className)}
      aria-labelledby="crew-heading"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Users className="size-3.5 text-fuchsia-300/70" />
          <h2
            id="crew-heading"
            className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/55"
          >
            The crew
          </h2>
          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[0.6rem] font-semibold tabular-nums text-white/40">
            {participants.length}
          </span>
        </div>
        <Link
          href="/participants"
          className="text-[0.65rem] font-semibold text-fuchsia-300/60 transition hover:text-fuchsia-200"
        >
          Manage
        </Link>
      </div>

      <div className="p-2.5">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
            <p className="text-sm font-medium text-white/55">
              Everyone&apos;s benched.
            </p>
            <p className="text-xs leading-relaxed text-white/35">
              Add players to choose tonight&apos;s victim.
            </p>
            <Link
              href="/participants"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300"
            >
              <UserPlus className="size-3.5" />
              Add players
            </Link>
          </div>
        ) : (
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible">
            {participants.map((participant) => {
              const selected = participant.id === selectedId;

              return (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => onSelect(participant.id)}
                  disabled={isSpinning}
                  aria-pressed={selected}
                  className={cn(
                    "group relative flex min-w-[168px] shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 lg:min-w-0 lg:w-full",
                    selected
                      ? "border-white/20 bg-white/[0.08] shadow-[0_8px_28px_-14px_rgba(0,0,0,0.9)]"
                      : "border-transparent bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.055]",
                    isSpinning && "cursor-not-allowed opacity-70",
                  )}
                  style={
                    selected
                      ? {
                          borderColor: `${participant.color}55`,
                          background: `linear-gradient(135deg, ${participant.color}1c, rgba(255,255,255,0.045))`,
                        }
                      : undefined
                  }
                >
                  <ParticipantAvatar
                    name={participant.name}
                    color={participant.color}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[0.82rem] font-semibold",
                        selected ? "text-white" : "text-white/70",
                      )}
                    >
                      {participant.name}
                    </span>
                    <span className="block text-[0.6rem] text-white/30">
                      {selected ? "Ready to spin" : "Tap to choose"}
                    </span>
                  </span>
                  {selected && (
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-night"
                      style={{ backgroundColor: participant.color }}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {inactiveCount > 0 && (
          <p className="px-2 pb-1 pt-2 text-[0.6rem] text-white/25">
            {inactiveCount} inactive {inactiveCount === 1 ? "player" : "players"}{" "}
            hidden
          </p>
        )}
      </div>
    </section>
  );
}
