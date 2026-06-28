import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Empty } from "@/components/ui";
import { WEEKDAYS, currentPeriod, formatCurrency } from "@/lib/utils";

type StatTone = "brand" | "sky" | "amber" | "danger";

const STAT_ICONS: Record<StatTone, React.ReactNode> = {
  brand: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M17 8.5a2.6 2.6 0 0 1 0 5" />
    </>
  ),
  sky: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M7 9v5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9" />
    </>
  ),
  amber: (
    <>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  danger: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18" />
    </>
  ),
};

function StatCard({
  label,
  value,
  href,
  tone = "brand",
}: {
  label: string;
  value: string;
  href: string;
  tone?: StatTone;
}) {
  const tones: Record<StatTone, { ring: string; icon: string; value: string }> = {
    brand: { ring: "bg-brand-50", icon: "text-brand-600", value: "text-slate-900" },
    sky: { ring: "bg-sky-50", icon: "text-sky-600", value: "text-slate-900" },
    amber: { ring: "bg-amber-50", icon: "text-amber-600", value: "text-slate-900" },
    danger: { ring: "bg-red-50", icon: "text-red-600", value: "text-red-600" },
  };
  const t = tones[tone];
  return (
    <Link href={href} className="group block">
      <Card className="transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <span className={`grid h-10 w-10 place-items-center rounded-lg ${t.ring}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={t.icon} aria-hidden="true">
              {STAT_ICONS[tone]}
            </svg>
          </span>
        </div>
        <p className={`mt-3 text-3xl font-extrabold tracking-tight tabular-nums ${t.value}`}>
          {value}
        </p>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createClient();
  const period = currentPeriod();
  const today = new Date().getDay(); // 0=CN..6=T7

  const [
    { count: studentCount },
    { count: classCount },
    { data: unpaid },
    { data: todaySessions },
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase
      .from("tuitions")
      .select("amount")
      .eq("period", period)
      .eq("is_paid", false),
    supabase
      .from("schedules")
      .select("id, class_id, start_time, end_time, room")
      .eq("day_of_week", today)
      .order("start_time"),
  ]);

  const unpaidTotal = (unpaid ?? []).reduce((s, t) => s + Number(t.amount), 0);
  const unpaidCount = (unpaid ?? []).length;

  // Class names for today's sessions
  const classIds = [...new Set((todaySessions ?? []).map((s) => s.class_id))];
  const classMap = new Map<string, string>();
  if (classIds.length > 0) {
    const { data: cls } = await supabase
      .from("classes")
      .select("id, name")
      .in("id", classIds);
    for (const c of cls ?? []) classMap.set(c.id, c.name);
  }

  return (
    <div>
      <PageHeader title="Overview" description={`${WEEKDAYS[today]} · ${period}`} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={String(studentCount ?? 0)} href="/students" tone="brand" />
        <StatCard label="Classes" value={String(classCount ?? 0)} href="/classes" tone="sky" />
        <StatCard
          label="Unpaid students"
          value={String(unpaidCount)}
          href="/tuition"
          tone="amber"
        />
        <StatCard
          label="Outstanding tuition"
          value={formatCurrency(unpaidTotal)}
          href="/tuition"
          tone="danger"
        />
      </div>

      <h2 className="mb-3 text-base font-semibold text-slate-900">
        Today&apos;s sessions ({WEEKDAYS[today]})
      </h2>
      {!todaySessions || todaySessions.length === 0 ? (
        <Empty>No sessions today.</Empty>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-slate-100">
            {todaySessions.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/70">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                </span>
                <span className="ml-auto text-right text-slate-700">
                  {classMap.get(s.class_id) ?? "—"}
                  {s.room && <span className="ml-2 text-sm text-slate-400">· {s.room}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
