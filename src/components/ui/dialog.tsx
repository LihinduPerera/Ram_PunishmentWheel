"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Button } from "./button";

const subscribeToMount = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  dismissible?: boolean;
  hideClose?: boolean;
  className?: string;
  eyebrow?: string;
}

const widths = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  hideClose = false,
  className,
  eyebrow,
}: DialogProps) {
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!mounted) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "fixed inset-0 z-[100] m-auto w-[calc(100vw-1.5rem)] bg-transparent p-0",
        widths[size],
      )}
      onCancel={(event) => {
        if (!dismissible) {
          event.preventDefault();
          return;
        }
        onOpenChange(false);
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && dismissible) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={cn(
          "dialog-card glass-panel relative max-h-[88dvh] overflow-y-auto rounded-3xl",
          className,
        )}
      >
        {dismissible && !hideClose && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-10 size-8 text-white/45 hover:text-white"
          >
            <X className="size-4" />
          </Button>
        )}

        <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
          <div className="pr-8">
            {eyebrow && (
              <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-fuchsia-300/70">
                {eyebrow}
              </p>
            )}
            <h2
              id={titleId}
              className="font-display text-xl font-semibold tracking-tight text-white"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1.5 text-sm leading-relaxed text-white/45"
              >
                {description}
              </p>
            )}
          </div>

          <div className="mt-5">{children}</div>
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
