# Run Classio with Docker

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
> **inlined into the bundle at build time** by Next.js, so they must be passed
> as *build args* (not just runtime env). Changing the keys requires rebuilding
> the image.

## Option 1 — docker compose (recommended)
Put the two variables in a `.env` file at the project root (compose reads it):
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```
Then:
```bash
docker compose up --build      # build + run
# open http://localhost:3000
docker compose down            # stop
```

## Option 2 — plain docker
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
  -t classio .

docker run --rm -p 3000:3000 classio
```

## Notes
- The image uses Next.js **standalone output** (`next.config.ts` has
  `output: "standalone"`), so it is small: only `server.js` + minimal node_modules.
- Multi-stage: `deps` → `builder` → `runner`. The container runs as a non-root
  user (`nextjs`).
- On Windows: start **Docker Desktop** before running the commands above.
- The database is still Supabase in the cloud — the container only runs the web
  app. You do not need Postgres in Docker unless you want to self-host Supabase.
