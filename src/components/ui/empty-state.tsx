import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-fuchsia-500/20 blur-2xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-fuchsia-200">
          <Icon className="size-6" strokeWidth={1.7} />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold text-white/90">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
