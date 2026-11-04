import type {
  Difficulty,
  DifficultyProfile,
  ParticipantDifficulty,
} from "./difficulty";

export type TierWeights = Record<Difficulty, number>;

/**
 * Weights used for the three fixed participant profiles. "Random" resolves to
 * one of these profiles at spin time.
 */
export type DifficultyWeights = Record<DifficultyProfile, TierWeights>;

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  defaultDifficulty: ParticipantDifficulty;
  difficultyWeights: DifficultyWeights;
}
