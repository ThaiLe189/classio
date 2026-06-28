"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthState } from "../actions";
import { Field, Input, Card } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

const initial: AuthState = {};

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, initial);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-2xl -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M7 9.2V14c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9.2" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Start managing your classes</p>
        </div>

        <Card className="shadow-(--shadow-pop)">
          {state.message ? (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
              <span>{state.message}</span>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <Field label="Full name">
                <Input name="full_name" type="text" autoComplete="name" placeholder="Jane Doe" />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
              </Field>
              <Field label="Password" hint="At least 6 characters">
                <Input name="password" type="password" required autoComplete="new-password" minLength={6} placeholder="••••••••" />
              </Field>
              {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
              )}
              <SubmitButton className="w-full">Sign up</SubmitButton>
            </form>
          )}
        </Card>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
