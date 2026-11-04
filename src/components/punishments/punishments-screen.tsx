"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  DIFFICULTY_META,
  PUNISHMENT_CATEGORIES,
} from "@/constants/difficulty";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import { DIFFICULTIES, type Difficulty, type Punishment } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form-fields";
import { Switch } from "@/components/ui/switch";
import { PunishmentFormDialog } from "./punishment-form-dialog";

type DifficultyFilter = "all" | Difficulty;
type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "On wheel" },
  { value: "inactive", label: "Benched" },
];

function PunishmentRow({
  punishment,
  disabled,
  onEdit,
  onDelete,
}: {
  punishment: Punishment;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const togglePunishment = useGameStore((state) => state.togglePunishment);
  const meta = DIFFICULTY_META[punishment.difficulty];

  const handleToggle = (checked: boolean) => {
    const result = togglePunishment(punishment.id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: checked ? "Back on the wheel" : "Punishment benched",
      description: checked
        ? `"${punishment.title}" can be drawn again.`
        : `"${punishment.title}" stays saved but won't be drawn.`,
      variant: "info",
    });
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] sm:p-4",
        !punishment.active && "opacity-60",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: meta.color }}
      />

      <div className="flex items-start gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={punishment.difficulty} />
            {punishment.category && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-0.5 text-[0.6rem] font-medium text-white/40">
                {punishment.category}
              </span>
            )}
            {!punishment.active && (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.6rem] font-semibold text-white/35">
                Benched
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-sm font-semibold leading-snug text-white/90 sm:text-[0.95rem]">
            {punishment.title}
          </h2>
          {punishment.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
              {punishment.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="mr-1 hidden sm:block">
            <Switch
              checked={punishment.active}
              onCheckedChange={handleToggle}
              label={`Toggle ${punishment.title}`}
              disabled={disabled}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Edit ${punishment.title}`}
            disabled={disabled}
            className="size-8"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Delete ${punishment.title}`}
            disabled={disabled}
            className="size-8 text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 pl-2 sm:hidden">
        <span className="text-[0.62rem] text-white/30">
          {punishment.active ? "On the wheel" : "Benched"}
        </span>
        <Switch
          checked={punishment.active}
          onCheckedChange={handleToggle}
          label={`Toggle ${punishment.title}`}
          disabled={disabled}
        />
      </div>
    </article>
  );
}

