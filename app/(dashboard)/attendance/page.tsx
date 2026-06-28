import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { todayISO } from "@/lib/utils";
import { saveAttendance } from "./actions";
import type { AttendanceStatus } from "@/types/database";

const OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
];

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const date = sp.date || todayISO();
  const classId = sp.class || "";
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");

  let students: { id: string; full_name: string }[] = [];
  const current = new Map<string, AttendanceStatus>();

  if (classId) {
    const { data: st } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("class_id", classId)
      .order("full_name");
    students = st ?? [];

    const { data: existing } = await supabase
      .from("attendance")
      .select("student_id, status")
      .eq("class_id", classId)
      .eq("date", date);
    for (const a of existing ?? []) current.set(a.student_id, a.status);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Attendance" description="Pick a class and date, mark status, then save." />

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-4">
          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-900">Class</span>
            <Select name="class" defaultValue={classId} className="w-48">
              <option value="">— Select class —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-900">Date</span>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="block w-44 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-brand-500"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 focus:ring-4 focus:ring-brand-300"
          >
            Load list
          </button>
        </form>
      </Card>

      {!classId ? (
        <Empty>Select a class to start taking attendance.</Empty>
      ) : students.length === 0 ? (
        <Empty>This class has no students.</Empty>
      ) : (
        <form action={saveAttendance}>
          <input type="hidden" name="class_id" value={classId} />
          <input type="hidden" name="date" value={date} />
          <Card className="p-0">
            <ul className="divide-y divide-slate-100">
              {students.map((s) => {
                const sel = current.get(s.id) ?? "present";
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="font-medium text-slate-900">{s.full_name}</span>
                    <div className="flex gap-3">
                      {OPTIONS.map((o) => (
                        <label key={o.value} className="flex items-center gap-1 text-sm">
                          <input
                            type="radio"
                            name={`status_${s.id}`}
                            value={o.value}
                            defaultChecked={sel === o.value}
                          />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <div className="mt-4">
            <SubmitButton>Save attendance</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
