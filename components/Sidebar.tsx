"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type IconKey =
  | "dashboard"
  | "classes"
  | "students"
  | "attendance"
  | "grades"
  | "schedule"
  | "tuition";

const NAV: { href: string; label: string; icon: IconKey }[] = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/classes", label: "Classes", icon: "classes" },
  { href: "/students", label: "Students", icon: "students" },
  { href: "/attendance", label: "Attendance", icon: "attendance" },
  { href: "/grades", label: "Grades", icon: "grades" },
  { href: "/schedule", label: "Schedule", icon: "schedule" },
  { href: "/tuition", label: "Tuition", icon: "tuition" },
];

function Icon({ name, className = "" }: { name: IconKey; className?: string }) {
  const paths: Record<IconKey, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
    classes: (
      <>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M7 9v5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
        <path d="M17 8.5a2.6 2.6 0 0 1 0 5" />
        <path d="M18 19.5a4.6 4.6 0 0 0-2.6-4.1" />
      </>
    ),
    attendance: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <path d="M8.5 12.5l2.2 2.2 4.3-4.6" />
      </>
    ),
    grades: (
      <>
        <path d="M5 21V10" />
        <path d="M12 21V4" />
        <path d="M19 21v-7" />
      </>
    ),
    schedule: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2.5" />
        <path d="M4 9h16M9 3v4M15 3v4" />
      </>
    ),
    tuition: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M7 9.2V14c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V9.2" />
        </svg>
      </span>
      <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">
        Classio
      </span>
    </Link>
  );
}

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <ul className="space-y-1 font-medium">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center rounded-lg p-2 text-sm ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon
                name={item.icon}
                className={
                  active
                    ? "text-brand-700"
                    : "text-gray-500 transition group-hover:text-gray-900"
                }
              />
              <span className="ms-3">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const initial = (email.trim()[0] ?? "U").toUpperCase();
  const footer = (
    <div className="mt-auto border-t border-gray-200 pt-3">
      <div className="flex items-center gap-3 rounded-lg p-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initial}
        </span>
        <p className="min-w-0 flex-1 truncate text-xs text-gray-500">{email}</p>
      </div>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="group mt-1 flex w-full items-center rounded-lg p-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          <svg className="text-gray-500 group-hover:text-gray-900" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span className="ms-3">Sign out</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Top bar (mobile only) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Slide-out drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-gray-50 px-3 py-4">
            <div className="mb-4 flex items-center justify-between px-1">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100"
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

      {/* Fixed sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-gray-50 md:block">
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-5 px-1">
            <Logo />
          </div>
          {navLinks}
          {footer}
        </div>
      </aside>
    </>
  );
}
