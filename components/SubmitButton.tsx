"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

// Flowbite button styles.
export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary:
      "text-white bg-brand-700 hover:bg-brand-800 focus:ring-4 focus:ring-brand-300",
    danger:
      "text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300",
    ghost:
      "text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-brand-700 focus:ring-4 focus:ring-gray-100",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {pending && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {pending ? "Processing…" : children}
    </button>
  );
}
