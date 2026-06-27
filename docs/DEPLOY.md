# Deploy Classio lên Vercel

## 1. Đẩy code lên GitHub
```bash
git add .
git commit -m "Classio MVP"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 2. Import vào Vercel
1. Vào https://vercel.com → New Project → import repo GitHub.
2. Framework preset: **Next.js** (tự nhận diện).
3. Thêm **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## 3. Cấu hình Supabase Auth cho domain Vercel
Trong Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://<your-app>.vercel.app`
- **Redirect URLs**: thêm `https://<your-app>.vercel.app/**`

## 4. (Tùy chọn) Tắt xác nhận email khi thử nghiệm
Authentication → Providers → Email → tắt "Confirm email"
để đăng ký xong vào thẳng app. Bật lại khi chạy thật.

## 5. Kiểm tra sau deploy
- Đăng ký 1 tài khoản → tạo lớp, học sinh.
- Đăng ký tài khoản thứ 2 (trình duyệt ẩn danh) → xác nhận **không** thấy
  dữ liệu của tài khoản 1 (RLS hoạt động).
