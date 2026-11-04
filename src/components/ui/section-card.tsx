import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionCard({
  children,
  className,
  as: Component = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
}) {
  return (
    <Component className={cn("glass-panel rounded-3xl", className)}>
      {children}
    </Component>
  );
}

export function SectionCardHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/60">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold tracking-tight text-white/90">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-white/40">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
