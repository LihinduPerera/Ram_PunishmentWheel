import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/constants/difficulty";
import { cloneSeedParticipants, cloneSeedPunishments } from "@/constants/seed";
import {
  appPersistStorage,
  clearPersistedState,
  readPersistedState,
  sanitizePersistedState,
  STORAGE_KEY,
} from "@/lib/storage";
import type { HistoryEntry } from "@/types";
import type { PersistedGameState } from "@/store/types";

function validState(overrides: Partial<PersistedGameState> = {}): PersistedGameState {
  return {
    participants: cloneSeedParticipants(),
    punishments: cloneSeedPunishments(),
    history: [],
    settings: DEFAULT_SETTINGS,
    selectedParticipantId: null,
    ...overrides,
  };
}

function historyEntry(
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry {
  return {
    id: "history-1",
    participantId: "player-lihindu",
    participantName: "Lihindu",
    participantColor: "#c084fc",
    punishmentId: "punish-sing-20",
    punishmentTitle: "Sing a song for 20 seconds",
    punishmentDifficulty: "easy",
    timestamp: 100,
    status: "pending",
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("persisted state sanitization", () => {
  it("rejects non-object payloads", () => {
    expect(sanitizePersistedState(null)).toBeNull();
    expect(sanitizePersistedState("nope")).toBeNull();
    expect(sanitizePersistedState(42)).toBeNull();
  });

  it("accepts both raw domain objects and Zustand wrappers", () => {
    const direct = sanitizePersistedState(validState());
    expect(direct?.participants).toHaveLength(6);
    expect(direct?.punishments).toHaveLength(18);

    const wrapped = sanitizePersistedState({
      state: validState(),
      version: 1,
    });
    expect(wrapped?.participants).toHaveLength(6);
  });

  it("drops invalid items, deduplicates IDs, and falls back to seeds for total corruption", () => {
    const first = cloneSeedParticipants()[0]!;
    const partial = sanitizePersistedState({
      participants: [
        first,
        { ...first },
        { id: "missing-fields" },
        null,
      ],
    });

    expect(partial?.participants).toHaveLength(1);
    expect(partial?.participants[0]?.id).toBe(first.id);

    const corrupted = sanitizePersistedState({
      participants: [{ id: "x" }],
      punishments: [{ id: "y" }],
    });
    expect(corrupted?.participants).toHaveLength(6);
    expect(corrupted?.punishments).toHaveLength(18);
  });

  it("sanitizes and sorts history entries", () => {
    const result = sanitizePersistedState({
      history: [
        historyEntry({ id: "old", timestamp: 100 }),
        historyEntry({ id: "bad-status", status: "exploded" as never }),
        historyEntry({ id: "new", timestamp: 300, status: "accepted" }),
        historyEntry({ id: "old", timestamp: 400 }),
      ],
    });

    expect(result?.history).toHaveLength(2);
    expect(result?.history.map((entry) => entry.id)).toEqual(["new", "old"]);
    expect(result?.history[1]?.timestamp).toBe(100);
  });

  it("clears selections that point to missing or inactive players", () => {
    const participant = cloneSeedParticipants()[0]!;

    const active = sanitizePersistedState({
      participants: [{ ...participant, active: true }],
      selectedParticipantId: participant.id,
    });
    expect(active?.selectedParticipantId).toBe(participant.id);

    const inactive = sanitizePersistedState({
      participants: [{ ...participant, active: false }],
      selectedParticipantId: participant.id,
    });
    expect(inactive?.selectedParticipantId).toBeNull();

    const missing = sanitizePersistedState({
      participants: [participant],
      selectedParticipantId: "ghost",
    });
    expect(missing?.selectedParticipantId).toBeNull();
  });

  it("repairs invalid settings and clamps weights", () => {
    const result = sanitizePersistedState({
      settings: {
        soundEnabled: "yes",
        musicEnabled: true,
        animationsEnabled: 1,
        defaultDifficulty: "chaos",
        difficultyWeights: {
          easy: { easy: 2000, medium: -5, hard: "many" },
          normal: {},
          hard: { easy: 0, medium: 0, hard: 0 },
        },
      },
    });

    expect(result?.settings.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
    expect(result?.settings.musicEnabled).toBe(true);
    expect(result?.settings.animationsEnabled).toBe(
      DEFAULT_SETTINGS.animationsEnabled,
    );
    expect(result?.settings.defaultDifficulty).toBe(
      DEFAULT_SETTINGS.defaultDifficulty,
    );
    expect(result?.settings.difficultyWeights.easy).toEqual({
      easy: 1000,
      medium: 0,
      hard: 5,
    });
    expect(result?.settings.difficultyWeights.normal).toEqual({
      easy: 34,
      medium: 33,
      hard: 33,
    });
    expect(result?.settings.difficultyWeights.hard).toEqual({
      easy: 0,
      medium: 0,
      hard: 0,
    });
  });

  it("survives corrupt localStorage without throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    expect(readPersistedState()).toBeNull();
    expect(appPersistStorage.getItem(STORAGE_KEY)).toBeNull();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nonsense: true }));
    const sanitized = readPersistedState();
    expect(sanitized?.participants).toHaveLength(6);
    expect(sanitized?.punishments).toHaveLength(18);
  });

  it("writes, reads, and clears through the persistence adapter", () => {
    appPersistStorage.setItem(STORAGE_KEY, {
      state: validState({
        selectedParticipantId: "player-lihindu",
      }),
      version: 1,
    });

    const restored = readPersistedState();
    expect(restored?.selectedParticipantId).toBe("player-lihindu");
    expect(restored?.settings.soundEnabled).toBe(true);

    clearPersistedState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
