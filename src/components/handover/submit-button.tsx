"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "", variant = "primary" }: {
  children: React.ReactNode; className?: string; variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-disabled={pending}
    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60 ${variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-[var(--brand-primary-deep)] active:bg-[var(--brand-primary-press)]"
      : "border border-primary bg-white text-primary hover:bg-accent"} ${className}`}>
    {pending ? "Menyimpan…" : children}
  </button>;
}
