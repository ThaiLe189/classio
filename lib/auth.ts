import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Get the signed-in user; redirect to /login if none. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
