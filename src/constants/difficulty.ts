import type {
  Difficulty,
  DifficultyWeights,
  ParticipantDifficulty,
  Settings,
} from "@/types";

export const PARTICIPANT_COLORS = [
  "#c084fc",
  "#38bdf8",
  "#f472b6",
  "#fb923c",
  "#34d399",
  "#facc15",
  "#f87171",
  "#a3e635",
  "#22d3ee",
  "#e879f9",
  "#fda4af",
  "#93c5fd",
] as const;

export const DIFFICULTY_META: Record<
  Difficulty | ParticipantDifficulty,
  { label: string; description: string; color: string; soft: string }
> = {
  easy: {
    label: "Easy",
    description: "Gentle dares with maximum laughs.",
    color: "#34d399",
    soft: "rgba(52, 211, 153, 0.14)",
  },
  medium: {
    label: "Medium",
    description: "A little chaos, still comfortable.",
    color: "#c084fc",
    soft: "rgba(192, 132, 252, 0.14)",
  },
  hard: {
    label: "Hard",
    description: "Big performances for brave souls.",
    color: "#fb7185",
    soft: "rgba(251, 113, 133, 0.14)",
  },
  normal: {
    label: "Normal",
    description: "A balanced mix of every difficulty.",
    color: "#38bdf8",
    soft: "rgba(56, 189, 248, 0.14)",
  },
  random: {
    label: "Random",
    description: "A different difficulty mood every spin.",
    color: "#fb923c",
    soft: "rgba(251, 146, 60, 0.14)",
  },
};

export const WHEEL_COLORS: Record<Difficulty, readonly string[]> = {
  easy: ["#0e7490", "#0891b2", "#0d9488", "#0284c7", "#14b8a6"],
  medium: ["#7e22ce", "#9333ea", "#a21caf", "#c026d3", "#6d28d9"],
  hard: ["#be123c", "#c2410c", "#dc2626", "#ea580c", "#e11d48"],
};

export const DEFAULT_DIFFICULTY_WEIGHTS: DifficultyWeights = {
  easy: { easy: 70, medium: 25, hard: 5 },
  normal: { easy: 34, medium: 33, hard: 33 },
  hard: { easy: 15, medium: 30, hard: 55 },
};

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: false,
  animationsEnabled: true,
  defaultDifficulty: "normal",
  difficultyWeights: DEFAULT_DIFFICULTY_WEIGHTS,
};

export const PUNISHMENT_CATEGORIES = [
  "Performance",
  "Comedy",
  "Social",
  "Fitness",
  "Creative",
  "Brain Teaser",
] as const;

export const HISTORY_LIMIT = 1000;

export const WHEEL_TURNS_MIN = 6;
export const WHEEL_TURNS_MAX = 9;
export const WHEEL_DURATION_MIN_MS = 5600;
export const WHEEL_DURATION_MAX_MS = 7600;
export const WHEEL_SEGMENT_LABEL_SOFT_LIMIT = 18;
