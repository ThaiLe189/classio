"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  student_id: z.string().uuid(),
  subject: z.string().min(1, "Môn bắt buộc"),
  assignment: z.string().optional(),
  score: z.coerce.number().min(0),
  max_score: z.coerce.number().min(1),
  date: z.string().min(1),
});

export async function addGrade(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    student_id: formData.get("student_id"),
    subject: String(formData.get("subject") ?? "").trim(),
    assignment: String(formData.get("assignment") ?? "").trim() || undefined,
    score: formData.get("score"),
    max_score: formData.get("max_score") || 10,
    date: formData.get("date"),
  });
  if (!parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase.from("grades").insert({
    owner_id: user.id,
    student_id: d.student_id,
    subject: d.subject,
    assignment: d.assignment ?? null,
    score: d.score,
    max_score: d.max_score,
    date: d.date,
  });
  revalidatePath("/grades");
}

export async function deleteGrade(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("grades").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/grades");
}
