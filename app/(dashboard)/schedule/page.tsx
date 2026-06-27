import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { WEEKDAYS } from "@/lib/utils";
import { addSchedule, deleteSchedule } from "./actions";

export default async function SchedulePage() {
  await requireUser();
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");

  const { data: schedules } = await supabase
    .from("schedules")
    .select("id, class_id, day_of_week, start_time, end_time, room")
    .order("day_of_week")
    .order("start_time");

  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const byDay = new Map<number, NonNullable<typeof schedules>>();
  for (const s of schedules ?? []) {
    const list = byDay.get(s.day_of_week) ?? [];
    list.push(s);
    byDay.set(s.day_of_week, list);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Thời khóa biểu" description="Lịch các buổi học theo lớp." />

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Thêm buổi học</h2>
        {!classes || classes.length === 0 ? (
          <p className="text-sm text-gray-500">Hãy tạo lớp trước khi thêm buổi học.</p>
        ) : (
          <form action={addSchedule} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Lớp">
              <Select name="class_id" required defaultValue="">
                <option value="" disabled>
                  — Chọn lớp —
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Thứ">
              <Select name="day_of_week" defaultValue="1">
                {WEEKDAYS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bắt đầu">
              <Input name="start_time" type="time" required />
            </Field>
            <Field label="Kết thúc">
              <Input name="end_time" type="time" required />
            </Field>
            <Field label="Phòng (tùy chọn)">
              <Input name="room" />
            </Field>
            <div className="sm:col-span-2">
              <SubmitButton>Thêm buổi học</SubmitButton>
            </div>
          </form>
        )}
      </Card>

      {!schedules || schedules.length === 0 ? (
        <Empty>Chưa có buổi học nào.</Empty>
      ) : (
        <div className="space-y-4">
          {WEEKDAYS.map((label, idx) => {
            const list = byDay.get(idx);
            if (!list || list.length === 0) return null;
            return (
              <div key={idx}>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">{label}</h3>
                <Card className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {list.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                          </span>
                          <span className="ml-3 text-gray-700">
                            {classMap.get(s.class_id) ?? "—"}
                          </span>
                          {s.room && (
                            <span className="ml-2 text-sm text-gray-500">· {s.room}</span>
                          )}
                        </div>
                        <form action={deleteSchedule}>
                          <input type="hidden" name="id" value={s.id} />
                          <SubmitButton variant="danger" className="px-2.5 py-1.5 text-xs">
                            Xóa
                          </SubmitButton>
                        </form>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
