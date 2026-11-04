import type {
  Difficulty,
  DifficultyProfile,
  ParticipantDifficulty,
} from "./difficulty";
import type { Punishment } from "./punishment";

export type HistoryStatus = "pending" | "accepted" | "skipped";

export interface HistoryEntry {
  id: string;
  participantId: string;
  participantName: string;
  participantColor: string;
  punishmentId: string;
  punishmentTitle: string;
  punishmentDifficulty: Difficulty;
  punishmentCategory?: string;
  timestamp: number;
  status: HistoryStatus;
}

export interface SpinOutcome {
  id: string;
  participantId: string;
  participantName: string;
  participantColor: string;
  participantDifficulty: ParticipantDifficulty;
  punishment: Punishment;
  /** Index inside the active punishment array used to build the wheel. */
  punishmentIndex: number;
  /** Offset within the winning slice, in the range [-1, 1]. */
  jitter: number;
  profileUsed: DifficultyProfile;
  timestamp: number;
}

export interface SpinResult {
  outcome: SpinOutcome;
  historyId: string;
}

export interface SpinTiming {
  durationMs: number;
  extraTurns: number;
}

export interface ParticipantStats {
  participantId: string;
  name: string;
  color: string;
  spins: number;
  received: number;
  skipped: number;
  lastPlayedAt: number | null;
}

export interface Statistics {
  totalSpins: number;
  totalReceived: number;
  totalSkipped: number;
  perParticipant: ParticipantStats[];
  mostUnlucky: ParticipantStats | null;
  easiestReceived: HistoryEntry | null;
  byDifficulty: Record<Difficulty, number>;
  lastSpinAt: number | null;
}

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type SpinRequestResult =
  | { ok: true; outcome: SpinOutcome }
  | { ok: false; error: string };
