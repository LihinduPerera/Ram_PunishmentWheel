import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pink-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-white/15 bg-gradient-to-b from-fuchsia-500 to-purple-600 text-white shadow-[0_8px_30px_-8px_rgba(192,38,211,0.7)] hover:from-fuchsia-400 hover:to-purple-500 hover:shadow-[0_10px_38px_-6px_rgba(244,114,182,0.55)]",
  secondary:
    "border border-white/10 bg-white/[0.055] text-white/90 hover:border-white/20 hover:bg-white/[0.09]",
  ghost:
    "border border-transparent text-white/65 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-400/25 bg-rose-500/12 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/20",
  success:
    "border border-emerald-400/25 bg-emerald-500/12 text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-500/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[0.95rem]",
  icon: "size-10 p-0",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
