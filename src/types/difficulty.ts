export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const PARTICIPANT_DIFFICULTIES = [
  "easy",
  "normal",
  "hard",
  "random",
] as const;

export type ParticipantDifficulty = (typeof PARTICIPANT_DIFFICULTIES)[number];

export const DIFFICULTY_PROFILES = ["easy", "normal", "hard"] as const;

export type DifficultyProfile = (typeof DIFFICULTY_PROFILES)[number];

export const DIFFICULTY_RANK: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" &&
    (DIFFICULTIES as readonly string[]).includes(value)
  );
}

export function isParticipantDifficulty(
  value: unknown,
): value is ParticipantDifficulty {
  return (
    typeof value === "string" &&
    (PARTICIPANT_DIFFICULTIES as readonly string[]).includes(value)
  );
}
