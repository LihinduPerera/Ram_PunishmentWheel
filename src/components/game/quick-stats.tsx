"use client";

import { useMemo } from "react";
import { Dices, Flame, Skull, Users } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { computeStatistics } from "@/lib/statistics";
import { StatCard } from "@/components/ui/stat-card";

export function QuickStats() {
  const history = useGameStore((state) => state.history);
  const participants = useGameStore((state) => state.participants);
  const activeCount = participants.filter(
    (participant) => participant.active,
  ).length;

  const stats = useMemo(() => computeStatistics(history), [history]);
  const skipRate =
    stats.totalSpins > 0
      ? Math.round((stats.totalSkipped / stats.totalSpins) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatCard
        label="Total spins"
        value={String(stats.totalSpins)}
        hint="all time"
        icon={Dices}
        accent="#c084fc"
      />
      <StatCard
        label="Served"
        value={String(stats.totalReceived)}
        hint={stats.totalSkipped > 0 ? `${skipRate}% skipped` : "no skips"}
        icon={Flame}
        accent="#fb923c"
      />
      <StatCard
        label="Crew active"
        value={String(activeCount)}
        hint={`${participants.length} total`}
        icon={Users}
        accent="#38bdf8"
      />
      <StatCard
        label="Most unlucky"
        value={stats.mostUnlucky?.name ?? "—"}
        hint={
          stats.mostUnlucky
            ? `${stats.mostUnlucky.received} served`
            : "no data yet"
        }
        icon={Skull}
        accent="#fb7185"
      />
    </div>
  );
}
