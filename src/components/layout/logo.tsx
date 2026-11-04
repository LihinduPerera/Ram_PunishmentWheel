import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <span className="relative flex size-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
          <defs>
            <linearGradient id="logo-rim" x1="4" y1="4" x2="36" y2="36">
              <stop stopColor="#f472b6" />
              <stop offset="0.5" stopColor="#c084fc" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
            <radialGradient id="logo-center" cx="50%" cy="42%" r="60%">
              <stop stopColor="#fda4af" />
              <stop offset="1" stopColor="#c026d3" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="20" r="17" fill="#0b0716" />
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="url(#logo-rim)"
            strokeWidth="5"
            strokeDasharray="7.5 4"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="9" fill="url(#logo-center)" />
          <circle cx="20" cy="20" r="3.2" fill="#0b0716" />
        </svg>
        <span className="absolute inset-0 rounded-full bg-fuchsia-500/20 blur-lg" />
      </span>
      {!compact && (
        <span className="font-display text-[1.05rem] font-bold leading-none tracking-tight sm:text-lg">
          <span className="text-white">Party</span>{" "}
          <span className="text-gradient-neon">Roulette</span>
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="Party Roulette home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
