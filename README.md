# Classio — Classroom Management App

A web app for teachers/tutoring centers to manage their own classes: classes,
students, attendance, grades, timetable, tuition, and an overview dashboard.

## Tech stack
- **Next.js 15** (App Router, TypeScript) — frontend + backend (Server Actions)
- **Supabase** — Postgres + Auth (email/password), secured with Row Level Security
- **Tailwind CSS v4** — UI
- **Vercel** — hosting

## Features
| Module | Route |
|---|---|
| Sign in / Sign up | `/login`, `/signup` |
| Overview | `/dashboard` |
| Classes (CRUD) | `/classes` |
| Students (CRUD) | `/students` |
| Attendance | `/attendance` |
| Grades | `/grades` |
| Timetable | `/schedule` |
| Tuition | `/tuition` |

All data is isolated per account via RLS (`owner_id = auth.uid()`).

## Quick start
1. Install dependencies: `npm install`
2. Create a Supabase project and put the keys in `.env.local` (see `.env.example`)
3. Apply the schema: see [docs/SETUP.md](docs/SETUP.md)
4. Run: `npm run dev` → http://localhost:3000

## Scripts
- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript type checking

## Project structure
```
app/
  (auth)/        # login, signup, server actions
  (dashboard)/   # authenticated pages (layout with sidebar + auth guard)
  auth/signout/  # sign-out route
components/      # shared UI (ui.tsx, Sidebar, SubmitButton)
lib/
  supabase/      # Supabase client / server / middleware
  auth.ts        # requireUser()
  utils.ts       # currency/date formatting, constants
types/database.ts# types matching the schema
supabase/migrations/ # SQL schema + RLS
```

## Deploy to Vercel
See [docs/DEPLOY.md](docs/DEPLOY.md).

## Run with Docker
See [docs/DOCKER.md](docs/DOCKER.md).
