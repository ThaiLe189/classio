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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold text-indigo-600">Classio</h1>
        <p className="mb-6 text-sm text-gray-500">Tạo tài khoản mới</p>

        {state.message ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            {state.message}
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <Field label="Họ tên">
              <Input name="full_name" type="text" autoComplete="name" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="email" />
            </Field>
            <Field label="Mật khẩu">
              <Input name="password" type="password" required autoComplete="new-password" minLength={6} />
            </Field>
            {state.error && <p className="text-sm text-red-600">{state.error}</p>}
            <SubmitButton className="w-full">Đăng ký</SubmitButton>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
