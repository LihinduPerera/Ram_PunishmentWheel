"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Dices,
  Flame,
  MinusCircle,
  Skull,
  Trash2,
  Trophy,
} from "lucide-react";
import { DIFFICULTY_META } from "@/constants/difficulty";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/dates";
import {
  computeStatistics,
  getDifficultyBreakdown,
} from "@/lib/statistics";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import type { HistoryStatus } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard, SectionCardHeader } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { ParticipantAvatar } from "@/components/participants/participant-avatar";
import { HistoryRow } from "@/components/history/history-row";

type HistoryFilter = "all" | HistoryStatus;

const FILTER_OPTIONS: Array<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "accepted", label: "Accepted" },
  { value: "skipped", label: "Skipped" },
  { value: "pending", label: "Unresolved" },
];

export function HistoryScreen() {
  const history = useGameStore((state) => state.history);
  const clearHistory = useGameStore((state) => state.clearHistory);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = useMemo(() => computeStatistics(history), [history]);
  const breakdown = useMemo(
    () => getDifficultyBreakdown(stats.byDifficulty),
    [stats.byDifficulty],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((entry) => entry.status === filter);
  }, [filter, history]);

  const skipRate =
    stats.totalSpins > 0
      ? Math.round((stats.totalSkipped / stats.totalSpins) * 100)
      : 0;

  const handleClear = () => {
    clearHistory();
    toast({
      title: "History cleared",
      description: "Fresh slate. The wheel remembers nothing.",
      variant: "info",
    });
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
      <PageHeader
        eyebrow="Receipts"
        title="History & stats"
        description="Every spin is recorded with a snapshot, so the numbers stay honest even after players or punishments are deleted."
        actions={
          history.length > 0 ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          ) : (
            <Link
              href="/"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Play a round
              <ArrowRight className="size-3.5" />
            </Link>
          )
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard
          label="Total spins"
          value={String(stats.totalSpins)}
          hint={stats.lastSpinAt ? formatRelativeTime(stats.lastSpinAt) : "no spins yet"}
          icon={Dices}
          accent="#c084fc"
        />
        <StatCard
          label="Punishments served"
          value={String(stats.totalReceived)}
          hint={`${skipRate}% skipped`}
          icon={Flame}
          accent="#fb923c"
        />
        <StatCard
          label="Skips"
          value={String(stats.totalSkipped)}
          hint={stats.totalSpins - stats.totalSkipped > 0 ? "mercy is allowed" : "no skips yet"}
          icon={MinusCircle}
          accent="#38bdf8"
        />
        <StatCard
          label="Most unlucky"
          value={stats.mostUnlucky?.name ?? "—"}
          hint={
            stats.mostUnlucky
              ? `${stats.mostUnlucky.received} served`
              : "waiting for data"
          }
          icon={Skull}
          accent="#fb7185"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <SectionCard>
            <SectionCardHeader
              title="Difficulty mix"
              description="All spins, including skipped ones"
              icon={<BarChart3 className="size-4" />}
            />
            <div className="space-y-4 p-5">
              {breakdown.map((item) => (
                <div key={item.difficulty}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-white/60">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor: DIFFICULTY_META[item.difficulty].color,
                        }}
                      />
                      {DIFFICULTY_META[item.difficulty].label}
                    </span>
                    <span className="text-[0.65rem] tabular-nums text-white/35">
                      {item.count} · {Math.round(item.percentage)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        background: `linear-gradient(90deg, ${
                          DIFFICULTY_META[item.difficulty].color
                        }55, ${DIFFICULTY_META[item.difficulty].color})`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {stats.totalSpins === 0 && (
                <p className="text-[0.68rem] text-white/30">
                  Spin the wheel to start building the breakdown.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionCardHeader
              title="Leaderboard"
              description="Who's been punished the most"
              icon={<Trophy className="size-4" />}
            />
            <div className="p-2.5">
              {stats.perParticipant.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs leading-relaxed text-white/30">
                  No victims yet. Give the wheel a spin.
                </p>
              ) : (
                <ol className="space-y-0.5">
                  {stats.perParticipant.map((participant, index) => (
                    <li
                      key={participant.participantId}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.035]"
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold tabular-nums",
                          index === 0
                            ? "bg-amber-400/15 text-amber-300"
                            : index === 1
                              ? "bg-slate-300/10 text-slate-200/80"
                              : index === 2
                                ? "bg-orange-400/10 text-orange-300/70"
                                : "bg-white/[0.05] text-white/30",
                        )}
                      >
                        {index + 1}
                      </span>
                      <ParticipantAvatar
                        name={participant.name}
                        color={participant.color}
                        size="xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white/75">
                          {participant.name}
                        </p>
                        <p className="text-[0.6rem] text-white/30">
                          {participant.spins}{" "}
                          {participant.spins === 1 ? "spin" : "spins"} ·{" "}
                          {participant.skipped} skipped
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold tabular-nums text-white/65">
                          {participant.received}
                        </p>
                        <p className="text-[0.55rem] uppercase tracking-wide text-white/25">
                          served
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </SectionCard>

          <SectionCard className="overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-fuchsia-200/70">
                <CalendarClock className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Easiest punishment received
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-white/65">
                  {stats.easiestReceived
                    ? stats.easiestReceived.punishmentTitle
                    : "Nothing yet"}
                </p>
                {stats.easiestReceived && (
                  <p className="text-[0.6rem] text-white/30">
                    {stats.easiestReceived.participantName} ·{" "}
                    {formatRelativeTime(stats.easiestReceived.timestamp)}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard>
          <SectionCardHeader
            title="Spin history"
            description={
              history.length > 0
                ? `${history.length} recorded ${
                    history.length === 1 ? "spin" : "spins"
                  }`
                : "Nothing has happened yet"
            }
            icon={<Dices className="size-4" />}
            action={
              history.length > 0 ? (
                <div
                  role="group"
                  aria-label="Filter history by status"
                  className="inline-flex rounded-full border border-white/[0.07] bg-black/25 p-0.5"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={filter === option.value}
                      onClick={() => setFilter(option.value)}
                      className={cn(
                        "rounded-full px-2 py-1 text-[0.6rem] font-semibold transition",
                        filter === option.value
                          ? "bg-white/[0.1] text-white"
                          : "text-white/35 hover:text-white/65",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : undefined
            }
          />

          <div className="p-2.5">
            {history.length === 0 ? (
              <EmptyState
                icon={Dices}
                title="No spins recorded"
                description="Head to the wheel and start the chaos. Every result — accepted, skipped, or simply revealed — lands here."
                action={
                  <Link
                    href="/"
                    className={buttonStyles({ variant: "primary", size: "md" })}
                  >
                    Go to the wheel
                    <ArrowRight className="size-4" />
                  </Link>
                }
              />
            ) : filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-white/55">
                  No {filter} spins
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Try a different filter.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setFilter("all")}
                >
                  Show all
                </Button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} showStatus />
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all history?"
        description={`This permanently deletes ${history.length} recorded ${
          history.length === 1 ? "spin" : "spins"
        } and resets every statistic. Players, punishments, and settings are kept.`}
        confirmLabel="Clear everything"
        onConfirm={handleClear}
      />
    </div>
  );
}
