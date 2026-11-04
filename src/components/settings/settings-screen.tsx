"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Gauge,
  Music2,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Users,
  Volume2,
} from "lucide-react";
import {
  DEFAULT_DIFFICULTY_WEIGHTS,
  DIFFICULTY_META,
} from "@/constants/difficulty";
import { DIFFICULTY_PROFILES } from "@/types";
import { normalizeTierWeights } from "@/lib/punishment-engine";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";
import { toast } from "@/store/toast-store";
import { cloneDifficultyWeights } from "@/store/initial-state";
import type {
  Difficulty,
  DifficultyProfile,
  DifficultyWeights,
  ParticipantDifficulty,
} from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionCard, SectionCardHeader } from "@/components/ui/section-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { ParticipantAvatar } from "@/components/participants/participant-avatar";

const TIERS: Difficulty[] = ["easy", "medium", "hard"];

const DEFAULT_DIFFICULTY_OPTIONS = (
  ["easy", "normal", "hard", "random"] as const
).map((value) => ({
  value,
  label: DIFFICULTY_META[value].label,
  color: DIFFICULTY_META[value].color,
}));

const PROFILE_LABELS: Record<DifficultyProfile, string> = {
  easy: "Easy profile",
  normal: "Normal profile",
  hard: "Hard profile",
};

const PROFILE_DESCRIPTIONS: Record<DifficultyProfile, string> = {
  easy: "Favours gentle dares, with a rare wildcard.",
  normal: "A balanced spread across every tier.",
  hard: "Leans into the big performances.",
};

