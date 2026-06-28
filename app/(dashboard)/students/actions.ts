"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().min(1, "Student name is required"),
  class_id: z.string().uuid().nullable(),
  phone: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  note: z.string().optional(),
});

function readForm(formData: FormData) {
  const classId = String(formData.get("class_id") ?? "");
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    class_id: classId || null,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    parent_name: String(formData.get("parent_name") ?? "").trim() || undefined,
    parent_phone: String(formData.get("parent_phone") ?? "").trim() || undefined,
    note: String(formData.get("note") ?? "").trim() || undefined,
  };
}

export async function createStudent(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse(readForm(formData));
  if (!parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase.from("students").insert({
    owner_id: user.id,
    full_name: d.full_name,
    class_id: d.class_id ?? null,
    phone: d.phone ?? null,
    parent_name: d.parent_name ?? null,
    parent_phone: d.parent_phone ?? null,
    note: d.note ?? null,
  });
  revalidatePath("/students");
}

export async function updateStudent(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse(readForm(formData));
  if (!id || !parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase
    .from("students")
    .update({
      full_name: d.full_name,
      class_id: d.class_id ?? null,
      phone: d.phone ?? null,
      parent_name: d.parent_name ?? null,
      parent_phone: d.parent_phone ?? null,
      note: d.note ?? null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);
  revalidatePath("/students");
  redirect("/students");
}

export async function deleteStudent(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("students").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/students");
}
