import type { ParticipantDifficulty } from "./difficulty";

export interface Participant {
  id: string;
  name: string;
  /** Neon hex color used for the generated avatar. */
  color: string;
  active: boolean;
  difficulty: ParticipantDifficulty;
  createdAt: number;
}

export interface ParticipantInput {
  name: string;
  difficulty: ParticipantDifficulty;
  active: boolean;
  color?: string;
}
