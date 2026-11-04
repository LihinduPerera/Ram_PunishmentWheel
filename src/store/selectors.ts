import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "./game-store";

export function useActiveParticipants() {
  return useGameStore(
    useShallow((state) =>
      state.participants.filter((participant) => participant.active),
    ),
  );
}

export function useActivePunishments() {
  return useGameStore(
    useShallow((state) =>
      state.punishments.filter((punishment) => punishment.active),
    ),
  );
}

export function useSelectedParticipant() {
  return useGameStore((state) => {
    if (!state.selectedParticipantId) return null;
    return (
      state.participants.find(
        (participant) =>
          participant.id === state.selectedParticipantId &&
          participant.active,
      ) ?? null
    );
  });
}

export function useCanSpin() {
  return useGameStore(
    (state) =>
      !state.isSpinning &&
      Boolean(
        state.participants.find(
          (participant) =>
            participant.id === state.selectedParticipantId &&
            participant.active,
        ),
      ) &&
      state.punishments.some((punishment) => punishment.active),
  );
}
