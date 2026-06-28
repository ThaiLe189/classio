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
      <PageHeader title="Grades" description="Select a student, enter grades by subject/assignment." />

      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-4">
          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-900">Student</span>
            <Select name="student" defaultValue={studentId} className="w-64">
              <option value="">— Select student —</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </Select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 focus:ring-4 focus:ring-brand-300"
          >
            View
          </button>
        </form>
      </Card>

      {!studentId ? (
        <Empty>Select a student to enter and view grades.</Empty>
      ) : (
        <>
          <Card className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Add grade</h2>
            <form action={addGrade} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="hidden" name="student_id" value={studentId} />
              <Field label="Subject">
                <Input name="subject" required placeholder="e.g. Math" />
              </Field>
              <Field label="Assignment">
                <Input name="assignment" placeholder="e.g. 15-min quiz" />
              </Field>
              <Field label="Score">
                <Input name="score" type="number" step="0.01" min="0" required />
              </Field>
              <Field label="Max score">
                <Input name="max_score" type="number" step="0.01" min="1" defaultValue={10} />
              </Field>
              <Field label="Date">
                <Input name="date" type="date" defaultValue={todayISO()} required />
              </Field>
              <div className="sm:col-span-2">
                <SubmitButton>Add grade</SubmitButton>
              </div>
            </form>
          </Card>

          {grades.length === 0 ? (
            <Empty>This student has no grades yet.</Empty>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Assignment</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((g) => (
                    <tr key={g.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-900">{g.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{g.assignment ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-900">
                        {g.score} / {g.max_score}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(g.date)}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteGrade}>
                          <input type="hidden" name="id" value={g.id} />
                          <SubmitButton variant="danger" className="px-2.5 py-1.5 text-xs">
                            Delete
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
