import { redirect } from "next/navigation";

export default function Home() {
  // With auth in place (Phase 2), the root route redirects to /dashboard or /login.
  redirect("/login");
}
