# Classio — Hướng dẫn cài đặt

## 1. Tạo project Supabase
1. Vào https://supabase.com → New project.
2. Project Settings → API: copy **Project URL** và **anon public key**.
3. Điền vào `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

## 2. Áp schema database

### Cách A — Supabase CLI (khuyến nghị, đã chọn)
```bash
# Cài CLI nếu chưa có (xem https://supabase.com/docs/guides/cli)
npm install -g supabase

supabase init                       # tạo config.toml (giữ nguyên migrations sẵn có)
supabase link --project-ref <REF>   # REF lấy từ URL: https://<REF>.supabase.co
supabase db push                    # áp supabase/migrations/0001_init.sql lên DB

# (tùy chọn) regen lại types từ schema thật:
supabase gen types typescript --linked > types/database.ts
```

### Cách B — chạy tay
Mở Supabase Dashboard → SQL Editor → dán toàn bộ nội dung
`supabase/migrations/0001_init.sql` → Run.

## 3. Kiểm tra RLS (QUAN TRỌNG)
Trong SQL Editor chạy:
```sql
select tablename, rowsecurity
from pg_tables where schemaname = 'public';
```
Tất cả 7 bảng phải có `rowsecurity = true`.

## 4. Chạy app
```bash
npm run dev
```
