import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Select, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { createStudent, deleteStudent } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  await requireUser();
  const { class: classFilter } = await searchParams;
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("students")
    .select("id, full_name, phone, parent_name, parent_phone, class_id")
    .order("full_name");
  if (classFilter) query = query.eq("class_id", classFilter);
  const { data: students } = await query;

  const classMap = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Học sinh" description="Thông tin học sinh, phụ huynh và lớp." />

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Thêm học sinh</h2>
        <form action={createStudent} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Họ tên">
            <Input name="full_name" required />
          </Field>
          <Field label="Lớp">
            <Select name="class_id" defaultValue="">
              <option value="">— Chưa xếp lớp —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="SĐT học sinh">
            <Input name="phone" />
          </Field>
          <Field label="Tên phụ huynh">
            <Input name="parent_name" />
          </Field>
          <Field label="SĐT phụ huynh">
            <Input name="parent_phone" />
          </Field>
          <Field label="Ghi chú">
            <Input name="note" />
          </Field>
          <div className="sm:col-span-2">
            <SubmitButton>Thêm học sinh</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Lọc theo lớp:</span>
        <Link
          href="/students"
          className={`rounded-full px-3 py-1 text-sm ${!classFilter ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          Tất cả
        </Link>
        {(classes ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/students?class=${c.id}`}
            className={`rounded-full px-3 py-1 text-sm ${classFilter === c.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {!students || students.length === 0 ? (
        <Empty>Chưa có học sinh nào.</Empty>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Lớp</th>
                <th className="px-4 py-3 font-medium">Phụ huynh</th>
                <th className="px-4 py-3 font-medium">SĐT PH</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.class_id ? classMap.get(s.class_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.parent_name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parent_phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/students/${s.id}/edit`}
                        className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Sửa
                      </Link>
                      <form action={deleteStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <SubmitButton variant="danger" className="px-2.5 py-1.5 text-xs">
                          Xóa
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
