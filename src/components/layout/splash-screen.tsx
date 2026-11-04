"use client";

import { Logo } from "./logo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-night">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_45%,rgba(168,85,247,0.22),transparent_70%)]"
      />
      <div className="relative animate-[float-slow_4s_ease-in-out_infinite]">
        <Logo href={null} />
      </div>
      <div className="relative flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-fuchsia-300/70"
            style={{
              animation: "marquee-pulse 1.2s ease-in-out infinite",
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </div>
      <p className="relative text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/30">
        Warming up the wheel
      </p>
      <span className="sr-only" role="status">
        Loading Party Roulette
      </span>
    </div>
  );
}
