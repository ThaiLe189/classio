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
      <PageHeader title="Edit student" />
      <Card>
        <form action={updateStudent} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={s.id} />
          <Field label="Full name">
            <Input name="full_name" defaultValue={s.full_name} required />
          </Field>
          <Field label="Class">
            <Select name="class_id" defaultValue={s.class_id ?? ""}>
              <option value="">— No class —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Student phone">
            <Input name="phone" defaultValue={s.phone ?? ""} />
          </Field>
          <Field label="Parent name">
            <Input name="parent_name" defaultValue={s.parent_name ?? ""} />
          </Field>
          <Field label="Parent phone">
            <Input name="parent_phone" defaultValue={s.parent_phone ?? ""} />
          </Field>
          <Field label="Note">
            <Input name="note" defaultValue={s.note ?? ""} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <SubmitButton>Save</SubmitButton>
            <Link
              href="/students"
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
