"use client";

import type { FormEvent } from "react";

export function ConfirmButton({
  action,
  label,
  className = "btn-secondary",
}: {
  action: (fd: FormData) => Promise<void> | void;
  label: string;
  className?: string;
}) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (!confirm(`Delete "${label}"? This removes the report from public listings. This cannot be undone.`)) {
      e.preventDefault();
    }
  }
  return (
    <form action={action} onSubmit={onSubmit}>
      <button className={className} type="submit">{label}</button>
    </form>
  );
}