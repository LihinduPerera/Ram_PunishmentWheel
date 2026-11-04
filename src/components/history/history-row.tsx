import {
  CheckCircle2,
  Clock3,
  MinusCircle,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRelativeTime } from "@/lib/dates";
import type { HistoryEntry } from "@/types";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { ParticipantAvatar } from "@/components/participants/participant-avatar";

function StatusIcon({ status }: { status: HistoryEntry["status"] }) {
  if (status === "accepted") {
    return (
      <span
        title="Accepted"
        className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300"
      >
        <CheckCircle2 className="size-3.5" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span
        title="Skipped"
        className="flex size-6 items-center justify-center rounded-full bg-white/[0.05] text-white/30"
      >
        <MinusCircle className="size-3.5" />
      </span>
    );
  }
  return (
    <span
      title="Revealed"
      className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-300/70"
    >
      <Clock3 className="size-3.5" />
    </span>
  );
}

export function HistoryRow({
  entry,
  compact = false,
  showStatus = false,
  className,
}: {
  entry: HistoryEntry;
  compact?: boolean;
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-colors hover:border-white/[0.07] hover:bg-white/[0.03]",
        className,
      )}
    >
      <ParticipantAvatar
        name={entry.participantName}
        color={entry.participantColor}
        size={compact ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "truncate font-medium text-white/85",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {entry.punishmentTitle}
          </p>
          <span className="shrink-0 text-[0.62rem] text-white/28">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[0.68rem] text-white/40">
            {entry.participantName}
          </span>
          <DifficultyBadge
            difficulty={entry.punishmentDifficulty}
            showDot
            className="scale-90 origin-left"
          />
          {entry.punishmentCategory && !compact && (
            <span className="text-[0.6rem] text-white/25">
              {entry.punishmentCategory}
            </span>
          )}
        </div>
        {!compact && (
          <p className="mt-1 text-[0.6rem] text-white/25">
            {formatDateTime(entry.timestamp)}
          </p>
        )}
      </div>
      {showStatus && <StatusIcon status={entry.status} />}
    </article>
  );
}

export function HistoryEmptyHint({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center",
        className,
      )}
    >
      <ShieldAlert className="size-5 text-white/20" />
      <p className="text-xs font-medium text-white/45">
        No punishments served yet
      </p>
      <p className="text-[0.68rem] leading-relaxed text-white/28">
        The wheel is waiting for its first victim.
      </p>
    </div>
  );
}
