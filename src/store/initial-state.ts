import { DEFAULT_SETTINGS } from "@/constants/difficulty";
import {
  cloneSeedParticipants,
  cloneSeedPunishments,
} from "@/constants/seed";
import type { DifficultyWeights, Settings } from "@/types";
import type {
  GameDomainState,
  GameTransientState,
} from "./types";

export function cloneDifficultyWeights(
  weights: DifficultyWeights,
): DifficultyWeights {
  return {
    easy: { ...weights.easy },
    normal: { ...weights.normal },
    hard: { ...weights.hard },
  };
}

export function cloneSettings(settings: Settings = DEFAULT_SETTINGS): Settings {
  return {
    ...settings,
    difficultyWeights: cloneDifficultyWeights(settings.difficultyWeights),
  };
}

export function createInitialDomainState(): GameDomainState {
  return {
    participants: cloneSeedParticipants(),
    punishments: cloneSeedPunishments(),
    history: [],
    settings: cloneSettings(DEFAULT_SETTINGS),
    selectedParticipantId: null,
  };
}

export function createInitialTransientState(): GameTransientState {
  return {
    isSpinning: false,
    pendingOutcome: null,
    lastResult: null,
    spinAgainToken: 0,
    resetWheelToken: 0,
  };
}

export function createInitialGameState(): GameDomainState &
  GameTransientState {
  return {
    ...createInitialDomainState(),
    ...createInitialTransientState(),
  };
}
