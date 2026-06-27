# Classio — Ứng dụng quản lý lớp học

Web app cho giáo viên/trung tâm tự quản lý lớp học: lớp, học sinh, điểm danh,
điểm số, thời khóa biểu, học phí và trang tổng quan.

## Tech stack
- **Next.js 15** (App Router, TypeScript) — frontend + backend (Server Actions)
- **Supabase** — Postgres + Auth (email/mật khẩu), bảo mật bằng Row Level Security
- **Tailwind CSS v4** — giao diện
- **Vercel** — hosting

## Tính năng
| Module | Đường dẫn |
|---|---|
| Đăng nhập / Đăng ký | `/login`, `/signup` |
| Tổng quan | `/dashboard` |
| Lớp học (CRUD) | `/classes` |
| Học sinh (CRUD) | `/students` |
| Điểm danh | `/attendance` |
| Điểm số | `/grades` |
| Thời khóa biểu | `/schedule` |
| Học phí | `/tuition` |

Mọi dữ liệu được cô lập theo tài khoản qua RLS (`owner_id = auth.uid()`).

## Bắt đầu nhanh
1. Cài dependencies: `npm install`
2. Tạo project Supabase, điền key vào `.env.local` (xem `.env.example`)
3. Áp schema: xem [docs/SETUP.md](docs/SETUP.md)
4. Chạy: `npm run dev` → http://localhost:3000

## Lệnh
- `npm run dev` — chạy môi trường phát triển
- `npm run build` — build production
- `npm run typecheck` — kiểm tra kiểu TypeScript

## Cấu trúc thư mục
```
app/
  (auth)/        # login, signup, server actions
  (dashboard)/   # các trang sau đăng nhập (layout có sidebar + auth guard)
  auth/signout/  # route đăng xuất
components/      # UI dùng chung (ui.tsx, Sidebar, SubmitButton)
lib/
  supabase/      # client / server / middleware Supabase
  auth.ts        # requireUser()
  utils.ts       # định dạng tiền/ngày, hằng số
types/database.ts# kiểu khớp schema
supabase/migrations/ # SQL schema + RLS
```

## Deploy lên Vercel
Xem [docs/DEPLOY.md](docs/DEPLOY.md).

## Chạy bằng Docker
Xem [docs/DOCKER.md](docs/DOCKER.md).
