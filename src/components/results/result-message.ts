import { pickOne } from "@/lib/random";

const SUBLINES = [
  "No takebacks. Well… maybe one skip.",
  "The universe has excellent comedic timing.",
  "Everyone saw that. Commit to the bit.",
  "This is what happens when you lose.",
  "Breathe. Then give the people a show.",
  "The wheel is nothing if not dramatic.",
  "A moment for the history books.",
  "Your friends are already laughing.",
] as const;

export function buildResultSubline(participantName: string): string {
  const line = pickOne(SUBLINES) ?? "Fate has a funny sense of humour.";
  return `${participantName}, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
}
