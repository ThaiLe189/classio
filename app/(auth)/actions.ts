"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().email("Email không hợp lệ");

export type AuthState = {
  stage: "email" | "otp";
  email: string;
  error?: string;
  message?: string;
};

export const initialAuthState: AuthState = { stage: "email", email: "" };

export async function authenticate(
  prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const intent = String(formData.get("intent") ?? "");
  const email = String(formData.get("email") ?? prev.email).trim();

  const supabase = await createClient();

  if (intent === "send") {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return { stage: "email", email, error: parsed.error.issues[0]?.message };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { shouldCreateUser: true },
    });
    if (error) {
      const msg = /rate|too many|seconds/i.test(error.message)
        ? "Gửi quá nhiều lần. Vui lòng thử lại sau ít phút."
        : "Không gửi được mã. Kiểm tra lại email.";
      return { stage: "email", email, error: msg };
    }
    return {
      stage: "otp",
      email: parsed.data,
      message: `Đã gửi mã 6 số tới ${parsed.data}. Kiểm tra cả hộp thư spam.`,
    };
  }

  // intent === "verify"
  const token = String(formData.get("token") ?? "").trim();
  if (!/^\d{6}$/.test(token)) {
    return { stage: "otp", email, error: "Mã gồm 6 chữ số." };
  }
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) {
    return { stage: "otp", email, error: "Mã không đúng hoặc đã hết hạn." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function resendOtp(
  prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  return authenticate(prev, formData);
}
