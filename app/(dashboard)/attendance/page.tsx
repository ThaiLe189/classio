import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { todayISO } from "@/lib/utils";
import { saveAttendance } from "./actions";
import type { AttendanceStatus } from "@/types/database";

const OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Có mặt" },
  { value: "absent", label: "Vắng" },
  { value: "late", label: "Trễ" },
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
      <PageHeader title="Điểm danh" description="Chọn lớp và ngày, đánh dấu trạng thái rồi lưu." />

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Lớp</span>
            <Select name="class" defaultValue={classId} className="w-48">
              <option value="">— Chọn lớp —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Ngày</span>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Tải danh sách
          </button>
        </form>
      </Card>

      {!classId ? (
        <Empty>Chọn một lớp để bắt đầu điểm danh.</Empty>
      ) : students.length === 0 ? (
        <Empty>Lớp này chưa có học sinh.</Empty>
      ) : (
        <form action={saveAttendance}>
          <input type="hidden" name="class_id" value={classId} />
          <input type="hidden" name="date" value={date} />
          <Card className="p-0">
            <ul className="divide-y divide-gray-100">
              {students.map((s) => {
                const sel = current.get(s.id) ?? "present";
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="font-medium text-gray-900">{s.full_name}</span>
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
            <SubmitButton>Lưu điểm danh</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
