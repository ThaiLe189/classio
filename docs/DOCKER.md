# Chạy Classio bằng Docker

> ⚠️ Biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` được
> Next.js **nhúng vào bundle lúc build**, nên phải truyền dưới dạng *build args*
> (không phải chỉ runtime env). Đổi key => phải build lại ảnh.

## Cách 1 — docker compose (khuyến nghị)
Đặt 2 biến trong file `.env` ở thư mục gốc (compose tự đọc):
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```
Rồi:
```bash
docker compose up --build      # build + chạy
# mở http://localhost:3000
docker compose down            # dừng
```

## Cách 2 — docker thuần
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>" \
  -t classio .

docker run --rm -p 3000:3000 classio
```

## Ghi chú
- Ảnh dùng Next.js **standalone output** (`next.config.ts` đã bật `output: "standalone"`)
  nên rất nhỏ: chỉ chứa `server.js` + node_modules tối thiểu.
- Multi-stage: `deps` → `builder` → `runner`. Container chạy bằng user không phải root (`nextjs`).
- Trên Windows: phải mở **Docker Desktop** trước khi chạy lệnh trên.
- Database vẫn là Supabase trên cloud — container chỉ chạy phần web. Không cần
  Postgres trong Docker trừ khi bạn muốn self-host Supabase riêng.
