"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

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
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    >
      {pending ? "Đang xử lý…" : children}
    </button>
  );
}
