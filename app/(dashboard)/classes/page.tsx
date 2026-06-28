import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import CreateClassForm from "./CreateClassForm";
import { deleteClass } from "./actions";

export default async function ClassesPage() {
  await requireUser();
  const supabase = await createClient();
  const [{ data: classes }, { data: schedules }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("schedules")
      .select("id, class_id, day_of_week, start_time, end_time, room"),
  ]);

  // All existing sessions, colored per class — shown on the create-class calendar.
  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const colorByClass = new Map<string, number>();
  (classes ?? []).forEach((c, i) => colorByClass.set(c.id, i));
  const existingSessions = (schedules ?? []).map((s) => ({
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
      <PageHeader title="Classes" description="Create and manage your classes." />

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Add new class</h2>
        <CreateClassForm existing={existingSessions} />
      </Card>

      {!classes || classes.length === 0 ? (
        <Empty>No classes yet. Add your first one above.</Empty>
      ) : (
        <div className="space-y-2">
          {classes.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{c.name}</p>
                {c.description && (
                  <p className="text-sm text-slate-500">{c.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/classes/${c.id}/edit`}
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Edit
                </Link>
                <form action={deleteClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <SubmitButton variant="danger">Delete</SubmitButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
