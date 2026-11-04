import {
  DIFFICULTIES,
  DIFFICULTY_RANK,
  type Difficulty,
  type HistoryEntry,
  type ParticipantStats,
  type Statistics,
} from "@/types";

/**
 * All statistics are derived from history, never stored separately. This keeps
 * the numbers correct after participant edits, punishment deletions, resets,
 * and SKIP actions.
 */
export function computeStatistics(
  history: readonly HistoryEntry[],
): Statistics {
  const participantMap = new Map<string, ParticipantStats>();
  const byDifficulty: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  let totalReceived = 0;
  let totalSkipped = 0;
  let easiestReceived: HistoryEntry | null = null;
  let lastSpinAt: number | null = null;

  for (const entry of history) {
    const existing = participantMap.get(entry.participantId);
    const stats: ParticipantStats =
      existing ??
      {
        participantId: entry.participantId,
        name: entry.participantName,
        color: entry.participantColor,
        spins: 0,
        received: 0,
        skipped: 0,
        lastPlayedAt: null,
      };

    stats.name = entry.participantName;
    stats.color = entry.participantColor;
    stats.spins += 1;
    stats.lastPlayedAt = Math.max(stats.lastPlayedAt ?? 0, entry.timestamp);
    byDifficulty[entry.punishmentDifficulty] += 1;

    if (entry.status === "skipped") {
      stats.skipped += 1;
      totalSkipped += 1;
    } else {
      stats.received += 1;
      totalReceived += 1;

      if (
        !easiestReceived ||
        DIFFICULTY_RANK[entry.punishmentDifficulty] <
          DIFFICULTY_RANK[easiestReceived.punishmentDifficulty] ||
        (entry.punishmentDifficulty ===
          easiestReceived.punishmentDifficulty &&
          entry.timestamp > easiestReceived.timestamp)
      ) {
        easiestReceived = entry;
      }
    }

    lastSpinAt = Math.max(lastSpinAt ?? 0, entry.timestamp);
    participantMap.set(entry.participantId, stats);
  }

  const perParticipant = Array.from(participantMap.values()).sort((a, b) => {
    if (b.received !== a.received) return b.received - a.received;
    if (b.spins !== a.spins) return b.spins - a.spins;
    return (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0);
  });

  const mostUnlucky =
    perParticipant.find((participant) => participant.received > 0) ?? null;

  return {
    totalSpins: history.length,
    totalReceived,
    totalSkipped,
    perParticipant,
    mostUnlucky,
    easiestReceived,
    byDifficulty,
    lastSpinAt,
  };
}

export function getParticipantStats(
  statistics: Statistics,
  participantId: string,
): ParticipantStats | null {
  return (
    statistics.perParticipant.find(
      (participant) => participant.participantId === participantId,
    ) ?? null
  );
}

export function getDifficultyBreakdown(
  byDifficulty: Record<Difficulty, number>,
): Array<{ difficulty: Difficulty; count: number; percentage: number }> {
  const total = DIFFICULTIES.reduce(
    (sum, difficulty) => sum + byDifficulty[difficulty],
    0,
  );

  return DIFFICULTIES.map((difficulty) => ({
    difficulty,
    count: byDifficulty[difficulty],
    percentage: total > 0 ? (byDifficulty[difficulty] / total) * 100 : 0,
  }));
}
