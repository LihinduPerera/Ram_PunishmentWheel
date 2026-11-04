"use client";

import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex w-full flex-wrap gap-1 rounded-2xl border border-white/[0.07] bg-black/25 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-200",
              size === "sm" ? "px-2 py-1.5 text-[0.68rem]" : "px-3 py-2 text-xs",
              active
                ? "bg-white/[0.11] text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]"
                : "text-white/40 hover:bg-white/[0.045] hover:text-white/70",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={
              active && option.color
                ? {
                    color: option.color,
                    backgroundColor: `${option.color}18`,
                  }
                : undefined
            }
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
