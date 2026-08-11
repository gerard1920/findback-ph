"use client";

import { useId, type ReactNode } from "react";

export function Switch({
  checked,
  onChange,
  disabled = false,
  name,
  label,
  description,
  defaultChecked,
}: {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  defaultChecked?: boolean;
}) {
  const id = useId();
  const [internal, setInternal] = useControlled(checked, defaultChecked ?? false, onChange);

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-slate-900">
              {label}
            </label>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}
      <label
        aria-hidden={disabled ? "true" : undefined}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${internal ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={internal}
          disabled={disabled}
          name={name}
          onChange={(e) => setInternal(e.target.checked)}
        />
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-black/5 transition duration-200 ${
            internal ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </label>
    </div>
  );
}

import { useState, type Dispatch, type SetStateAction } from "react";

function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T,
  externalOnChange?: (next: T) => void,
): [T, Dispatch<SetStateAction<T>>] {
  const [internalState, setInternal] = useState<T>(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : internalState;

  const setValue: Dispatch<SetStateAction<T>> = (next) => {
    const resolved =
      typeof next === "function" ? (next as (prev: T) => T)(value) : (next as T);
    if (!isControlled) setInternal(resolved);
    externalOnChange?.(resolved);
  };

  return [value, setValue];
}
