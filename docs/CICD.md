# CI/CD — Auto-deploy to Vercel on push to `main`

The workflow at `.github/workflows/deploy.yml` runs on every push/PR to `main`:
1. **ci** job: `npm ci` → `npm run typecheck` → `npm run build` (validation).
2. **deploy** job (only on push to `main`, after ci passes): builds and deploys
   to Vercel **production** using the Vercel CLI.

## Required GitHub secrets
Add these in the repo: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | run `vercel link` locally, then read `.vercel/project.json` (`orgId`) |
| `VERCEL_PROJECT_ID` | same file (`projectId`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (used by the ci build) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |

### Getting ORG_ID / PROJECT_ID
```bash
npm i -g vercel
vercel login
vercel link        # links this folder to a Vercel project; creates .vercel/project.json
cat .vercel/project.json   # copy "orgId" and "projectId"
```
> `.vercel/` is already git-ignored — do not commit it.

The actual app env vars (`NEXT_PUBLIC_*`) used for the production deploy come from
the **Vercel project's** Environment Variables (fetched by `vercel pull`), so set
them in the Vercel dashboard too.

## Important: avoid double deploys
If you use this Action, **disable Vercel's native Git auto-deploy** to prevent two
deployments per push:
Vercel → Project → Settings → Git → turn off "Production Branch" auto-deploy
(or disconnect the Git integration). The Action becomes the single source of deploys.

> Simpler alternative: skip this Action entirely and just connect the repo in the
> Vercel dashboard — Vercel auto-deploys `main` on push with zero config. Use this
> Action only when you want CI gating (typecheck/build) before every deploy.

## Auto-migration (Supabase)
The `migrate` job runs `supabase db push` on every push to `main`, applying any
new files in `supabase/migrations/` to the database **before** the app deploys.
Supabase CLI tracks which migrations were already applied, so re-runs are safe.

Add these secrets (in addition to the Vercel ones):

| Secret | Where to get it |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens → Generate new token |
| `SUPABASE_PROJECT_REF` | the `<ref>` in your URL `https://<ref>.supabase.co` |
| `SUPABASE_DB_PASSWORD` | the database password (Supabase → Project Settings → Database → reset if forgotten) |

> Migration files must be named `<timestamp>_name.sql` (e.g. `20240101000000_init.sql`).
> Do **not** also paste the SQL manually if you use auto-migration — let the pipeline
> own the schema to avoid double-apply conflicts (CREATE POLICY is not idempotent).
