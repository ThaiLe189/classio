import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import WeekScheduleView, { scheduleColor, type CalSession } from "@/components/WeekScheduleView";
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

  // Assign a stable color per class, build calendar sessions + legend.
  const colorByClass = new Map<string, number>();
  (classes ?? []).forEach((c, i) => colorByClass.set(c.id, i));

  const calSessions: CalSession[] = (schedules ?? []).map((s) => ({
    id: s.id,
    day: s.day_of_week,
    start: s.start_time,
    end: s.end_time,
    title: classMap.get(s.class_id) ?? "—",
    room: s.room,
    colorIndex: colorByClass.get(s.class_id) ?? 0,
  }));

  const scheduledIds = new Set((schedules ?? []).map((s) => s.class_id));
  const legend = (classes ?? [])
    .filter((c) => scheduledIds.has(c.id))
    .map((c) => ({ name: c.name, colorIndex: colorByClass.get(c.id) ?? 0 }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Schedule" description="Weekly calendar of all scheduled classes." />

      {calSessions.length === 0 ? (
        <Empty>No scheduled sessions yet. Create a class with a weekly schedule to see it here.</Empty>
      ) : (
        <div className="mb-8">
          {legend.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2">
              {legend.map((l) => (
                <span key={l.name} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <span className={`h-3 w-3 rounded-sm border-l-4 ${scheduleColor(l.colorIndex)}`} />
                  {l.name}
                </span>
              ))}
            </div>
          )}
          <WeekScheduleView sessions={calSessions} />
        </div>
      )}

      <h2 className="mb-3 mt-2 text-base font-semibold text-gray-900">Manage sessions</h2>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Add session</h2>
        {!classes || classes.length === 0 ? (
          <p className="text-sm text-slate-500">Create a class before adding a session.</p>
        ) : (
          <form action={addSchedule} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Class">
              <Select name="class_id" required defaultValue="">
                <option value="" disabled>
                  — Select class —
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Day">
              <Select name="day_of_week" defaultValue="1">
                {WEEKDAYS.map((label, idx) => (
                  <option key={idx} value={idx}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Start">
              <Input name="start_time" type="time" required />
            </Field>
            <Field label="End">
              <Input name="end_time" type="time" required />
            </Field>
            <Field label="Room (optional)">
              <Input name="room" />
            </Field>
            <div className="sm:col-span-2">
              <SubmitButton>Add session</SubmitButton>
            </div>
          </form>
        )}
      </Card>

      {!schedules || schedules.length === 0 ? (
        <Empty>No sessions yet.</Empty>
      ) : (
        <div className="space-y-4">
          {WEEKDAYS.map((label, idx) => {
            const list = byDay.get(idx);
            if (!list || list.length === 0) return null;
            return (
              <div key={idx}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">{label}</h3>
                <Card className="p-0">
                  <ul className="divide-y divide-slate-100">
                    {list.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <span className="font-medium tabular-nums text-slate-900">
                            {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                          </span>
                          <span className="ml-3 text-slate-700">
                            {classMap.get(s.class_id) ?? "—"}
                          </span>
                          {s.room && (
                            <span className="ml-2 text-sm text-slate-500">· {s.room}</span>
                          )}
                        </div>
                        <form action={deleteSchedule}>
                          <input type="hidden" name="id" value={s.id} />
                          <SubmitButton variant="danger" className="px-2.5 py-1.5 text-xs">
                            Delete
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
