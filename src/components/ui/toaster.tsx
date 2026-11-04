"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/toast-store";
import { cn } from "@/lib/cn";

const icons: Record<ToastVariant, typeof Info> = {
  default: Sparkles,
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

const styles: Record<ToastVariant, string> = {
  default: "border-fuchsia-300/20 bg-fuchsia-500/[0.08] text-fuchsia-100",
  info: "border-sky-300/20 bg-sky-500/[0.08] text-sky-100",
  success:
    "border-emerald-300/20 bg-emerald-500/[0.08] text-emerald-100",
  error: "border-rose-300/20 bg-rose-500/[0.08] text-rose-100",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-3 bottom-24 z-[130] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
                styles[toast.variant],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0 opacity-80" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed opacity-60">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="mt-0.5 rounded-md p-0.5 opacity-40 transition hover:opacity-90"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
