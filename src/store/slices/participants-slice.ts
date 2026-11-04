import type { StateCreator } from "zustand";
import { PARTICIPANT_COLORS } from "@/constants/difficulty";
import { randomId } from "@/lib/random";
import {
  normalizeWhitespace,
  validateParticipantInput,
} from "@/lib/validation";
import type {
  ActionResult,
  ParticipantDifficulty,
  ParticipantInput,
} from "@/types";
import type {
  GameStore,
  ParticipantsActions,
} from "@/store/types";

export const createParticipantsSlice: StateCreator<
  GameStore,
  [],
  [],
  ParticipantsActions
> = (set, get) => ({
  addParticipant: (input: ParticipantInput): ActionResult => {
    const error = validateParticipantInput(input, get().participants);
    if (error) return { ok: false, error };

    const participants = get().participants;
    const color =
      input.color ??
      PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length];

    set({
      participants: [
        ...participants,
        {
          id: randomId("player"),
          name: normalizeWhitespace(input.name),
          color,
          active: input.active,
          difficulty: input.difficulty,
          createdAt: Date.now(),
        },
      ],
    });

    return { ok: true };
  },

  updateParticipant: (
    id: string,
    input: ParticipantInput,
  ): ActionResult => {
    const participant = get().participants.find((item) => item.id === id);
    if (!participant) return { ok: false, error: "Player not found." };

    const error = validateParticipantInput(input, get().participants, id);
    if (error) return { ok: false, error };

    const isLockedParticipant =
      get().isSpinning && get().pendingOutcome?.participantId === id;
    if (isLockedParticipant && !input.active) {
      return {
        ok: false,
        error: "Let the wheel finish before benching this player.",
      };
    }

    set({
      participants: get().participants.map((item) =>
        item.id === id
          ? {
              ...item,
              name: normalizeWhitespace(input.name),
              difficulty: input.difficulty,
              active: input.active,
              color: input.color ?? item.color,
            }
          : item,
      ),
      selectedParticipantId:
        get().selectedParticipantId === id && !input.active
          ? null
          : get().selectedParticipantId,
    });

    return { ok: true };
  },

  removeParticipant: (id: string): ActionResult => {
    const participant = get().participants.find((item) => item.id === id);
    if (!participant) return { ok: false, error: "Player not found." };

    if (get().isSpinning && get().pendingOutcome?.participantId === id) {
      return {
        ok: false,
        error: "That player is mid-spin. Let the wheel finish first.",
      };
    }

    set({
      participants: get().participants.filter((item) => item.id !== id),
      selectedParticipantId:
        get().selectedParticipantId === id
          ? null
          : get().selectedParticipantId,
    });

    return { ok: true };
  },

  toggleParticipant: (id: string): ActionResult => {
    const participant = get().participants.find((item) => item.id === id);
    if (!participant) return { ok: false, error: "Player not found." };

    const nextActive = !participant.active;
    if (
      !nextActive &&
      get().isSpinning &&
      get().pendingOutcome?.participantId === id
    ) {
      return {
        ok: false,
        error: "Let the wheel finish before benching this player.",
      };
    }

    set({
      participants: get().participants.map((item) =>
        item.id === id ? { ...item, active: nextActive } : item,
      ),
      selectedParticipantId:
        !nextActive && get().selectedParticipantId === id
          ? null
          : get().selectedParticipantId,
    });

    return { ok: true };
  },

  setParticipantDifficulty: (
    id: string,
    difficulty: ParticipantDifficulty,
  ): ActionResult => {
    const participant = get().participants.find((item) => item.id === id);
    if (!participant) return { ok: false, error: "Player not found." };

    if (get().isSpinning && get().pendingOutcome?.participantId === id) {
      return {
        ok: false,
        error: "The wheel is already spinning for this player.",
      };
    }

    set({
      participants: get().participants.map((item) =>
        item.id === id ? { ...item, difficulty } : item,
      ),
    });

    return { ok: true };
  },

  selectParticipant: (id: string | null): ActionResult => {
    if (get().isSpinning) {
      return {
        ok: false,
        error: "Hold on — the wheel is still spinning.",
      };
    }

    if (id === null) {
      set({ selectedParticipantId: null });
      return { ok: true };
    }

    const participant = get().participants.find((item) => item.id === id);
    if (!participant) {
      return { ok: false, error: "Player not found." };
    }
    if (!participant.active) {
      return {
        ok: false,
        error: "That player is inactive. Wake them up first.",
      };
    }

    set({ selectedParticipantId: id });
    return { ok: true };
  },
});
