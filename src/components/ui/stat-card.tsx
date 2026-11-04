import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "#c084fc",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel-soft relative overflow-hidden rounded-2xl px-4 py-3.5",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full blur-2xl"
        style={{ backgroundColor: `${accent}22` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.63rem] font-semibold uppercase tracking-[0.14em] text-white/38">
            {label}
          </p>
          <p className="mt-1.5 truncate font-display text-xl font-semibold tracking-tight text-white">
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 truncate text-[0.68rem] text-white/35">
              {hint}
            </p>
          )}
        </div>
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.07]"
          style={{ color: accent, backgroundColor: `${accent}14` }}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
