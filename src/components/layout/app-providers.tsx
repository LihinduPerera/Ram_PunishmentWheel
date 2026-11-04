"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useGameStore } from "@/store/game-store";
import { audio } from "@/lib/audio";
import { AppHeader, MobileNav } from "@/components/layout/app-header";
import { ResultOverlay } from "@/components/results/result-overlay";
import { SplashScreen } from "@/components/layout/splash-screen";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);

  useEffect(() => {
    let active = true;

    const unsubscribe = useGameStore.persist.onFinishHydration(() => {
      if (active) setReady(true);
    });

    void Promise.resolve(useGameStore.persist.rehydrate())
      .catch(() => {
        // Sanitized defaults remain available if storage is unreadable.
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    audio.configure({ soundEnabled, musicEnabled });
  }, [soundEnabled, musicEnabled]);

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  if (!ready) return <SplashScreen />;

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25 }}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-white px-4 py-2 text-sm font-semibold text-night transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <AppHeader />
      <main id="main-content" className="pb-28 md:pb-12">
        {children}
      </main>
      <MobileNav />
      <ResultOverlay />
      <Toaster />
    </MotionConfig>
  );
}
