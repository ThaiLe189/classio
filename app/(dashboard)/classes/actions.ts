"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
});

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseSchedule(raw: unknown): { day: number; start: string; end: string }[] {
  if (typeof raw !== "string" || !raw) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (b): b is { day: number; start: string; end: string } =>
      !!b &&
      typeof b === "object" &&
      Number.isInteger((b as { day: unknown }).day) &&
      (b as { day: number }).day >= 0 &&
      (b as { day: number }).day <= 6 &&
      TIME_RE.test((b as { start: unknown }).start as string) &&
      TIME_RE.test((b as { end: unknown }).end as string) &&
      ((b as { start: string }).start < (b as { end: string }).end)
  );
}

export type CreateClassState = { ok: boolean };

export async function createClass(
  _prev: CreateClassState | null,
  formData: FormData
): Promise<CreateClassState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false };
  const supabase = await createClient();
  const { data: cls } = await supabase
    .from("classes")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .select("id")
    .single();

  const sessions = parseSchedule(formData.get("schedule"));
  if (cls && sessions.length > 0) {
    await supabase.from("schedules").insert(
      sessions.map((s) => ({
        owner_id: user.id,
        class_id: cls.id,
        day_of_week: s.day,
        start_time: s.start,
        end_time: s.end,
        room: null,
      }))
    );
  }

  revalidatePath("/classes");
  revalidatePath("/schedule");
  return { ok: Boolean(cls) };
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

  // Replace this class's schedule with the calendar selection.
  const sessions = parseSchedule(formData.get("schedule"));
  await supabase.from("schedules").delete().eq("class_id", id).eq("owner_id", user.id);
  if (sessions.length > 0) {
    await supabase.from("schedules").insert(
      sessions.map((s) => ({
        owner_id: user.id,
        class_id: id,
        day_of_week: s.day,
        start_time: s.start,
        end_time: s.end,
        room: null,
      }))
    );
  }

  revalidatePath("/classes");
  revalidatePath("/schedule");
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
