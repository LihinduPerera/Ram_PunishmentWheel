import type { StateCreator } from "zustand";
import { DEFAULT_SETTINGS } from "@/constants/difficulty";
import { sanitizeSettings } from "@/lib/validation";
import type { DifficultyWeights, Settings } from "@/types";
import { cloneSettings } from "@/store/initial-state";
import type { GameStore, SettingsActions } from "@/store/types";

export const createSettingsSlice: StateCreator<
  GameStore,
  [],
  [],
  SettingsActions
> = (set, get) => ({
  updateSettings: (patch: Partial<Settings>) => {
    set({
      settings: sanitizeSettings({
        ...get().settings,
        ...patch,
        difficultyWeights:
          patch.difficultyWeights ?? get().settings.difficultyWeights,
      }),
    });
  },

  setDifficultyWeights: (weights: DifficultyWeights) => {
    set({
      settings: sanitizeSettings({
        ...get().settings,
        difficultyWeights: weights,
      }),
    });
  },

  resetSettings: () => {
    set({ settings: cloneSettings(DEFAULT_SETTINGS) });
  },
});
