import type {
  Difficulty,
  DifficultyWeights,
  Participant,
  ParticipantDifficulty,
  ParticipantInput,
  Punishment,
  PunishmentInput,
  Settings,
} from "@/types";
import {
  isDifficulty,
  isParticipantDifficulty,
} from "@/types";
import { DEFAULT_DIFFICULTY_WEIGHTS, DEFAULT_SETTINGS } from "@/constants/difficulty";

export const PARTICIPANT_NAME_MAX = 28;
export const PUNISHMENT_TITLE_MAX = 90;
export const PUNISHMENT_DESCRIPTION_MAX = 320;
export const PUNISHMENT_CATEGORY_MAX = 30;
export const DIFFICULTY_WEIGHT_MAX = 1000;

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function validateParticipantInput(
  input: ParticipantInput,
  participants: readonly Participant[],
  ignoreId?: string,
): string | null {
  const name = normalizeWhitespace(input.name);

  if (!name) return "Give this player a name first.";
  if (name.length > PARTICIPANT_NAME_MAX) {
    return `Keep names under ${PARTICIPANT_NAME_MAX} characters.`;
  }
  if (!isParticipantDifficulty(input.difficulty)) {
    return "Pick a valid difficulty.";
  }

  const duplicate = participants.some(
    (participant) =>
      participant.id !== ignoreId &&
      participant.name.toLowerCase() === name.toLowerCase(),
  );

  if (duplicate) return "That name is already in the crew.";
  return null;
}

export function validatePunishmentInput(
  input: PunishmentInput,
): string | null {
  const title = normalizeWhitespace(input.title);
  const description = normalizeWhitespace(input.description);

  if (!title) return "A punishment needs a title.";
  if (title.length > PUNISHMENT_TITLE_MAX) {
    return `Keep titles under ${PUNISHMENT_TITLE_MAX} characters.`;
  }
  if (description.length > PUNISHMENT_DESCRIPTION_MAX) {
    return `Keep descriptions under ${PUNISHMENT_DESCRIPTION_MAX} characters.`;
  }
  if (!isDifficulty(input.difficulty)) {
    return "Pick a valid difficulty.";
  }
  if ((input.category?.trim().length ?? 0) > PUNISHMENT_CATEGORY_MAX) {
    return `Keep categories under ${PUNISHMENT_CATEGORY_MAX} characters.`;
  }

  return null;
}

export function sanitizeDifficultyWeights(
  candidate: unknown,
): DifficultyWeights {
  const source =
    typeof candidate === "object" && candidate !== null
      ? (candidate as Record<string, unknown>)
      : {};

  const sanitizeRow = (profile: "easy" | "normal" | "hard") => {
    const row =
      typeof source[profile] === "object" && source[profile] !== null
        ? (source[profile] as Record<string, unknown>)
        : {};
    const fallback = DEFAULT_DIFFICULTY_WEIGHTS[profile];
    const read = (tier: Difficulty): number => {
      const value = row[tier];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallback[tier];
      }
      return Math.min(DIFFICULTY_WEIGHT_MAX, Math.max(0, Math.round(value)));
    };

    return { easy: read("easy"), medium: read("medium"), hard: read("hard") };
  };

  return {
    easy: sanitizeRow("easy"),
    normal: sanitizeRow("normal"),
    hard: sanitizeRow("hard"),
  };
}

export function sanitizeSettings(candidate: unknown): Settings {
  const source =
    typeof candidate === "object" && candidate !== null
      ? (candidate as Record<string, unknown>)
      : {};

  return {
    soundEnabled:
      typeof source.soundEnabled === "boolean"
        ? source.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled,
    musicEnabled:
      typeof source.musicEnabled === "boolean"
        ? source.musicEnabled
        : DEFAULT_SETTINGS.musicEnabled,
    animationsEnabled:
      typeof source.animationsEnabled === "boolean"
        ? source.animationsEnabled
        : DEFAULT_SETTINGS.animationsEnabled,
    defaultDifficulty: isParticipantDifficulty(source.defaultDifficulty)
      ? source.defaultDifficulty
      : DEFAULT_SETTINGS.defaultDifficulty,
    difficultyWeights: sanitizeDifficultyWeights(source.difficultyWeights),
  };
}

export function sanitizeParticipant(
  candidate: unknown,
): Participant | null {
  if (typeof candidate !== "object" || candidate === null) return null;
  const source = candidate as Record<string, unknown>;

  if (typeof source.id !== "string" || !source.id.trim()) return null;
  if (typeof source.name !== "string") return null;
  const name = normalizeWhitespace(source.name);
  if (!name || name.length > PARTICIPANT_NAME_MAX) return null;
  if (!isParticipantDifficulty(source.difficulty)) return null;

  const color =
    typeof source.color === "string" && /^#[0-9a-f]{6}$/i.test(source.color)
      ? source.color
      : "#c084fc";

  return {
    id: source.id,
    name,
    color,
    active: typeof source.active === "boolean" ? source.active : true,
    difficulty: source.difficulty,
    createdAt:
      typeof source.createdAt === "number" && Number.isFinite(source.createdAt)
        ? source.createdAt
        : Date.now(),
  };
}

export function sanitizePunishment(candidate: unknown): Punishment | null {
  if (typeof candidate !== "object" || candidate === null) return null;
  const source = candidate as Record<string, unknown>;

  if (typeof source.id !== "string" || !source.id.trim()) return null;
  if (typeof source.title !== "string") return null;
  const title = normalizeWhitespace(source.title);
  if (!title || title.length > PUNISHMENT_TITLE_MAX) return null;
  if (!isDifficulty(source.difficulty)) return null;

  const description =
    typeof source.description === "string"
      ? normalizeWhitespace(source.description).slice(
          0,
          PUNISHMENT_DESCRIPTION_MAX,
        )
      : "";
  const category =
    typeof source.category === "string" && source.category.trim()
      ? normalizeWhitespace(source.category).slice(0, PUNISHMENT_CATEGORY_MAX)
      : undefined;

  return {
    id: source.id,
    title,
    description,
    difficulty: source.difficulty,
    active: typeof source.active === "boolean" ? source.active : true,
    category,
    createdAt:
      typeof source.createdAt === "number" && Number.isFinite(source.createdAt)
        ? source.createdAt
        : Date.now(),
  };
}

export function isParticipantDifficultyValue(
  value: unknown,
): value is ParticipantDifficulty {
  return isParticipantDifficulty(value);
}
