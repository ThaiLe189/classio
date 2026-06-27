"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
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
  );

  const footer = (
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
  );

  return (
    <>
      {/* Thanh trên cùng (chỉ mobile) */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <span className="text-xl font-bold text-indigo-600">Classio</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Drawer trượt (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xl font-bold text-indigo-600">Classio</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>
            {navLinks}
            {footer}
          </aside>
        </div>
      )}

      {/* Sidebar cố định (desktop) */}
      <aside className="hidden w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="px-5 py-5">
          <span className="text-xl font-bold text-indigo-600">Classio</span>
        </div>
        {navLinks}
        {footer}
      </aside>
    </>
  );
}
