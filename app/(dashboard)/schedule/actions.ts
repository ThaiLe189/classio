"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  class_id: z.string().uuid(),
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  room: z.string().optional(),
});

export async function addSchedule(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    class_id: formData.get("class_id"),
    day_of_week: formData.get("day_of_week"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    room: String(formData.get("room") ?? "").trim() || undefined,
  });
  if (!parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase.from("schedules").insert({
    owner_id: user.id,
    class_id: d.class_id,
    day_of_week: d.day_of_week,
    start_time: d.start_time,
    end_time: d.end_time,
    room: d.room ?? null,
  });
  revalidatePath("/schedule");
}

export async function deleteSchedule(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("schedules").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/schedule");
}
