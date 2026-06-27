import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { todayISO, formatDate } from "@/lib/utils";
import { addGrade, deleteGrade } from "./actions";

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const studentId = sp.student || "";
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .order("full_name");

  let grades: {
    id: string;
    subject: string;
    assignment: string | null;
    score: number;
    max_score: number;
    date: string;
  }[] = [];

  if (studentId) {
    const { data } = await supabase
      .from("grades")
      .select("id, subject, assignment, score, max_score, date")
      .eq("student_id", studentId)
      .order("date", { ascending: false });
    grades = data ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Điểm số" description="Chọn học sinh, nhập điểm theo bài/môn." />

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Học sinh</span>
            <Select name="student" defaultValue={studentId} className="w-64">
              <option value="">— Chọn học sinh —</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </Select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Xem
          </button>
        </form>
      </Card>

      {!studentId ? (
        <Empty>Chọn một học sinh để nhập và xem điểm.</Empty>
      ) : (
        <>
          <Card className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Thêm điểm</h2>
            <form action={addGrade} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="hidden" name="student_id" value={studentId} />
              <Field label="Môn">
                <Input name="subject" required placeholder="VD: Toán" />
              </Field>
              <Field label="Bài / Cột điểm">
                <Input name="assignment" placeholder="VD: Kiểm tra 15 phút" />
              </Field>
              <Field label="Điểm">
                <Input name="score" type="number" step="0.01" min="0" required />
              </Field>
              <Field label="Điểm tối đa">
                <Input name="max_score" type="number" step="0.01" min="1" defaultValue={10} />
              </Field>
              <Field label="Ngày">
                <Input name="date" type="date" defaultValue={todayISO()} required />
              </Field>
              <div className="sm:col-span-2">
                <SubmitButton>Thêm điểm</SubmitButton>
              </div>
            </form>
          </Card>

          {grades.length === 0 ? (
            <Empty>Học sinh này chưa có điểm.</Empty>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Môn</th>
                    <th className="px-4 py-3 font-medium">Bài</th>
                    <th className="px-4 py-3 font-medium">Điểm</th>
                    <th className="px-4 py-3 font-medium">Ngày</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{g.subject}</td>
                      <td className="px-4 py-3 text-gray-600">{g.assignment ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {g.score} / {g.max_score}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(g.date)}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteGrade}>
                          <input type="hidden" name="id" value={g.id} />
                          <SubmitButton variant="danger" className="px-2.5 py-1.5 text-xs">
                            Xóa
                          </SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
