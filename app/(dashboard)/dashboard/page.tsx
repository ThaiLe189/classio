import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Empty } from "@/components/ui";
import { WEEKDAYS, currentPeriod, formatCurrency } from "@/lib/utils";

function StatCard({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  href: string;
  tone?: "default" | "danger";
}) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-md">
        <p className="text-sm text-gray-500">{label}</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            tone === "danger" ? "text-red-600" : "text-gray-900"
          }`}
        >
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

  // Tên lớp cho các buổi học hôm nay
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
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Tổng quan" description={`Tháng ${period} · ${WEEKDAYS[today]}`} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng học sinh" value={String(studentCount ?? 0)} href="/students" />
        <StatCard label="Số lớp" value={String(classCount ?? 0)} href="/classes" />
        <StatCard
          label="HS chưa đóng học phí"
          value={String(unpaidCount)}
          href="/tuition"
          tone="danger"
        />
        <StatCard
          label="Học phí còn thiếu"
          value={formatCurrency(unpaidTotal)}
          href="/tuition"
          tone="danger"
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Buổi học hôm nay ({WEEKDAYS[today]})
      </h2>
      {!todaySessions || todaySessions.length === 0 ? (
        <Empty>Hôm nay không có buổi học nào.</Empty>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-gray-100">
            {todaySessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-gray-900">
                  {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                </span>
                <span className="text-gray-700">
                  {classMap.get(s.class_id) ?? "—"}
                  {s.room && <span className="ml-2 text-sm text-gray-500">· {s.room}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
