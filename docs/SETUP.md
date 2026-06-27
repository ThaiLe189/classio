# Classio — Setup Guide

## 1. Create a Supabase project
1. Go to https://supabase.com → New project.
2. Project Settings → API: copy the **Project URL** and the **anon public key**.
3. Put them in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

## 2. Apply the database schema

### Option A — Supabase CLI (recommended)
```bash
# Install the CLI if needed (see https://supabase.com/docs/guides/cli)
npm install -g supabase

supabase init                       # creates config.toml (keeps existing migrations)
supabase link --project-ref <REF>   # REF is from the URL: https://<REF>.supabase.co
supabase db push                    # applies supabase/migrations/20240101000000_init.sql

# (optional) regenerate types from the real schema:
supabase gen types typescript --linked > types/database.ts
```

### Option B — run manually
Open Supabase Dashboard → SQL Editor → paste the full contents of
`supabase/migrations/20240101000000_init.sql` → Run.

## 3. Verify RLS (IMPORTANT)
In the SQL Editor run:
```sql
select tablename, rowsecurity
from pg_tables where schemaname = 'public';
```
All 7 tables must have `rowsecurity = true`.

## 4. Run the app
```bash
npm run dev
```
