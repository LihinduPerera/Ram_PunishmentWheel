import type { StateCreator } from "zustand";
import { randomId } from "@/lib/random";
import {
  normalizeWhitespace,
  validatePunishmentInput,
} from "@/lib/validation";
import type { ActionResult, PunishmentInput } from "@/types";
import type {
  GameStore,
  PunishmentsActions,
} from "@/store/types";

function spinLockError(): ActionResult {
  return {
    ok: false,
    error: "The wheel is spinning. Let it land before editing punishments.",
  };
}

export const createPunishmentsSlice: StateCreator<
  GameStore,
  [],
  [],
  PunishmentsActions
> = (set, get) => ({
  addPunishment: (input: PunishmentInput): ActionResult => {
    if (get().isSpinning) return spinLockError();

    const error = validatePunishmentInput(input);
    if (error) return { ok: false, error };

    set({
      punishments: [
        ...get().punishments,
        {
          id: randomId("punish"),
          title: normalizeWhitespace(input.title),
          description: normalizeWhitespace(input.description),
          difficulty: input.difficulty,
          active: input.active,
          category: input.category
            ? normalizeWhitespace(input.category)
            : undefined,
          createdAt: Date.now(),
        },
      ],
    });

    return { ok: true };
  },

  updatePunishment: (
    id: string,
    input: PunishmentInput,
  ): ActionResult => {
    if (get().isSpinning) return spinLockError();
    if (!get().punishments.some((item) => item.id === id)) {
      return { ok: false, error: "Punishment not found." };
    }

    const error = validatePunishmentInput(input);
    if (error) return { ok: false, error };

    set({
      punishments: get().punishments.map((item) =>
        item.id === id
          ? {
              ...item,
              title: normalizeWhitespace(input.title),
              description: normalizeWhitespace(input.description),
              difficulty: input.difficulty,
              active: input.active,
              category: input.category
                ? normalizeWhitespace(input.category)
                : undefined,
            }
          : item,
      ),
    });

    return { ok: true };
  },

  removePunishment: (id: string): ActionResult => {
    if (get().isSpinning) return spinLockError();
    if (!get().punishments.some((item) => item.id === id)) {
      return { ok: false, error: "Punishment not found." };
    }

    set({
      punishments: get().punishments.filter((item) => item.id !== id),
    });

    return { ok: true };
  },

  togglePunishment: (id: string): ActionResult => {
    if (get().isSpinning) return spinLockError();
    if (!get().punishments.some((item) => item.id === id)) {
      return { ok: false, error: "Punishment not found." };
    }

    set({
      punishments: get().punishments.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    });

    return { ok: true };
  },
});
