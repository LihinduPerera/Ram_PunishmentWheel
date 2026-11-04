import { beforeEach, describe, expect, it } from "vitest";
import { HISTORY_LIMIT } from "@/constants/difficulty";
import { STORAGE_KEY } from "@/lib/storage";
import { computeStatistics } from "@/lib/statistics";
import { useGameStore } from "@/store/game-store";
import type { HistoryEntry } from "@/types";

const store = () => useGameStore.getState();

function selectFirstParticipant() {
  const participant = store().participants[0];
  if (!participant) throw new Error("Seed data is missing");
  const result = store().selectParticipant(participant.id);
  expect(result.ok).toBe(true);
  return participant;
}

function makeHistoryEntry(index: number): HistoryEntry {
  return {
    id: `history-${index}`,
    participantId: "player-lihindu",
    participantName: "Lihindu",
    participantColor: "#c084fc",
    punishmentId: "punish-sing-20",
    punishmentTitle: "Sing a song for 20 seconds",
    punishmentDifficulty: "easy",
    timestamp: 1_700_000_000_000 + index,
    status: "accepted",
  };
}

beforeEach(() => {
  localStorage.clear();
  store().resetApp();
  useGameStore.setState({ spinAgainToken: 0, resetWheelToken: 0 });
  localStorage.clear();
});

