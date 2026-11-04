"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Gamepad2,
  Settings,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "@/store/toast-store";
import { useGameStore } from "@/store/game-store";
import { Logo } from "./logo";

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Play", shortLabel: "Play", icon: Gamepad2 },
  {
    href: "/participants",
    label: "Players",
    shortLabel: "Players",
    icon: Users,
  },
  {
    href: "/punishments",
    label: "Punishments",
    shortLabel: "Dares",
    icon: ShieldAlert,
  },
  { href: "/history", label: "Stats", shortLabel: "Stats", icon: BarChart3 },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
  },
];

function useNavGuard() {
  const isSpinning = useGameStore((state) => state.isSpinning);

  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isSpinning) return;
    event.preventDefault();
    toast({
      title: "Let the wheel finish!",
      description: "You can explore again once it lands.",
      variant: "info",
    });
  };
}

export function AppHeader() {
  const pathname = usePathname();
  const isSpinning = useGameStore((state) => state.isSpinning);
  const guardNav = useNavGuard();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-night/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={guardNav}
                aria-current={active ? "page" : undefined}
                aria-disabled={isSpinning || undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/45 hover:bg-white/[0.045] hover:text-white/80",
                  isSpinning && "opacity-55",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-500/[0.07] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-emerald-200/70 lg:flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            House always wins
          </span>
          <Link
            href="/settings"
            onClick={guardNav}
            aria-label="Settings"
            aria-disabled={isSpinning || undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border border-white/[0.08] text-white/50 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white",
              pathname === "/settings" &&
                "border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-200",
            )}
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const isSpinning = useGameStore((state) => state.isSpinning);
  const guardNav = useNavGuard();

  return (
    <nav
      aria-label="Mobile navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-night/90 px-2 pt-2 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={guardNav}
              aria-current={active ? "page" : undefined}
              aria-disabled={isSpinning || undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.58rem] font-semibold transition-colors",
                active ? "text-fuchsia-200" : "text-white/35",
                isSpinning && "opacity-55",
              )}
            >
              <span
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-lg transition-colors",
                  active && "bg-fuchsia-500/12",
                )}
              >
                <Icon className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                {active && (
                  <span className="absolute -top-1 size-1 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f472b6]" />
                )}
              </span>
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
