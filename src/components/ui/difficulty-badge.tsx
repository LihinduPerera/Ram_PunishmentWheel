import type { ReactNode } from "react";
import { DIFFICULTY_META } from "@/constants/difficulty";
import { cn } from "@/lib/cn";
import type { Difficulty, ParticipantDifficulty } from "@/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty | ParticipantDifficulty;
  className?: string;
  size?: "sm" | "md";
  showDot?: boolean;
  children?: ReactNode;
}

export function DifficultyBadge({
  difficulty,
  className,
  size = "sm",
  showDot = true,
}: DifficultyBadgeProps) {
  const meta = DIFFICULTY_META[difficulty];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide",
        size === "sm" ? "px-2.5 py-1 text-[0.65rem]" : "px-3 py-1.5 text-xs",
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: meta.soft,
        borderColor: `${meta.color}33`,
      }}
    >
      {showDot && (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      {meta.label}
    </span>
  );
}
