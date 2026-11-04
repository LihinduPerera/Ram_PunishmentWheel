import { describe, expect, it } from "vitest";
import {
  computeStatistics,
  getDifficultyBreakdown,
  getParticipantStats,
} from "@/lib/statistics";
import type { Difficulty, HistoryEntry, HistoryStatus } from "@/types";

function entry({
  id,
  participantId,
  participantName,
  difficulty,
  status,
  timestamp,
}: {
  id: string;
  participantId: string;
  participantName: string;
  difficulty: Difficulty;
  status: HistoryStatus;
  timestamp: number;
}): HistoryEntry {
  return {
    id,
    participantId,
    participantName,
    participantColor: "#c084fc",
    punishmentId: `punish-${id}`,
    punishmentTitle: `Punishment ${id}`,
    punishmentDifficulty: difficulty,
    timestamp,
    status,
  };
}

const history: HistoryEntry[] = [
  entry({
    id: "1",
    participantId: "player-lihindu",
    participantName: "Lihindu",
    difficulty: "easy",
    status: "accepted",
    timestamp: 100,
  }),
  entry({
    id: "2",
    participantId: "player-lihindu",
    participantName: "Lihindu",
    difficulty: "hard",
    status: "skipped",
    timestamp: 200,
  }),
  entry({
    id: "3",
    participantId: "player-ravindu",
    participantName: "Ravindu",
    difficulty: "medium",
    status: "pending",
    timestamp: 300,
  }),
  entry({
    id: "4",
    participantId: "player-ravindu",
    participantName: "Ravindu",
    difficulty: "hard",
    status: "accepted",
    timestamp: 400,
  }),
];

describe("statistics", () => {
  it("derives totals, tiers, and the leaderboard from history", () => {
    const stats = computeStatistics(history);

    expect(stats.totalSpins).toBe(4);
    expect(stats.totalReceived).toBe(3);
    expect(stats.totalSkipped).toBe(1);
    expect(stats.lastSpinAt).toBe(400);
    expect(stats.byDifficulty).toEqual({ easy: 1, medium: 1, hard: 2 });

    expect(stats.perParticipant).toHaveLength(2);
    expect(stats.perParticipant[0]?.name).toBe("Ravindu");
    expect(stats.perParticipant[0]?.spins).toBe(2);
    expect(stats.perParticipant[0]?.received).toBe(2);
    expect(stats.perParticipant[0]?.skipped).toBe(0);
    expect(stats.perParticipant[0]?.lastPlayedAt).toBe(400);

    expect(stats.perParticipant[1]?.name).toBe("Lihindu");
    expect(stats.perParticipant[1]?.spins).toBe(2);
    expect(stats.perParticipant[1]?.received).toBe(1);
    expect(stats.perParticipant[1]?.skipped).toBe(1);
    expect(stats.perParticipant[1]?.lastPlayedAt).toBe(200);

    expect(stats.mostUnlucky?.participantId).toBe("player-ravindu");
    expect(stats.easiestReceived?.id).toBe("1");
  });

  it("returns empty statistics for an empty history", () => {
    const stats = computeStatistics([]);

    expect(stats.totalSpins).toBe(0);
    expect(stats.totalReceived).toBe(0);
    expect(stats.totalSkipped).toBe(0);
    expect(stats.perParticipant).toHaveLength(0);
    expect(stats.mostUnlucky).toBeNull();
    expect(stats.easiestReceived).toBeNull();
    expect(stats.lastSpinAt).toBeNull();
    expect(stats.byDifficulty).toEqual({ easy: 0, medium: 0, hard: 0 });
  });

  it("counts a pending reveal as received", () => {
    const stats = computeStatistics([history[2]!]);
    expect(stats.totalReceived).toBe(1);
    expect(stats.totalSkipped).toBe(0);
  });

  it("picks the most recent punishment within the easiest tier", () => {
    const stats = computeStatistics([
      entry({
        id: "a",
        participantId: "p1",
        participantName: "P1",
        difficulty: "easy",
        status: "accepted",
        timestamp: 50,
      }),
      entry({
        id: "b",
        participantId: "p2",
        participantName: "P2",
        difficulty: "easy",
        status: "accepted",
        timestamp: 90,
      }),
    ]);

    expect(stats.easiestReceived?.id).toBe("b");
  });

  it("looks up a participant and computes difficulty percentages", () => {
    const stats = computeStatistics(history);
    expect(
      getParticipantStats(stats, "player-lihindu")?.received,
    ).toBe(1);
    expect(getParticipantStats(stats, "missing")).toBeNull();

    const breakdown = getDifficultyBreakdown(stats.byDifficulty);
    expect(breakdown).toEqual([
      { difficulty: "easy", count: 1, percentage: 25 },
      { difficulty: "medium", count: 1, percentage: 25 },
      { difficulty: "hard", count: 2, percentage: 50 },
    ]);

    expect(getDifficultyBreakdown({ easy: 0, medium: 0, hard: 0 })).toEqual([
      { difficulty: "easy", count: 0, percentage: 0 },
      { difficulty: "medium", count: 0, percentage: 0 },
      { difficulty: "hard", count: 0, percentage: 0 },
    ]);
  });
});
