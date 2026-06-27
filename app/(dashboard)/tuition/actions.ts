"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  student_id: z.string().uuid(),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Kỳ không hợp lệ"),
  amount: z.coerce.number().min(0),
  is_paid: z.boolean(),
});

export async function upsertTuition(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    student_id: formData.get("student_id"),
    period: formData.get("period"),
    amount: formData.get("amount") || 0,
    is_paid: formData.get("is_paid") === "on",
  });
  if (!parsed.success) return;
  const d = parsed.data;
  const supabase = await createClient();
  await supabase.from("tuitions").upsert(
    {
      owner_id: user.id,
      student_id: d.student_id,
      period: d.period,
      amount: d.amount,
      is_paid: d.is_paid,
      paid_at: d.is_paid ? new Date().toISOString() : null,
    },
    { onConflict: "student_id,period" }
  );
  revalidatePath("/tuition");
}
