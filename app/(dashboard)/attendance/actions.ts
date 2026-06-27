"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database";

const VALID: AttendanceStatus[] = ["present", "absent", "late"];

export async function saveAttendance(formData: FormData) {
  const user = await requireUser();
  const classId = String(formData.get("class_id") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!classId || !date) return;

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId);

  const rows = (students ?? []).map((s) => {
    const raw = String(formData.get(`status_${s.id}`) ?? "present");
    const status = (VALID as string[]).includes(raw)
      ? (raw as AttendanceStatus)
      : "present";
    return {
      owner_id: user.id,
      student_id: s.id,
      class_id: classId,
      date,
      status,
    };
  });

  if (rows.length > 0) {
    await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "student_id,date" });
  }
  revalidatePath("/attendance");
}
