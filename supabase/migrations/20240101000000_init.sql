-- Classio — schema khởi tạo
-- Mô hình: mỗi giáo viên (auth.users) chỉ thấy dữ liệu của chính mình qua RLS (owner_id = auth.uid()).

-- =========================================================
-- 1. profiles — hồ sơ giáo viên, 1-1 với auth.users
-- =========================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- 2. classes — lớp học
-- =========================================================
create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists classes_owner_idx on public.classes (owner_id);

-- =========================================================
-- 3. students — học sinh
-- =========================================================
create table if not exists public.students (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  class_id     uuid references public.classes (id) on delete set null,
  full_name    text not null,
  phone        text,
  parent_name  text,
  parent_phone text,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists students_owner_idx on public.students (owner_id);
create index if not exists students_class_idx on public.students (class_id);

-- =========================================================
-- 4. schedules — thời khóa biểu (buổi học theo lớp)
-- day_of_week: 0=Chủ nhật ... 6=Thứ 7
-- =========================================================
create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  class_id    uuid not null references public.classes (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  room        text,
  created_at  timestamptz not null default now()
);
create index if not exists schedules_owner_idx on public.schedules (owner_id);
create index if not exists schedules_class_idx on public.schedules (class_id);

-- =========================================================
-- 5. attendance — điểm danh
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type public.attendance_status as enum ('present', 'absent', 'late');
  end if;
end$$;

create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  class_id   uuid references public.classes (id) on delete set null,
  date       date not null,
  status     public.attendance_status not null default 'present',
  created_at timestamptz not null default now(),
  unique (student_id, date)
);
create index if not exists attendance_owner_idx on public.attendance (owner_id);
create index if not exists attendance_class_date_idx on public.attendance (class_id, date);

-- =========================================================
-- 6. grades — điểm số
-- =========================================================
create table if not exists public.grades (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  subject    text not null,
  assignment text,
  score      numeric(5, 2) not null,
  max_score  numeric(5, 2) not null default 10,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists grades_owner_idx on public.grades (owner_id);
create index if not exists grades_student_idx on public.grades (student_id);

-- =========================================================
-- 7. tuitions — học phí theo tháng (period = 'YYYY-MM')
-- =========================================================
create table if not exists public.tuitions (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  period     text not null,
  amount     numeric(12, 2) not null default 0,
  is_paid    boolean not null default false,
  paid_at    timestamptz,
  created_at timestamptz not null default now(),
  unique (student_id, period)
);
create index if not exists tuitions_owner_idx on public.tuitions (owner_id);
create index if not exists tuitions_owner_paid_idx on public.tuitions (owner_id, is_paid);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles   enable row level security;
alter table public.classes    enable row level security;
alter table public.students   enable row level security;
alter table public.schedules  enable row level security;
alter table public.attendance enable row level security;
alter table public.grades     enable row level security;
alter table public.tuitions   enable row level security;

-- profiles: chủ sở hữu là chính id
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Các bảng còn lại: owner_id = auth.uid() cho mọi thao tác
create policy "classes_all_own" on public.classes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "students_all_own" on public.students
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "schedules_all_own" on public.schedules
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "attendance_all_own" on public.attendance
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "grades_all_own" on public.grades
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "tuitions_all_own" on public.tuitions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =========================================================
-- Trigger: tự tạo profiles khi có user mới đăng ký
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
