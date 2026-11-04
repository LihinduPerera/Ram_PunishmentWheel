import { cn } from "@/lib/cn";

const sizes = {
  xs: "size-7 text-[0.6rem]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ParticipantAvatar({
  name,
  color,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  color: string;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-inner select-none",
        sizes[size],
        ring && "ring-2 ring-white/25 ring-offset-2 ring-offset-night",
        className,
      )}
      style={{
        background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.32), transparent 38%), linear-gradient(145deg, ${color}, ${color}99)`,
        boxShadow: `0 4px 18px -6px ${color}aa`,
        textShadow: "0 1px 3px rgba(0,0,0,0.35)",
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