function WeightMatrix() {
  const settings = useGameStore((state) => state.settings);
  const setDifficultyWeights = useGameStore(
    (state) => state.setDifficultyWeights,
  );
  const [draft, setDraft] = useState<DifficultyWeights>(() =>
    cloneDifficultyWeights(settings.difficultyWeights),
  );

  const dirty = useMemo(
    () =>
      JSON.stringify(draft) !== JSON.stringify(settings.difficultyWeights),
    [draft, settings.difficultyWeights],
  );

  const totals = useMemo(() => {
    const result = {} as Record<DifficultyProfile, number>;
    for (const profile of DIFFICULTY_PROFILES) {
      result[profile] = TIERS.reduce(
        (sum, tier) => sum + (draft[profile][tier] || 0),
        0,
      );
    }
    return result;
  }, [draft]);

  const updateWeight = (
    profile: DifficultyProfile,
    tier: Difficulty,
    raw: string,
  ) => {
    const parsed = Number.parseInt(raw, 10);
    const value = Number.isFinite(parsed)
      ? Math.min(1000, Math.max(0, parsed))
      : 0;
    setDraft((current) => ({
      ...current,
      [profile]: { ...current[profile], [tier]: value },
    }));
  };

  const save = () => {
    const invalid = DIFFICULTY_PROFILES.find(
      (profile) => totals[profile] <= 0,
    );
    if (invalid) {
      toast({
        title: `${PROFILE_LABELS[invalid]} needs weight`,
        description: "At least one tier must be above zero.",
        variant: "error",
      });
      return;
    }

    setDifficultyWeights(draft);
    toast({
      title: "Odds saved",
      description: "The engine will use these weights on the next spin.",
      variant: "success",
    });
  };

  const restoreDefaults = () => {
    const defaults = cloneDifficultyWeights(DEFAULT_DIFFICULTY_WEIGHTS);
    setDraft(defaults);
    setDifficultyWeights(defaults);
    toast({
      title: "Default odds restored",
      description: "Easy, Normal, and Hard profiles are back to factory settings.",
      variant: "info",
    });
  };

  return (
    <SectionCard>
      <SectionCardHeader
        title="Difficulty weight matrix"
        description="Control how each profile favours easy, medium, and hard tiers. Weights are relative, not percentages."
        icon={<SlidersHorizontal className="size-4" />}
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={restoreDefaults}
          >
            <RotateCcw className="size-3.5" />
            Restore defaults
          </Button>
        }
      />

      <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-3">
        {DIFFICULTY_PROFILES.map((profile) => {
          const percentages = normalizeTierWeights(draft[profile]);
          const total = totals[profile];

          return (
            <div
              key={profile}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white/85">
                    {PROFILE_LABELS[profile]}
                  </h3>
                  <p className="mt-0.5 text-[0.65rem] leading-relaxed text-white/35">
                    {PROFILE_DESCRIPTIONS[profile]}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.6rem] font-semibold tabular-nums text-white/40">
                  {total}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {TIERS.map((tier) => (
                  <div key={tier} className="flex items-center gap-2">
                    <span className="flex-1 text-[0.68rem] font-medium text-white/50">
                      {DIFFICULTY_META[tier].label}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={1000}
                      step={1}
                      value={draft[profile][tier]}
                      onChange={(event) =>
                        updateWeight(profile, tier, event.target.value)
                      }
                      aria-label={`${PROFILE_LABELS[profile]} ${DIFFICULTY_META[tier].label} weight`}
                      className={cn(
                        "field-base h-9 w-20 px-2.5 py-0 text-center text-sm tabular-nums",
                      )}
                    />
                    <span className="w-9 text-right text-[0.62rem] tabular-nums text-white/30">
                      {Math.round(percentages[tier] * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                {TIERS.map((tier) => (
                  <span
                    key={tier}
                    style={{
                      width: `${percentages[tier] * 100}%`,
                      backgroundColor: DIFFICULTY_META[tier].color,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex items-start gap-1.5 text-[0.65rem] leading-relaxed text-white/30">
          <Sparkles className="mt-0.5 size-3 shrink-0" />
          Every active punishment stays on the wheel. Tier weight is split
          evenly across the dares in that tier.
        </p>
        <Button onClick={save} disabled={!dirty} className="shrink-0">
          <Save className="size-4" />
          Save weights
        </Button>
      </div>
    </SectionCard>
  );
}

export function SettingsScreen() {
  const settings = useGameStore((state) => state.settings);
  const participants = useGameStore((state) => state.participants);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const setParticipantDifficulty = useGameStore(
    (state) => state.setParticipantDifficulty,
  );
  const resetApp = useGameStore((state) => state.resetApp);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDefaultDifficulty = (value: ParticipantDifficulty) => {
    updateSettings({ defaultDifficulty: value });
    toast({
      title: "Default profile updated",
      description: `New players will start on ${DIFFICULTY_META[value].label}.`,
      variant: "success",
    });
  };

  const handleParticipantDifficulty = (
    id: string,
    name: string,
    value: ParticipantDifficulty,
  ) => {
    const result = setParticipantDifficulty(id, value);
    if (!result.ok) {
      toast({ title: result.error, variant: "error" });
      return;
    }
    toast({
      title: "Player odds updated",
      description: `${name} now favours ${DIFFICULTY_META[value].label.toLowerCase()} dares.`,
      variant: "success",
    });
  };

  const handleReset = () => {
    resetApp();
    setConfirmReset(false);
    toast({
      title: "Everything reset",
      description: "Seed players and punishments are back. History is empty.",
      variant: "info",
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8">
      <PageHeader
        eyebrow="Control room"
        title="Settings"
        description="Tune the atmosphere, set default odds, and fine-tune each player's difficulty profile. Everything is saved on this device."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/12 bg-emerald-500/[0.05] px-3 py-1.5 text-[0.65rem] font-semibold text-emerald-200/60">
            <ShieldCheck className="size-3.5" />
            Saved locally
          </span>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        <SectionCard>
          <SectionCardHeader
            title="Atmosphere"
            description="Sound, music, and motion"
            icon={<Volume2 className="size-4" />}
          />
          <div className="divide-y divide-white/[0.06]">
            <div className="px-5 py-4">
              <Switch
                id="setting-sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ soundEnabled: checked })
                }
                label="Sound effects"
                description="Wheel ticks, reveal fanfare, and button feedback."
              />
            </div>
            <div className="px-5 py-4">
              <Switch
                id="setting-music"
                checked={settings.musicEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ musicEnabled: checked })
                }
                label="Ambient music"
                description="A soft synth loop. Browsers may wait for your first tap."
              />
            </div>
            <div className="px-5 py-4">
              <Switch
                id="setting-animations"
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ animationsEnabled: checked })
                }
                label="Wheel animations"
                description="Turn off for a quick, no-drama result. Reduced-motion preferences are always respected."
              />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.06] bg-black/15 px-5 py-3 text-[0.65rem] text-white/30">
            <Music2 className="size-3.5 shrink-0" />
            All audio is synthesized in your browser — no downloads needed.
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader
            title="Default difficulty"
            description="Used when you add a new player"
            icon={<Gauge className="size-4" />}
          />
          <div className="p-5">
            <SegmentedControl
              label="Default participant difficulty"
              options={DEFAULT_DIFFICULTY_OPTIONS}
              value={settings.defaultDifficulty}
              onChange={handleDefaultDifficulty}
            />
            <p className="mt-3 text-[0.7rem] leading-relaxed text-white/35">
              {settings.defaultDifficulty === "random"
                ? "New players will roll a fresh profile on every spin."
                : `New players start with ${DIFFICULTY_META[
                    settings.defaultDifficulty
                  ].label.toLowerCase()} odds. You can change each player below or on the players page.`}
            </p>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/30">
                Current default mix
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                {TIERS.map((tier) => {
                  const weights =
                    settings.difficultyWeights[
                      settings.defaultDifficulty === "random"
                        ? "normal"
                        : settings.defaultDifficulty
                    ];
                  const normalized = normalizeTierWeights(weights);
                  return (
                    <span
                      key={tier}
                      className="inline-block h-full"
                      style={{
                        width: `${normalized[tier] * 100}%`,
                        backgroundColor: DIFFICULTY_META[tier].color,
                      }}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[0.62rem] text-white/30">
                {settings.defaultDifficulty === "random"
                  ? "Showing the Normal profile as a baseline. Random picks a new profile each spin."
                  : "Based on the saved weight matrix below."}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard>
          <SectionCardHeader
            title="Player odds"
            description="Each player can have their own difficulty mood"
            icon={<Users className="size-4" />}
            action={
              <Link
                href="/participants"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Manage players
              </Link>
            }
          />
          <div className="p-4 sm:p-5">
            {participants.length === 0 ? (
              <p className="text-center text-xs leading-relaxed text-white/30">
                No players yet.{" "}
                <Link
                  href="/participants"
                  className="font-semibold text-fuchsia-300/80"
                >
                  Add someone
                </Link>{" "}
                to tune their odds.
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={cn(
                      "rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3",
                      !participant.active && "opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <ParticipantAvatar
                        name={participant.name}
                        color={participant.color}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white/80">
                          {participant.name}
                        </p>
                        <p className="text-[0.6rem] text-white/30">
                          {participant.active ? "Active" : "Benched"}
                        </p>
                      </div>
                    </div>
                    <SegmentedControl
                      label={`Difficulty profile for ${participant.name}`}
                      options={DEFAULT_DIFFICULTY_OPTIONS}
                      value={participant.difficulty}
                      onChange={(value) =>
                        handleParticipantDifficulty(
                          participant.id,
                          participant.name,
                          value,
                        )
                      }
                      size="sm"
                      className="mt-2.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <WeightMatrix key={JSON.stringify(settings.difficultyWeights)} />
      </div>

      <div className="mt-5">
        <SectionCard className="border-rose-400/12">
          <SectionCardHeader
            title="Danger zone"
            description="Reset the whole app back to its seed data"
            icon={<TriangleAlert className="size-4 text-rose-300/80" />}
          />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[0.7rem] leading-relaxed text-white/35">
              Restores the original six players and eighteen punishments,
              resets settings, and permanently deletes all history and stats.
              Only do this between game nights.
            </p>
            <Button
              variant="danger"
              onClick={() => setConfirmReset(true)}
              className="shrink-0"
            >
              <RotateCcw className="size-4" />
              Reset everything
            </Button>
          </div>
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset the entire app?"
        description="All players, punishments, history, and settings will be replaced with the original seed data. This cannot be undone."
        confirmLabel="Reset everything"
        onConfirm={handleReset}
      />
    </div>
  );
}
