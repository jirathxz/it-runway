"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/social-button";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
      });

      if (res.error) {
        setError(res.error.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
      } else {
        // Redirect to email verification instruction page
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="NEW RUNNER REGISTRATION"
      title="สมัครสมาชิกใหม่"
      subtitle="สร้างบัญชีเพื่อสมัครงานวิ่ง ติดตามสถิติ และรับสิทธิพิเศษ"
    >
      {/* Alert Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
            ชื่อ - นามสกุล / Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="สมชาย ใจสู้"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
            ที่อยู่อีเมล / Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="runner@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
            รหัสผ่าน / Password (ขั้นต่ำ 8 ตัวอักษร)
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
            ยืนยันรหัสผ่าน / Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[var(--accent)]/10 font-display uppercase tracking-wider"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> สมัครสมาชิก
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--surface)] px-3 text-[var(--ink-3)] font-mono">
            หรือ
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <GoogleSignInButton label="สมัครสมาชิกด้วย Google" />

      {/* Sign In Link */}
      <div className="mt-6 pt-4 border-t border-[var(--line)] text-center text-xs text-[var(--ink-2)]">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/auth/sign-in"
          className="text-[var(--accent)] font-bold hover:underline ml-1"
        >
          เข้าสู่ระบบที่นี่
        </Link>
      </div>
    </AuthCard>
  );
}
