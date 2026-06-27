import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-screen md:flex">
      <Sidebar email={user.email ?? ""} />
      <main className="flex-1 bg-gray-50 p-4 md:p-6">{children}</main>
    </div>
  );
}
