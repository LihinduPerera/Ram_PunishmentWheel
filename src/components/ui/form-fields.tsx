import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold tracking-wide text-white/70"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn("field-base", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-[0.7rem] leading-relaxed text-white/38">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  counter?: { value: number; max: number };
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  counter,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold tracking-wide text-white/70"
          >
            {label}
          </label>
        )}
        {counter && (
          <span className="text-[0.65rem] tabular-nums text-white/30">
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        className={cn("field-base min-h-24 resize-y", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-[0.7rem] leading-relaxed text-white/38">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold tracking-wide text-white/70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "field-base cursor-pointer appearance-none pr-10",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/45"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {hint && !error && (
        <p className="text-[0.7rem] leading-relaxed text-white/38">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-300">{error}</p>
      )}
    </div>
  );
}
