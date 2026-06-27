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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-indigo-600">Classio</h1>
        <p className="mb-6 text-sm text-gray-500">Đăng nhập để quản lý lớp học của bạn</p>

        <form action={formAction} className="space-y-4">
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" defaultValue={state.email} />
          </Field>
          <Field label="Mật khẩu">
            <Input name="password" type="password" required autoComplete="current-password" />
          </Field>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SubmitButton className="w-full">Đăng nhập</SubmitButton>
        </form>

        {needConfirm && (
          <form action={resendAction} className="mt-3 space-y-1">
            <input type="hidden" name="email" value={state.email} />
            <button type="submit" className="text-sm font-medium text-indigo-600 hover:underline">
              Gửi lại email xác nhận
            </button>
            {resend.message && <p className="text-sm text-green-600">{resend.message}</p>}
            {resend.error && <p className="text-sm text-red-600">{resend.error}</p>}
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </Card>
    </div>
  );
}
