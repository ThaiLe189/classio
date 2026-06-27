"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1, "Tên lớp bắt buộc"),
  description: z.string().optional(),
});

export async function createClass(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("classes").insert({
    owner_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
  });
  revalidatePath("/classes");
}

export async function updateClass(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  const supabase = await createClient();
  await supabase
    .from("classes")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);
  revalidatePath("/classes");
  redirect("/classes");
}

export async function deleteClass(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("classes").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/classes");
}
