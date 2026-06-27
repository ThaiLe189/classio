import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classio — Quản lý lớp học",
  description: "Quản lý lớp, học sinh, điểm danh, điểm số, học phí",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
