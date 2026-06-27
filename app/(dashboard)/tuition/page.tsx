import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { currentPeriod, formatCurrency } from "@/lib/utils";
import { upsertTuition } from "./actions";

export default async function TuitionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const period = sp.period && /^\d{4}-\d{2}$/.test(sp.period) ? sp.period : currentPeriod();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .order("full_name");

  const { data: tuitions } = await supabase
    .from("tuitions")
    .select("student_id, amount, is_paid")
    .eq("period", period);

  const map = new Map(
    (tuitions ?? []).map((t) => [t.student_id, { amount: t.amount, is_paid: t.is_paid }])
  );

  const unpaidTotal = (students ?? []).reduce((sum, s) => {
    const t = map.get(s.id);
    return t && !t.is_paid ? sum + Number(t.amount) : sum;
  }, 0);
  const unpaidCount = (students ?? []).filter((s) => {
    const t = map.get(s.id);
    return t && !t.is_paid;
  }).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Học phí" description="Theo dõi học phí theo tháng." />

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Tháng</span>
            <input
              type="month"
              name="period"
              defaultValue={period}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Xem
          </button>
          <div className="ml-auto text-right text-sm">
            <p className="text-gray-500">
              Chưa đóng: <span className="font-semibold text-red-600">{unpaidCount}</span>
            </p>
            <p className="text-gray-500">
              Còn thiếu:{" "}
              <span className="font-semibold text-red-600">{formatCurrency(unpaidTotal)}</span>
            </p>
          </div>
        </form>
      </Card>

      {!students || students.length === 0 ? (
        <Empty>Chưa có học sinh nào.</Empty>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Học sinh</th>
                <th className="px-4 py-3 font-medium">Số tiền</th>
                <th className="px-4 py-3 font-medium">Đã đóng</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => {
                const t = map.get(s.id);
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.full_name}</td>
                    <td colSpan={3} className="px-4 py-2">
                      <form action={upsertTuition} className="flex items-center gap-3">
                        <input type="hidden" name="student_id" value={s.id} />
                        <input type="hidden" name="period" value={period} />
                        <input
                          type="number"
                          name="amount"
                          min="0"
                          step="1000"
                          defaultValue={t?.amount ?? 0}
                          className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <label className="flex items-center gap-1 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            name="is_paid"
                            defaultChecked={t?.is_paid ?? false}
                          />
                          Đã đóng
                        </label>
                        <SubmitButton variant="ghost" className="px-2.5 py-1.5 text-xs">
                          Lưu
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
