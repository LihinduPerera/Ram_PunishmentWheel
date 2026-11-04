"use client";

import { useState, type FormEvent } from "react";
import { Check, Sparkles } from "lucide-react";
import { DIFFICULTY_META, PARTICIPANT_COLORS } from "@/constants/difficulty";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/cn";
import type { Participant, ParticipantDifficulty } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/form-fields";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { ParticipantAvatar } from "./participant-avatar";

const DIFFICULTY_OPTIONS = (
  ["easy", "normal", "hard", "random"] as const
).map((value) => ({
  value,
  label: DIFFICULTY_META[value].label,
  color: DIFFICULTY_META[value].color,
}));

export function ParticipantFormDialog({
  open,
  onOpenChange,
  participant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
}) {
  const participants = useGameStore((state) => state.participants);
  const addParticipant = useGameStore((state) => state.addParticipant);
  const updateParticipant = useGameStore((state) => state.updateParticipant);

  const [name, setName] = useState(participant?.name ?? "");
  const [difficulty, setDifficulty] = useState<ParticipantDifficulty>(
    participant?.difficulty ?? "normal",
  );
  const [color, setColor] = useState<string>(
    participant?.color ??
      PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length] ??
      PARTICIPANT_COLORS[0],
  );
  const [active, setActive] = useState(participant?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(participant);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      name,
      difficulty,
      color,
      active,
    };

    const result = participant
      ? updateParticipant(participant.id, input)
      : addParticipant(input);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({
      title: isEditing ? "Player updated" : "Player added",
      description: isEditing
        ? `${name.trim()} is ready for another round.`
        : `${name.trim()} joined the crew.`,
      variant: "success",
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit player" : "Add a player"}
      description={
        isEditing
          ? "Update their name, odds profile, or bench them for a while."
          : "Give the newest victim a name and a difficulty mood."
      }
      eyebrow={isEditing ? "Crew management" : "New recruit"}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" form="participant-form">
            <Check className="size-4" />
            {isEditing ? "Save changes" : "Add player"}
          </Button>
        </>
      }
    >
      <form
        id="participant-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <ParticipantAvatar
            name={name || "?"}
            color={color}
            size="lg"
            ring
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/85">
              {name.trim() || "Unnamed player"}
            </p>
            <p className="mt-0.5 text-[0.68rem] text-white/35">
              {DIFFICULTY_META[difficulty].description}
            </p>
          </div>
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          placeholder="e.g. Lihindu"
          maxLength={28}
          autoFocus
          error={error}
          hint="Keep it short — this shows on the wheel buttons and results."
        />

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-white/70">
            Difficulty profile
          </p>
          <SegmentedControl
            label="Difficulty profile"
            options={DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={setDifficulty}
            size="sm"
          />
          <p className="mt-2 text-[0.7rem] leading-relaxed text-white/38">
            {difficulty === "random"
              ? "Picks a random profile on every spin. Maximum chaos."
              : `Favours ${DIFFICULTY_META[difficulty].label.toLowerCase()} punishments. Every dare stays on the wheel.`}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-white/70">
            Avatar colour
          </p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANT_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Use colour ${swatch}`}
                aria-pressed={color === swatch}
                onClick={() => setColor(swatch)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110",
                  color === swatch && "ring-2 ring-white/70 ring-offset-2",
                  "ring-offset-night",
                )}
                style={{
                  background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.4), transparent 40%), ${swatch}`,
                }}
              >
                {color === swatch && (
                  <Check className="size-3.5 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <Switch
            id="participant-active"
            checked={active}
            onCheckedChange={setActive}
            label="Available to spin"
            description="Benched players stay saved but are hidden from the crew picker."
          />
        </div>

        {!isEditing && (
          <p className="flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-white/30">
            <Sparkles className="mt-0.5 size-3 shrink-0" />
            You can change everything later from the players page.
          </p>
        )}
      </form>
    </Dialog>
  );
}