export function PunishmentsScreen() {
  const punishments = useGameStore((state) => state.punishments);
  const isSpinning = useGameStore((state) => state.isSpinning);
  const removePunishment = useGameStore((state) => state.removePunishment);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Punishment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Punishment | null>(null);
  const deferredSearch = useDeferredValue(search);

  const counts = useMemo(() => {
    const result: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    for (const punishment of punishments) {
      if (punishment.active) result[punishment.difficulty] += 1;
    }
    return result;
  }, [punishments]);

  const activeCount = counts.easy + counts.medium + counts.hard;

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return punishments.filter((punishment) => {
      if (difficulty !== "all" && punishment.difficulty !== difficulty) {
        return false;
      }
      if (status === "active" && !punishment.active) return false;
      if (status === "inactive" && punishment.active) return false;
      if (!query) return true;
      return (
        punishment.title.toLowerCase().includes(query) ||
        punishment.description.toLowerCase().includes(query) ||
        (punishment.category ?? "").toLowerCase().includes(query)
      );
    });
  }, [deferredSearch, difficulty, punishments, status]);

  const filtersActive =
    search.trim().length > 0 || difficulty !== "all" || status !== "all";

  const resetFilters = () => {
    setSearch("");
    setDifficulty("all");
    setStatus("all");
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (punishment: Punishment) => {
    setEditing(punishment);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const title = deleteTarget.title;
    const result = removePunishment(deleteTarget.id);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Punishment deleted",
      description: `"${title}" is off the wheel. Past history is kept.`,
      variant: "info",
    });
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
      <PageHeader
        eyebrow="Wheel content"
        title="Punishments"
        description="Build the dare pool, tune the difficulty mix, and keep everything party-safe. Every active punishment always has a chance to be drawn."
        actions={
          <Button onClick={openAdd} disabled={isSpinning}>
            <Plus className="size-4" />
            New punishment
          </Button>
        }
      />

      <div className="mt-5 rounded-2xl border border-emerald-300/12 bg-emerald-500/[0.045] px-4 py-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300/80" />
          <div>
            <p className="text-xs font-semibold text-emerald-100/85">
              Party-safe house rules
            </p>
            <p className="mt-0.5 text-[0.7rem] leading-relaxed text-emerald-100/45">
              No dangerous stunts, no alcohol, no cruelty. Everyone can skip a
              punishment without judgement. If it wouldn&apos;t be funny to
              everyone afterward, it doesn&apos;t belong here.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-semibold text-white/55">
          <Sparkles className="size-3.5 text-fuchsia-300/70" />
          {activeCount} on the wheel
        </span>
        {DIFFICULTIES.map((tier) => (
          <span
            key={tier}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold"
            style={{
              color: DIFFICULTY_META[tier].color,
              backgroundColor: DIFFICULTY_META[tier].soft,
              borderColor: `${DIFFICULTY_META[tier].color}26`,
            }}
          >
            {counts[tier]} {DIFFICULTY_META[tier].label.toLowerCase()}
          </span>
        ))}
        {punishments.length > activeCount && (
          <span className="text-[0.65rem] text-white/30">
            {punishments.length - activeCount} benched
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            aria-label="Search punishments"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, descriptions, categories…"
            className="pl-10 pr-10"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter by difficulty"
            className="inline-flex rounded-full border border-white/[0.07] bg-black/25 p-1"
          >
            {(["all", ...DIFFICULTIES] as const).map((tier) => {
              const active = difficulty === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficulty(tier)}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-[0.65rem] font-semibold transition",
                    active
                      ? "bg-white/[0.1] text-white"
                      : "text-white/38 hover:text-white/65",
                  )}
                  style={
                    active && tier !== "all"
                      ? {
                          color: DIFFICULTY_META[tier].color,
                          backgroundColor: DIFFICULTY_META[tier].soft,
                        }
                      : undefined
                  }
                >
                  {tier === "all" ? "All" : DIFFICULTY_META[tier].label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex rounded-full border border-white/[0.07] bg-black/25 p-1"
          >
            {STATUS_OPTIONS.map((option) => {
              const active = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-[0.65rem] font-semibold transition",
                    active
                      ? "bg-white/[0.1] text-white"
                      : "text-white/38 hover:text-white/65",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {filtersActive && (
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              <Filter className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 text-[0.65rem] text-white/30">
        Showing {filtered.length} of {punishments.length}{" "}
        {punishments.length === 1 ? "punishment" : "punishments"}
      </p>

      {punishments.length === 0 ? (
        <div className="glass-panel mt-3 rounded-3xl">
          <EmptyState
            icon={ShieldAlert}
            title="The wheel has no dares"
            description="Add a few punishments to give the wheel something to work with. Start gentle, then let chaos build."
            action={
              <Button onClick={openAdd}>
                <Plus className="size-4" />
                Create the first punishment
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel mt-3 rounded-3xl">
          <EmptyState
            icon={Search}
            title="No matches"
            description="Nothing in the dare pool matches those filters. Try a different search or clear everything."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {filtered.map((punishment) => (
            <PunishmentRow
              key={punishment.id}
              punishment={punishment}
              disabled={isSpinning}
              onEdit={() => openEdit(punishment)}
              onDelete={() => setDeleteTarget(punishment)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5 text-[0.62rem] text-white/25">
        <span className="font-semibold text-white/35">Categories:</span>
        {PUNISHMENT_CATEGORIES.map((category, index) => (
          <span key={category} className="inline-flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">·</span>}
            {category}
          </span>
        ))}
      </div>

      {formOpen && (
        <PunishmentFormDialog
          open
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          punishment={editing}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget?.title ?? "this punishment"}"?`}
        description="This removes the punishment from the wheel permanently. Past history and stats keep their snapshot, so no records are lost."
        confirmLabel="Delete punishment"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
