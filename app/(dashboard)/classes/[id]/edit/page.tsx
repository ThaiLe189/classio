import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Textarea, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import { updateClass } from "../../actions";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: cls }, { data: allClasses }, { data: allSchedules }] = await Promise.all([
    supabase.from("classes").select("id, name, description").eq("id", id).single(),
    supabase.from("classes").select("id, name").order("name"),
    supabase.from("schedules").select("id, class_id, day_of_week, start_time, end_time, room"),
  ]);
  if (!cls) notFound();

  const classMap = new Map((allClasses ?? []).map((c) => [c.id, c.name]));
  const colorByClass = new Map<string, number>();
  (allClasses ?? []).forEach((c, i) => colorByClass.set(c.id, i));

  // This class's current sessions (pre-selected); other classes shown as context.
  const initial = (allSchedules ?? [])
    .filter((s) => s.class_id === id)
    .map((s) => ({ day: s.day_of_week, start: s.start_time, end: s.end_time }));
  const otherSessions = (allSchedules ?? [])
    .filter((s) => s.class_id !== id)
    .map((s) => ({
      id: s.id,
      day: s.day_of_week,
      start: s.start_time,
      end: s.end_time,
      title: classMap.get(s.class_id) ?? "—",
      room: s.room,
      colorIndex: colorByClass.get(s.class_id) ?? 0,
    }));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit class" />
      <Card>
        <form action={updateClass} className="space-y-3">
          <input type="hidden" name="id" value={cls.id} />
          <Field label="Class name">
            <Input name="name" defaultValue={cls.name} required />
          </Field>
          <Field label="Description">
            <Textarea name="description" rows={2} defaultValue={cls.description ?? ""} />
          </Field>
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-900">Weekly schedule</span>
            <p className="mb-2 text-xs text-gray-500">
              This class&apos;s current times are pre-selected. Drag to add, drag over a selection to remove.
            </p>
            <ScheduleCalendar initial={initial} existing={otherSessions} />
          </div>
          <div className="flex gap-2">
            <SubmitButton>Save</SubmitButton>
            <Link
              href="/classes"
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
