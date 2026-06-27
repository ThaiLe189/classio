import { redirect } from "next/navigation";

export default function SignupPage() {
  // Đăng ký bằng mật khẩu đã bỏ — OTP tự tạo tài khoản ở /login.
  redirect("/login");
}
