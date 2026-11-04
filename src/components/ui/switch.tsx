"use client";

import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
  id,
}: SwitchProps) {
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200",
        checked
          ? "border-fuchsia-300/30 bg-fuchsia-500/80 shadow-[0_0_18px_rgba(217,70,239,0.35)]"
          : "border-white/10 bg-white/10",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[1.4rem]" : "translate-x-1",
        )}
      />
    </button>
  );

  if (!label && !description) return control;

  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-semibold text-white/90"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              {description}
            </p>
          )}
        </div>
      )}
      {control}
    </div>
  );
}
