import type { PersistStorage } from "zustand/middleware";
import { HISTORY_LIMIT } from "@/constants/difficulty";
import { cloneSeedParticipants, cloneSeedPunishments } from "@/constants/seed";
import type { HistoryEntry, HistoryStatus } from "@/types";
import { isDifficulty } from "@/types";
import {
  sanitizeParticipant,
  sanitizePunishment,
  sanitizeSettings,
} from "@/lib/validation";
import type { PersistedGameState } from "@/store/types";

export const STORAGE_KEY = "party-roulette:v1";
export const STORAGE_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const HISTORY_STATUSES: readonly HistoryStatus[] = [
  "pending",
  "accepted",
  "skipped",
];

function sanitizeHistoryEntry(candidate: unknown): HistoryEntry | null {
  if (!isRecord(candidate)) return null;

  if (typeof candidate.id !== "string" || !candidate.id) return null;
  if (
    typeof candidate.participantId !== "string" ||
    typeof candidate.participantName !== "string" ||
    !candidate.participantName.trim()
  ) {
    return null;
  }
  if (
    typeof candidate.punishmentId !== "string" ||
    typeof candidate.punishmentTitle !== "string" ||
    !candidate.punishmentTitle.trim()
  ) {
    return null;
  }
  if (!isDifficulty(candidate.punishmentDifficulty)) return null;
  if (typeof candidate.timestamp !== "number") return null;
  if (
    typeof candidate.status !== "string" ||
    !HISTORY_STATUSES.includes(candidate.status as HistoryStatus)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    participantId: candidate.participantId,
    participantName: candidate.participantName.trim().slice(0, 60),
    participantColor:
      typeof candidate.participantColor === "string" &&
      /^#[0-9a-f]{6}$/i.test(candidate.participantColor)
        ? candidate.participantColor
        : "#c084fc",
    punishmentId: candidate.punishmentId,
    punishmentTitle: candidate.punishmentTitle.trim().slice(0, 160),
    punishmentDifficulty: candidate.punishmentDifficulty,
    punishmentCategory:
      typeof candidate.punishmentCategory === "string" &&
      candidate.punishmentCategory.trim()
        ? candidate.punishmentCategory.trim().slice(0, 40)
        : undefined,
    timestamp: Number.isFinite(candidate.timestamp) ? candidate.timestamp : 0,
    status: candidate.status as HistoryStatus,
  };
}

function sanitizeList<T extends { id: string }>(
  candidate: unknown,
  sanitizeItem: (item: unknown) => T | null,
  fallback: () => T[],
): T[] {
  if (!Array.isArray(candidate)) return fallback();

  const seen = new Set<string>();
  const items: T[] = [];
  for (const item of candidate) {
    const parsed = sanitizeItem(item);
    if (!parsed || seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    items.push(parsed);
  }

  // A non-empty but completely invalid list means the data was corrupted.
  if (candidate.length > 0 && items.length === 0) return fallback();
  return items;
}

/**
 * Defensive read path for localStorage. Accepts either a raw domain object or
 * a Zustand `{ state, version }` wrapper.
 */
export function sanitizePersistedState(
  candidate: unknown,
): PersistedGameState | null {
  if (!isRecord(candidate)) return null;
  const source = isRecord(candidate.state) ? candidate.state : candidate;

  const participants = sanitizeList(
    source.participants,
    sanitizeParticipant,
    cloneSeedParticipants,
  );
  const punishments = sanitizeList(
    source.punishments,
    sanitizePunishment,
    cloneSeedPunishments,
  );

  const rawHistory = Array.isArray(source.history)
    ? source.history
    : [];
  const seenHistory = new Set<string>();
  const history: HistoryEntry[] = [];
  for (const item of rawHistory) {
    const parsed = sanitizeHistoryEntry(item);
    if (!parsed || seenHistory.has(parsed.id)) continue;
    seenHistory.add(parsed.id);
    history.push(parsed);
  }
  history.sort((a, b) => b.timestamp - a.timestamp);

  const settings = sanitizeSettings(source.settings);

  const selectedCandidate =
    typeof source.selectedParticipantId === "string"
      ? source.selectedParticipantId
      : null;
  const selectedParticipantId =
    selectedCandidate &&
    participants.some(
      (participant) =>
        participant.id === selectedCandidate && participant.active,
    )
      ? selectedCandidate
      : null;

  return {
    participants,
    punishments,
    history: history.slice(0, HISTORY_LIMIT),
    settings,
    selectedParticipantId,
  };
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Zustand persistence adapter with corrupt-data protection. */
export const appPersistStorage: PersistStorage<PersistedGameState> = {
  getItem: (name) => {
    const storage = getLocalStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(name);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      const state = sanitizePersistedState(parsed);
      if (!state) return null;

      const version =
        isRecord(parsed) && typeof parsed.version === "number"
          ? parsed.version
          : STORAGE_VERSION;

      return { state, version };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(name, JSON.stringify(value));
    } catch {
      // Storage can fail in private browsing or when the quota is exhausted.
    }
  },
  removeItem: (name) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.removeItem(name);
    } catch {
      // Ignore storage failures.
    }
  },
};

export function clearPersistedState(): void {
  const storage = getLocalStorage();
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function readPersistedState(): PersistedGameState | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizePersistedState(JSON.parse(raw));
  } catch {
    return null;
  }
}
