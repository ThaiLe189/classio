import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Textarea, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { updateClass } from "../../actions";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, description")
    .eq("id", id)
    .single();
  if (!cls) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Sửa lớp" />
      <Card>
        <form action={updateClass} className="space-y-3">
          <input type="hidden" name="id" value={cls.id} />
          <Field label="Tên lớp">
            <Input name="name" defaultValue={cls.name} required />
          </Field>
          <Field label="Mô tả">
            <Textarea name="description" rows={2} defaultValue={cls.description ?? ""} />
          </Field>
          <div className="flex gap-2">
            <SubmitButton>Lưu</SubmitButton>
            <Link
              href="/classes"
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
