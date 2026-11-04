import { create } from "zustand";
import { randomId } from "@/lib/random";

export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const TOAST_DURATION_MS = 4200;
const MAX_TOASTS = 4;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = randomId("toast");
    set({
      toasts: [...get().toasts, { ...toast, id }].slice(-MAX_TOASTS),
    });

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        get().dismiss(id);
      }, TOAST_DURATION_MS);
    }

    return id;
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
  clear: () => set({ toasts: [] }),
}));

export function toast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}): string {
  return useToastStore.getState().push({
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
  });
}
