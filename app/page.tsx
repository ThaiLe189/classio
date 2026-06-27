import { redirect } from "next/navigation";

export default function Home() {
  // Sau khi có auth (Phase 2), trang gốc sẽ điều hướng tới /dashboard hoặc /login.
  redirect("/login");
}
