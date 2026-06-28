"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credsSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthState = { error?: string; message?: string; email?: string };

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = credsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
      return {
        error: "Email not confirmed. Check your inbox (including spam) or resend the confirmation email.",
        email: parsed.data.email,
      };
    }
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const parsed = credsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: fullName || parsed.data.email },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });
  if (error) {
    return { error: error.message };
  }
  // Supabase returns a fake "success" when the email already exists -> empty identities.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { error: "This email is already registered. Please sign in." };
  }

  return {
    message: "Sign-up successful! Please check your email to confirm your account before signing in.",
  };
}

export async function resendConfirmation(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { error: "Invalid email.", email };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/dashboard` },
  });
  if (error) {
    const msg = /rate|too many|seconds/i.test(error.message)
      ? "Too many requests. Try again in a few minutes."
      : error.message;
    return { error: msg, email: parsed.data };
  }
  return { message: "Confirmation email resent.", email: parsed.data };
}
