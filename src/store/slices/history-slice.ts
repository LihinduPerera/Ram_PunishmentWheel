import type { StateCreator } from "zustand";
import { HISTORY_LIMIT } from "@/constants/difficulty";
import { randomId } from "@/lib/random";
import type { HistoryEntry, SpinResult } from "@/types";
import type { GameStore, HistoryActions } from "@/store/types";

export const createHistorySlice: StateCreator<
  GameStore,
  [],
  [],
  HistoryActions
> = (set, get) => ({
  completeSpin: (): SpinResult | null => {
    const outcome = get().pendingOutcome;
    if (!outcome || !get().isSpinning) return null;

    const entry: HistoryEntry = {
      id: randomId("history"),
      participantId: outcome.participantId,
      participantName: outcome.participantName,
      participantColor: outcome.participantColor,
      punishmentId: outcome.punishment.id,
      punishmentTitle: outcome.punishment.title,
      punishmentDifficulty: outcome.punishment.difficulty,
      punishmentCategory: outcome.punishment.category,
      timestamp: Date.now(),
      status: "pending",
    };

    set({
      history: [entry, ...get().history].slice(0, HISTORY_LIMIT),
      isSpinning: false,
      pendingOutcome: null,
      lastResult: { outcome, historyId: entry.id },
    });

    return { outcome, historyId: entry.id };
  },

  acceptResult: () => {
    const result = get().lastResult;
    if (!result) return;

    set({
      history: get().history.map((entry) =>
        entry.id === result.historyId
          ? { ...entry, status: "accepted" }
          : entry,
      ),
      lastResult: null,
    });
  },

  skipResult: () => {
    const result = get().lastResult;
    if (!result) return;

    set({
      history: get().history.map((entry) =>
        entry.id === result.historyId
          ? { ...entry, status: "skipped" }
          : entry,
      ),
      lastResult: null,
    });
  },

  dismissResult: () => {
    set({ lastResult: null });
  },

  clearHistory: () => {
    set({ history: [], lastResult: null });
  },
});
