"use client";

import { useState, type FormEvent } from "react";
import { Check, ShieldAlert } from "lucide-react";
import {
  DIFFICULTY_META,
  PUNISHMENT_CATEGORIES,
} from "@/constants/difficulty";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import type { Difficulty, Punishment } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/form-fields";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";

const DIFFICULTY_OPTIONS = (["easy", "medium", "hard"] as const).map(
  (value) => ({
    value,
    label: DIFFICULTY_META[value].label,
    color: DIFFICULTY_META[value].color,
  }),
);

export function PunishmentFormDialog({
  open,
  onOpenChange,
  punishment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  punishment: Punishment | null;
}) {
  const addPunishment = useGameStore((state) => state.addPunishment);
  const updatePunishment = useGameStore((state) => state.updatePunishment);

  const [title, setTitle] = useState(punishment?.title ?? "");
  const [description, setDescription] = useState(
    punishment?.description ?? "",
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    punishment?.difficulty ?? "easy",
  );
  const [category, setCategory] = useState(punishment?.category ?? "");
  const [active, setActive] = useState(punishment?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(punishment);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      title,
      description,
      difficulty,
      category: category || undefined,
      active,
    };

    const result = punishment
      ? updatePunishment(punishment.id, input)
      : addPunishment(input);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({
      title: isEditing ? "Punishment updated" : "Punishment added",
      description: isEditing
        ? "The wheel picked up your changes."
        : "Fresh chaos is now on the wheel.",
      variant: "success",
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit punishment" : "New punishment"}
      description="Keep it playful, safe, and something everyone can opt out of."
      eyebrow={isEditing ? "Wheel content" : "Add a dare"}
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="punishment-form">
            <Check className="size-4" />
            {isEditing ? "Save changes" : "Add to wheel"}
          </Button>
        </>
      }
    >
      <form
        id="punishment-form"
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <Input
          label="Title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
          placeholder="e.g. Sing the chorus of any song"
          maxLength={90}
          autoFocus
          error={error}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional details, rules, or a time limit…"
          maxLength={320}
          rows={3}
          counter={{ value: description.length, max: 320 }}
          hint="Keep it clear enough that nobody argues about the rules mid-punishment."
        />

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-white/70">
            Difficulty
          </p>
          <SegmentedControl
            label="Punishment difficulty"
            options={DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={setDifficulty}
          />
          <p className="mt-2 text-[0.7rem] leading-relaxed text-white/38">
            {DIFFICULTY_META[difficulty].description}
          </p>
        </div>

        <Select
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          hint="Optional — shown on result cards and in history."
        >
          <option value="">No category</option>
          {PUNISHMENT_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <Switch
            id="punishment-active"
            checked={active}
            onCheckedChange={setActive}
            label="On the wheel"
            description="Inactive punishments stay saved but can't be drawn."
          />
        </div>

        <p className="flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-white/30">
          <ShieldAlert className="mt-0.5 size-3 shrink-0 text-amber-300/60" />
          Avoid anything dangerous, degrading, or dependent on alcohol. Everyone
          can skip a result.
        </p>
      </form>
    </Dialog>
  );
}
