import type { Difficulty } from "./difficulty";

export interface Punishment {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  active: boolean;
  category?: string;
  createdAt: number;
}

export interface PunishmentInput {
  title: string;
  description: string;
  difficulty: Difficulty;
  active: boolean;
  category?: string;
}
