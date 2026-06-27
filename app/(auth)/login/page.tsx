"use client";

import { useActionState } from "react";
import { authenticate, type AuthState } from "../actions";
import { Field, Input, Card } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

const initialAuthState: AuthState = { stage: "email", email: "" };

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, initialAuthState);
  const isOtp = state.stage === "otp";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-indigo-600">Classio</h1>
        <p className="mb-6 text-sm text-gray-500">
          {isOtp
            ? "Nhập mã 6 số vừa gửi tới email của bạn"
            : "Đăng nhập bằng email — chúng tôi sẽ gửi mã xác thực"}
        </p>

        {!isOtp ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="intent" value="send" />
            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={state.email}
                placeholder="ban@example.com"
              />
            </Field>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <SubmitButton className="w-full">Gửi mã</SubmitButton>
          </form>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="intent" value="verify" />
            <input type="hidden" name="email" value={state.email} />
            <Field label="Mã xác thực (6 số)">
              <Input
                name="token"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
                placeholder="______"
                className="text-center text-lg tracking-[0.5em]"
              />
            </Field>
            {state.message && <p className="text-sm text-green-600">{state.message}</p>}
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <SubmitButton className="w-full">Xác nhận & đăng nhập</SubmitButton>
          </form>
        )}

        {isOtp && (
          <form action={formAction} className="mt-3 text-center">
            <input type="hidden" name="intent" value="send" />
            <input type="hidden" name="email" value={state.email} />
            <button
              type="submit"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Gửi lại mã / đổi email
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
