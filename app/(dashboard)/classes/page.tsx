import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, Field, Input, Textarea, PageHeader, Empty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { createClass, deleteClass } from "./actions";

export default async function ClassesPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Lớp học" description="Tạo và quản lý các lớp của bạn." />

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Thêm lớp mới</h2>
        <form action={createClass} className="space-y-3">
          <Field label="Tên lớp">
            <Input name="name" required placeholder="VD: Toán 9A" />
          </Field>
          <Field label="Mô tả (tùy chọn)">
            <Textarea name="description" rows={2} />
          </Field>
          <SubmitButton>Thêm lớp</SubmitButton>
        </form>
      </Card>

      {!classes || classes.length === 0 ? (
        <Empty>Chưa có lớp nào. Thêm lớp đầu tiên ở trên.</Empty>
      ) : (
        <div className="space-y-2">
          {classes.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                {c.description && (
                  <p className="text-sm text-gray-500">{c.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/classes/${c.id}/edit`}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Sửa
                </Link>
                <form action={deleteClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <SubmitButton variant="danger">Xóa</SubmitButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
