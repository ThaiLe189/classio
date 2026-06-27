"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/classes", label: "Lớp học" },
  { href: "/students", label: "Học sinh" },
  { href: "/attendance", label: "Điểm danh" },
  { href: "/grades", label: "Điểm số" },
  { href: "/schedule", label: "Thời khóa biểu" },
  { href: "/tuition", label: "Học phí" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <span className="text-xl font-bold text-indigo-600">Classio</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-3">
        <p className="truncate px-2 pb-2 text-xs text-gray-500">{email}</p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
