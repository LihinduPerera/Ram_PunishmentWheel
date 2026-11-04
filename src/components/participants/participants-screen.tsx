"use client";

import { useMemo, useState } from "react";
import {
  Pencil,
  Play,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { DIFFICULTY_META } from "@/constants/difficulty";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import type { Participant, ParticipantDifficulty } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ParticipantAvatar } from "./participant-avatar";
import { ParticipantFormDialog } from "./participant-form-dialog";

const DIFFICULTY_OPTIONS = (
  ["easy", "normal", "hard", "random"] as const
).map((value) => ({
  value,
  label: DIFFICULTY_META[value].label,
  color: DIFFICULTY_META[value].color,
}));

function ParticipantCard({
  participant,
  selected,
  disabled,
  onEdit,
  onDelete,
}: {
  participant: Participant;
  selected: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const toggleParticipant = useGameStore((state) => state.toggleParticipant);
  const setParticipantDifficulty = useGameStore(
    (state) => state.setParticipantDifficulty,
  );
  const selectParticipant = useGameStore((state) => state.selectParticipant);

  const handleToggle = () => {
    const result = toggleParticipant(participant.id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: participant.active ? "Player benched" : "Player back in",
      description: participant.active
        ? `${participant.name} is sitting this one out.`
        : `${participant.name} can be chosen again.`,
      variant: "info",
    });
  };

  const handleDifficulty = (difficulty: ParticipantDifficulty) => {
    const result = setParticipantDifficulty(participant.id, difficulty);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Odds updated",
      description: `${participant.name} now favours ${DIFFICULTY_META[difficulty].label.toLowerCase()} dares.`,
      variant: "success",
    });
  };

  const handlePlay = () => {
    const result = selectParticipant(participant.id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: `${participant.name} is on the spot`,
      description: "Head back to the wheel and give it a spin.",
      variant: "default",
    });
  };

  return (
    <article
      className={cn(
        "glass-panel relative flex flex-col overflow-hidden rounded-3xl transition-colors",
        !participant.active && "opacity-70",
        selected && "border-white/20",
      )}
      style={
        selected
          ? {
              borderColor: `${participant.color}55`,
              boxShadow: `0 0 0 1px ${participant.color}33, 0 24px 60px -34px ${participant.color}99`,
            }
          : undefined
      }
    >
      {selected && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${participant.color}, transparent)`,
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        <ParticipantAvatar
          name={participant.name}
          color={participant.color}
          size="lg"
          ring={selected}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold text-white">
                {participant.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <DifficultyBadge difficulty={participant.difficulty} />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold",
                    participant.active
                      ? "bg-emerald-500/10 text-emerald-300/80"
                      : "bg-white/[0.06] text-white/35",
                  )}
                >
                  {participant.active ? (
                    <UserRoundCheck className="size-2.5" />
                  ) : (
                    <UserRoundX className="size-2.5" />
                  )}
                  {participant.active ? "Active" : "Benched"}
                </span>
              </div>
            </div>
          </div>
          {selected && (
            <p
              className="mt-1.5 inline-flex items-center gap-1 text-[0.62rem] font-semibold"
              style={{ color: participant.color }}
            >
              <Sparkles className="size-2.5" />
              On the spot
            </p>
          )}
        </div>
      </div>

      <div className="px-4">
        <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/30">
          Odds profile
        </p>
        <SegmentedControl
          label={`Difficulty profile for ${participant.name}`}
          options={DIFFICULTY_OPTIONS}
          value={participant.difficulty}
          onChange={handleDifficulty}
          size="sm"
          disabled={disabled}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-4 py-3">
        <Button
          size="sm"
          variant={selected ? "success" : "secondary"}
          onClick={handlePlay}
          disabled={disabled || !participant.active}
          title={
            !participant.active
              ? "Bring this player back before choosing them"
              : undefined
          }
        >
          <Play className="size-3.5" />
          {selected ? "Selected" : "Choose"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggle}
          disabled={disabled}
        >
          {participant.active ? (
            <>
              <UserRoundX className="size-3.5" />
              Bench
            </>
          ) : (
            <>
              <UserRoundCheck className="size-3.5" />
              Activate
            </>
          )}
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Edit ${participant.name}`}
            disabled={disabled}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Delete ${participant.name}`}
            disabled={disabled}
            className="text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ParticipantsScreen() {
  const participants = useGameStore((state) => state.participants);
  const selectedParticipantId = useGameStore(
    (state) => state.selectedParticipantId,
  );
  const isSpinning = useGameStore((state) => state.isSpinning);
  const removeParticipant = useGameStore((state) => state.removeParticipant);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Participant | null>(null);

  const activeCount = participants.filter(
    (participant) => participant.active,
  ).length;
  const easyCount = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.active && participant.difficulty === "easy",
      ).length,
    [participants],
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (participant: Participant) => {
    setEditing(participant);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    const result = removeParticipant(deleteTarget.id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Player removed",
      description: `${name} left the crew. Past history is kept.`,
      variant: "info",
    });
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
      <PageHeader
        eyebrow="The crew"
        title="Players"
        description="Add friends, bench the shy ones, and fine-tune each person's difficulty mood. Every profile still keeps every punishment on the wheel."
        actions={
          <Button onClick={openAdd} disabled={isSpinning}>
            <UserPlus className="size-4" />
            Add player
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-semibold text-white/55">
          <Users className="size-3.5 text-fuchsia-300/70" />
          {participants.length} {participants.length === 1 ? "player" : "players"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/12 bg-emerald-500/[0.06] px-3 py-1.5 text-[0.68rem] font-semibold text-emerald-200/70">
          <ShieldCheck className="size-3.5" />
          {activeCount} active
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-semibold text-white/45">
          {easyCount} on easy odds
        </span>
      </div>

      {participants.length === 0 ? (
        <div className="glass-panel mt-6 rounded-3xl">
          <EmptyState
            icon={Users}
            title="No players yet"
            description="A punishment wheel needs victims. Add at least one friend to get the night started."
            action={
              <Button onClick={openAdd}>
                <UserPlus className="size-4" />
                Add the first player
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              selected={participant.id === selectedParticipantId}
              disabled={isSpinning}
              onEdit={() => openEdit(participant)}
              onDelete={() => setDeleteTarget(participant)}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <ParticipantFormDialog
          open
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          participant={editing}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Remove ${deleteTarget?.name ?? "this player"}?`}
        description={`${
          deleteTarget?.name ?? "This player"
        } will be removed from the crew. Their past spins stay in history, but they can't be selected again unless you add them back.`}
        confirmLabel="Remove player"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
