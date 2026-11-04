import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  appPersistStorage,
  sanitizePersistedState,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "@/lib/storage";
import {
  createInitialDomainState,
  createInitialTransientState,
} from "@/store/initial-state";
import { createGameSlice } from "@/store/slices/game-slice";
import { createHistorySlice } from "@/store/slices/history-slice";
import { createParticipantsSlice } from "@/store/slices/participants-slice";
import { createPunishmentsSlice } from "@/store/slices/punishments-slice";
import { createSettingsSlice } from "@/store/slices/settings-slice";
import type { GameStore, PersistedGameState } from "@/store/types";

const initialState = {
  ...createInitialDomainState(),
  ...createInitialTransientState(),
};

export const useGameStore = create<GameStore>()(
  persist(
    (...args) => ({
      ...initialState,
      ...createParticipantsSlice(...args),
      ...createPunishmentsSlice(...args),
      ...createSettingsSlice(...args),
      ...createHistorySlice(...args),
      ...createGameSlice(...args),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: appPersistStorage,
      skipHydration: true,
      partialize: (state): PersistedGameState => ({
        participants: state.participants,
        punishments: state.punishments,
        history: state.history,
        settings: state.settings,
        selectedParticipantId: state.selectedParticipantId,
      }),
      merge: (persistedState, currentState) => {
        const sanitized = sanitizePersistedState(persistedState);
        if (!sanitized) return currentState;
        return { ...currentState, ...sanitized };
      },
    },
  ),
);
