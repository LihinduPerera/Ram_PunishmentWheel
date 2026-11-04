"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, History } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { computeStatistics } from "@/lib/statistics";
import { HistoryRow, HistoryEmptyHint } from "@/components/history/history-row";
import { SectionCard, SectionCardHeader } from "@/components/ui/section-card";

export function RecentSpins({ limit = 5 }: { limit?: number }) {
  const history = useGameStore((state) => state.history);
  const stats = useMemo(() => computeStatistics(history), [history]);
  const recent = history.slice(0, limit);

  return (
    <SectionCard>
      <SectionCardHeader
        title="Recent spins"
        description={
          stats.totalSpins > 0
            ? `${stats.totalSpins} ${
                stats.totalSpins === 1 ? "spin" : "spins"
              } so far tonight`
            : "The story starts with one spin"
        }
        icon={<History className="size-4" />}
        action={
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-fuchsia-300/60 transition hover:text-fuchsia-200"
          >
            All stats
            <ArrowRight className="size-3" />
          </Link>
        }
      />

      <div className="p-2.5">
        {recent.length === 0 ? (
          <HistoryEmptyHint />
        ) : (
          <div className="space-y-0.5">
            {recent.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} compact showStatus />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
