import type { StateCreator } from "zustand";
import { selectPunishment } from "@/lib/punishment-engine";
import { randomId } from "@/lib/random";
import type {
  ActionResult,
  SpinOutcome,
  SpinRequestResult,
} from "@/types";
import {
  createInitialDomainState,
  createInitialTransientState,
} from "@/store/initial-state";
import type { GameActions, GameStore } from "@/store/types";

export const createGameSlice: StateCreator<
  GameStore,
  [],
  [],
  GameActions
> = (set, get) => ({
  requestSpin: (): SpinRequestResult => {
    const state = get();
    if (state.isSpinning) {
      return { ok: false, error: "The wheel is already spinning." };
    }

    const participant = state.participants.find(
      (item) => item.id === state.selectedParticipantId && item.active,
    );
    if (!participant) {
      return { ok: false, error: "Pick a player before spinning." };
    }

    const activePunishments = state.punishments.filter((item) => item.active);
    if (activePunishments.length === 0) {
      return {
        ok: false,
        error: "No active punishments yet. Add one to the wheel first.",
      };
    }

    const selection = selectPunishment(
      activePunishments,
      participant.difficulty,
      state.settings.difficultyWeights,
    );

    if (!selection) {
      return {
        ok: false,
        error: "The wheel couldn't choose a punishment. Try again.",
      };
    }

    const outcome: SpinOutcome = {
      id: randomId("spin"),
      participantId: participant.id,
      participantName: participant.name,
      participantColor: participant.color,
      participantDifficulty: participant.difficulty,
      punishment: selection.punishment,
      punishmentIndex: selection.index,
      jitter: selection.jitter,
      profileUsed: selection.profileUsed,
      timestamp: Date.now(),
    };

    set({
      isSpinning: true,
      pendingOutcome: outcome,
      lastResult: null,
    });

    return { ok: true, outcome };
  },

  cancelSpin: () => {
    if (!get().isSpinning) return;
    set({ isSpinning: false, pendingOutcome: null });
  },

  spinAgain: () => {
    if (get().isSpinning) return;
    set({
      lastResult: null,
      spinAgainToken: get().spinAgainToken + 1,
    });
  },

  resetWheel: (): ActionResult => {
    if (get().isSpinning) {
      return {
        ok: false,
        error: "Let the wheel land before resetting it.",
      };
    }

    set({
      selectedParticipantId: null,
      lastResult: null,
      pendingOutcome: null,
      isSpinning: false,
      resetWheelToken: get().resetWheelToken + 1,
    });

    return { ok: true };
  },

  resetApp: () => {
    const current = get();
    set({
      ...createInitialDomainState(),
      ...createInitialTransientState(),
      // Keep token counters monotonic so wheel effects never replay an old
      // auto-spin, and trigger a graceful visual reset instead.
      spinAgainToken: current.spinAgainToken,
      resetWheelToken: current.resetWheelToken + 1,
    });
  },
});
