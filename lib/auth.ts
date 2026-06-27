import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Lấy user đã đăng nhập; nếu chưa thì điều hướng về /login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
