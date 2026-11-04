import type {
  ActionResult,
  DifficultyWeights,
  HistoryEntry,
  Participant,
  ParticipantDifficulty,
  ParticipantInput,
  Punishment,
  PunishmentInput,
  Settings,
  SpinOutcome,
  SpinRequestResult,
  SpinResult,
} from "@/types";

export interface GameDomainState {
  participants: Participant[];
  punishments: Punishment[];
  history: HistoryEntry[];
  settings: Settings;
  selectedParticipantId: string | null;
}

export interface GameTransientState {
  isSpinning: boolean;
  pendingOutcome: SpinOutcome | null;
  lastResult: SpinResult | null;
  /** Incremented when the result modal requests another spin. */
  spinAgainToken: number;
  /** Incremented when the player resets the wheel visual. */
  resetWheelToken: number;
}

export interface ParticipantsActions {
  addParticipant: (input: ParticipantInput) => ActionResult;
  updateParticipant: (
    id: string,
    input: ParticipantInput,
  ) => ActionResult;
  removeParticipant: (id: string) => ActionResult;
  toggleParticipant: (id: string) => ActionResult;
  setParticipantDifficulty: (
    id: string,
    difficulty: ParticipantDifficulty,
  ) => ActionResult;
  selectParticipant: (id: string | null) => ActionResult;
}

export interface PunishmentsActions {
  addPunishment: (input: PunishmentInput) => ActionResult;
  updatePunishment: (id: string, input: PunishmentInput) => ActionResult;
  removePunishment: (id: string) => ActionResult;
  togglePunishment: (id: string) => ActionResult;
}

export interface SettingsActions {
  updateSettings: (patch: Partial<Settings>) => void;
  setDifficultyWeights: (weights: DifficultyWeights) => void;
  resetSettings: () => void;
}

export interface HistoryActions {
  completeSpin: () => SpinResult | null;
  acceptResult: () => void;
  skipResult: () => void;
  dismissResult: () => void;
  clearHistory: () => void;
}

export interface GameActions {
  requestSpin: () => SpinRequestResult;
  cancelSpin: () => void;
  spinAgain: () => void;
  resetWheel: () => ActionResult;
  resetApp: () => void;
}

export type GameStore = GameDomainState &
  GameTransientState &
  ParticipantsActions &
  PunishmentsActions &
  SettingsActions &
  HistoryActions &
  GameActions;

export type PersistedGameState = GameDomainState;
