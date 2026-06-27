import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Select, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { updateStudent } from "../../actions";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: s }, { data: classes }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, phone, parent_name, parent_phone, note, class_id")
      .eq("id", id)
      .single(),
    supabase.from("classes").select("id, name").order("name"),
  ]);
  if (!s) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Sửa học sinh" />
      <Card>
        <form action={updateStudent} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={s.id} />
          <Field label="Họ tên">
            <Input name="full_name" defaultValue={s.full_name} required />
          </Field>
          <Field label="Lớp">
            <Select name="class_id" defaultValue={s.class_id ?? ""}>
              <option value="">— Chưa xếp lớp —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="SĐT học sinh">
            <Input name="phone" defaultValue={s.phone ?? ""} />
          </Field>
          <Field label="Tên phụ huynh">
            <Input name="parent_name" defaultValue={s.parent_name ?? ""} />
          </Field>
          <Field label="SĐT phụ huynh">
            <Input name="parent_phone" defaultValue={s.parent_phone ?? ""} />
          </Field>
          <Field label="Ghi chú">
            <Input name="note" defaultValue={s.note ?? ""} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <SubmitButton>Lưu</SubmitButton>
            <Link
              href="/students"
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Hủy
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
