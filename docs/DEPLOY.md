# Deploy Classio to Vercel

## 1. Push the code to GitHub
```bash
git add .
git commit -m "Classio MVP"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 2. Import into Vercel
1. Go to https://vercel.com → New Project → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Add **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## 3. Configure Supabase Auth for the Vercel domain
In the Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://<your-app>.vercel.app`
- **Redirect URLs**: add `https://<your-app>.vercel.app/**`

## 4. (Optional) Disable email confirmation while testing
Authentication → Providers → Email → turn off "Confirm email"
so sign-up logs in immediately. Re-enable it for production.

## 5. Post-deploy check
- Sign up an account → create a class and a student.
- Sign up a second account (incognito window) → confirm it does **not** see
  the first account's data (RLS is working).
