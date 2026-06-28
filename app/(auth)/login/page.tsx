"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, resendConfirmation, type AuthState } from "../actions";
import { Field, Input, Card } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initial);
  const [resend, resendAction] = useActionState(resendConfirmation, initial);
  const needConfirm = Boolean(state.email);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-2xl -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M7 9.2V14c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9.2" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your classes</p>
        </div>

        <Card className="shadow-(--shadow-pop)">
          <form action={formAction} className="space-y-4">
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="email" placeholder="you@email.com" defaultValue={state.email} />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
            </Field>
            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
            )}
            <SubmitButton className="w-full">Sign in</SubmitButton>
          </form>

          {needConfirm && (
            <form action={resendAction} className="mt-3 space-y-1">
              <input type="hidden" name="email" value={state.email} />
              <button type="submit" className="cursor-pointer text-sm font-medium text-brand-600 hover:underline">
                Resend confirmation email
              </button>
              {resend.message && <p className="text-sm text-emerald-600">{resend.message}</p>}
              {resend.error && <p className="text-sm text-red-600">{resend.error}</p>}
            </form>
          )}
        </Card>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