describe("participants slice", () => {
  it("adds, updates, and removes participants", () => {
    const addResult = store().addParticipant({
      name: "  Nimal  ",
      difficulty: "hard",
      active: true,
    });
    expect(addResult).toEqual({ ok: true });

    const added = store().participants.find(
      (participant) => participant.name === "Nimal",
    );
    expect(added).toBeDefined();
    expect(added?.id).toMatch(/^player-/);
    expect(added?.difficulty).toBe("hard");
    expect(added?.color).toMatch(/^#[0-9a-f]{6}$/i);

    const updateResult = store().updateParticipant(added!.id, {
      name: "Nimal Perera",
      difficulty: "easy",
      active: false,
    });
    expect(updateResult).toEqual({ ok: true });
    const updated = store().participants.find(
      (participant) => participant.id === added!.id,
    );
    expect(updated?.name).toBe("Nimal Perera");
    expect(updated?.difficulty).toBe("easy");
    expect(updated?.active).toBe(false);

    expect(store().removeParticipant(added!.id)).toEqual({ ok: true });
    expect(
      store().participants.some((participant) => participant.id === added!.id),
    ).toBe(false);
  });

  it("rejects empty, duplicate, and overly long names", () => {
    expect(
      store().addParticipant({ name: "   ", difficulty: "normal", active: true })
        .ok,
    ).toBe(false);
    expect(
      store().addParticipant({
        name: "  lihindu ",
        difficulty: "normal",
        active: true,
      }).ok,
    ).toBe(false);
    expect(
      store().addParticipant({
        name: "x".repeat(40),
        difficulty: "normal",
        active: true,
      }).ok,
    ).toBe(false);
  });

  it("selects only active participants and clears invalid selections", () => {
    expect(store().selectParticipant("missing-player").ok).toBe(false);

    const participant = store().participants[0]!;
    expect(store().selectParticipant(participant.id)).toEqual({ ok: true });
    expect(store().selectedParticipantId).toBe(participant.id);

    expect(store().toggleParticipant(participant.id).ok).toBe(true);
    expect(store().selectedParticipantId).toBeNull();
    expect(store().selectParticipant(participant.id).ok).toBe(false);

    expect(store().selectParticipant(null)).toEqual({ ok: true });
  });

  it("clears the selection when the selected player is deleted", () => {
    const participant = selectFirstParticipant();
    expect(store().removeParticipant(participant.id)).toEqual({ ok: true });
    expect(store().selectedParticipantId).toBeNull();
  });

  it("updates a participant's difficulty", () => {
    const participant = store().participants[0]!;
    expect(
      store().setParticipantDifficulty(participant.id, "random"),
    ).toEqual({ ok: true });
    expect(
      store().participants.find((item) => item.id === participant.id)
        ?.difficulty,
    ).toBe("random");
    expect(
      store().setParticipantDifficulty("missing", "easy").ok,
    ).toBe(false);
  });
});

describe("punishments slice", () => {
  it("adds, edits, benches, and deletes punishments", () => {
    expect(
      store().addPunishment({
        title: "  Tell a joke  ",
        description: "  Make it clean.  ",
        difficulty: "medium",
        category: "Comedy",
        active: true,
      }),
    ).toEqual({ ok: true });

    const added = store().punishments.find(
      (punishment) => punishment.title === "Tell a joke",
    );
    expect(added).toBeDefined();
    expect(added?.description).toBe("Make it clean.");
    expect(added?.category).toBe("Comedy");

    expect(
      store().updatePunishment(added!.id, {
        title: "Tell two jokes",
        description: "",
        difficulty: "hard",
        active: true,
      }).ok,
    ).toBe(true);
    const updated = store().punishments.find(
      (punishment) => punishment.id === added!.id,
    );
    expect(updated?.title).toBe("Tell two jokes");
    expect(updated?.difficulty).toBe("hard");

    expect(store().togglePunishment(added!.id).ok).toBe(true);
    expect(
      store().punishments.find((punishment) => punishment.id === added!.id)
        ?.active,
    ).toBe(false);

    expect(store().removePunishment(added!.id)).toEqual({ ok: true });
    expect(
      store().punishments.some((punishment) => punishment.id === added!.id),
    ).toBe(false);
  });

  it("validates punishment input", () => {
    expect(
      store().addPunishment({
        title: "   ",
        description: "",
        difficulty: "easy",
        active: true,
      }).ok,
    ).toBe(false);

    expect(
      store().addPunishment({
        title: "x".repeat(100),
        description: "",
        difficulty: "easy",
        active: true,
      }).ok,
    ).toBe(false);

    expect(
      store().updatePunishment("missing", {
        title: "Valid",
        description: "",
        difficulty: "easy",
        active: true,
      }).ok,
    ).toBe(false);
  });
});

describe("spin flow", () => {
  it("blocks spins without a player or active punishment", () => {
    expect(store().requestSpin().ok).toBe(false);

    selectFirstParticipant();
    useGameStore.setState({
      punishments: store().punishments.map((punishment) => ({
        ...punishment,
        active: false,
      })),
    });
    expect(store().requestSpin().ok).toBe(false);

    useGameStore.setState({ selectedParticipantId: "missing-player" });
    expect(store().requestSpin().ok).toBe(false);
  });

  it("selects a punishment from the active list and locks the wheel", () => {
    const participant = selectFirstParticipant();
    const spin = store().requestSpin();

    expect(spin.ok).toBe(true);
    if (!spin.ok) return;

    const active = store().punishments.filter((punishment) => punishment.active);
    expect(active[spin.outcome.punishmentIndex]?.id).toBe(
      spin.outcome.punishment.id,
    );
    expect(spin.outcome.participantId).toBe(participant.id);
    expect(spin.outcome.profileUsed).toBe(participant.difficulty);
    expect(store().isSpinning).toBe(true);
    expect(store().pendingOutcome?.id).toBe(spin.outcome.id);

    expect(store().requestSpin().ok).toBe(false);
    expect(store().spinAgain()).toBeUndefined();
  });

  it("blocks editing players and punishments while spinning", () => {
    const participant = selectFirstParticipant();
    store().requestSpin();

    expect(store().removeParticipant(participant.id).ok).toBe(false);
    expect(store().toggleParticipant(participant.id).ok).toBe(false);
    expect(
      store().setParticipantDifficulty(participant.id, "hard").ok,
    ).toBe(false);

    const punishment = store().punishments[0]!;
    expect(
      store().addPunishment({
        title: "Sneaky dare",
        description: "",
        difficulty: "easy",
        active: true,
      }).ok,
    ).toBe(false);
    expect(
      store().updatePunishment(punishment.id, {
        title: "Changed",
        description: "",
        difficulty: "easy",
        active: true,
      }).ok,
    ).toBe(false);
    expect(store().togglePunishment(punishment.id).ok).toBe(false);
    expect(store().removePunishment(punishment.id).ok).toBe(false);
  });

  it("records a pending history entry at reveal and resolves it", () => {
    selectFirstParticipant();
    const spin = store().requestSpin();
    expect(spin.ok).toBe(true);

    const completed = store().completeSpin();
    expect(completed).not.toBeNull();
    expect(store().isSpinning).toBe(false);
    expect(store().pendingOutcome).toBeNull();
    expect(store().lastResult?.historyId).toBe(completed!.historyId);

    const entry = store().history[0]!;
    expect(entry.id).toBe(completed!.historyId);
    expect(entry.status).toBe("pending");
    expect(entry.punishmentTitle).toBe(spin.ok ? spin.outcome.punishment.title : "");

    store().acceptResult();
    expect(store().history[0]?.status).toBe("accepted");
    expect(store().lastResult).toBeNull();
  });

  it("can skip a result without losing the history snapshot", () => {
    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();
    const title = store().history[0]!.punishmentTitle;

    store().skipResult();
    expect(store().history[0]?.status).toBe("skipped");

    const punishmentId = store().history[0]!.punishmentId;
    expect(store().removePunishment(punishmentId).ok).toBe(true);
    expect(store().history[0]?.punishmentTitle).toBe(title);

    const stats = computeStatistics(store().history);
    expect(stats.totalSkipped).toBe(1);
    expect(stats.totalReceived).toBe(0);
  });

  it("dismisses without resolving so the entry stays pending", () => {
    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();
    store().dismissResult();

    expect(store().lastResult).toBeNull();
    expect(store().history[0]?.status).toBe("pending");
  });

  it("cancels a spin without recording history", () => {
    selectFirstParticipant();
    store().requestSpin();
    store().cancelSpin();

    expect(store().isSpinning).toBe(false);
    expect(store().pendingOutcome).toBeNull();
    expect(store().history).toHaveLength(0);
  });

  it("spins again for the same player through a token", () => {
    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();
    const token = store().spinAgainToken;

    store().spinAgain();
    expect(store().lastResult).toBeNull();
    expect(store().spinAgainToken).toBe(token + 1);
  });

  it("caps history at the configured limit", () => {
    useGameStore.setState({
      history: Array.from({ length: HISTORY_LIMIT }, (_, index) =>
        makeHistoryEntry(index),
      ),
    });

    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();

    expect(store().history).toHaveLength(HISTORY_LIMIT);
    expect(store().history[0]?.status).toBe("pending");
  });
});

describe("reset actions", () => {
  it("resets the selected wheel state", () => {
    selectFirstParticipant();
    const token = store().resetWheelToken;
    expect(store().resetWheel()).toEqual({ ok: true });

    expect(store().selectedParticipantId).toBeNull();
    expect(store().lastResult).toBeNull();
    expect(store().resetWheelToken).toBe(token + 1);
  });

  it("refuses to reset mid-spin", () => {
    selectFirstParticipant();
    store().requestSpin();
    expect(store().resetWheel().ok).toBe(false);
  });

  it("restores the seed app", () => {
    store().addParticipant({
      name: "Temporary",
      difficulty: "hard",
      active: true,
    });
    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();

    const resetToken = store().resetWheelToken;
    store().resetApp();

    expect(store().participants).toHaveLength(6);
    expect(store().punishments).toHaveLength(18);
    expect(store().history).toHaveLength(0);
    expect(store().selectedParticipantId).toBeNull();
    expect(store().isSpinning).toBe(false);
    expect(store().spinAgainToken).toBe(0);
    expect(store().resetWheelToken).toBe(resetToken + 1);
  });
});

describe("persistence integration", () => {
  it("writes domain state to localStorage after changes", () => {
    store().addParticipant({
      name: "Persisted Player",
      difficulty: "random",
      active: true,
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as {
      state: { participants: Array<{ name: string }> };
      version: number;
    };

    expect(parsed.version).toBe(1);
    expect(
      parsed.state.participants.some(
        (participant) => participant.name === "Persisted Player",
      ),
    ).toBe(true);
  });

  it("does not persist transient spin state", () => {
    selectFirstParticipant();
    store().requestSpin();
    store().completeSpin();

    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as {
      state: Record<string, unknown>;
    };
    expect(parsed.state.isSpinning).toBeUndefined();
    expect(parsed.state.pendingOutcome).toBeUndefined();
    expect(parsed.state.lastResult).toBeUndefined();
  });

  it("rehydrates saved state after a simulated refresh", async () => {
    store().addParticipant({
      name: "Reload Me",
      difficulty: "hard",
      active: true,
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();

    // Simulate the next boot: the in-memory store is fresh, but localStorage
    // still holds the previous session.
    useGameStore.setState({ participants: [] });
    localStorage.setItem(STORAGE_KEY, raw!);

    await useGameStore.persist.rehydrate();

    expect(
      store().participants.some(
        (participant) => participant.name === "Reload Me",
      ),
    ).toBe(true);
  });
});
