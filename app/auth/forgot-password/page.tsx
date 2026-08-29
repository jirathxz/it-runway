"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { authClient } from "@/lib/auth-client";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await (authClient as any).requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (res.error) {
        setError(res.error.message || "ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="PASSWORD RECOVERY"
      title="ลืมรหัสผ่าน?"
      subtitle="กรอกอีเมลที่คุณใช้ลงทะเบียนเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่"
    >
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว</span>
            </div>
            <p className="text-xs text-emerald-400/80 leading-relaxed">
              เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่ <strong className="text-white">{email}</strong> กรุณาตรวจสอบกล่องจดหมายของคุณและทำตามขั้นตอนในอีเมล
            </p>
          </div>

          <Link
            href="/auth/sign-in"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--ink)] font-bold text-xs sm:text-sm hover:bg-[var(--surface-2)]/80 transition-all border border-[var(--line)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
              อีเมลของคุณ
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg font-display uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "ส่งลิงก์รีเซ็ตรหัสผ่าน"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/auth/sign-in"
              className="text-xs text-[var(--ink-2)] hover:text-[var(--accent)] font-medium inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
