"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { authClient } from "@/lib/auth-client";
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [verifying, setVerifying] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      const verify = async () => {
        try {
          const res = await authClient.verifyEmail({
            query: { token },
          });

          if (res.error) {
            setError(res.error.message || "ลิงก์ยืนยันอีเมลหมดอายุหรือไม่ถูกต้อง");
          } else {
            setVerified(true);
          }
        } catch (err: any) {
          setError(err?.message || "เกิดข้อผิดพลาดในการยืนยันอีเมล");
        } finally {
          setVerifying(false);
        }
      };

      verify();
    }
  }, [token]);

  const handleResend = async () => {
    if (!emailParam) return;
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const res = await authClient.sendVerificationEmail({
        email: emailParam,
        callbackURL: "/",
      });

      if (res.error) {
        setError(res.error.message || "ไม่สามารถส่งอีเมลยืนยันใหม่ได้");
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      badge="EMAIL VERIFICATION"
      title={verified ? "ยืนยันอีเมลสำเร็จ!" : "ตรวจสอบกล่องจดหมาย"}
      subtitle={
        verified
          ? "บัญชีของคุณได้รับการยืนยันเรียบร้อยแล้ว พร้อมเริ่มใช้งาน IT Runway"
          : "เราได้ส่งลิงก์ยืนยันตัวตนไปยังที่อยู่อีเมลของคุณแล้ว"
      }
    >
      {/* Error alert */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Verifying Token State */}
      {verifying && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-medium text-[var(--ink-2)]">
            กำลังตรวจสอบความถูกต้องของ Token ยืนยันอีเมล...
          </p>
        </div>
      )}

      {/* Verified Success State */}
      {verified && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-sm space-y-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="font-bold text-base text-emerald-300">
              ยืนยันอีเมลเรียบร้อยแล้ว
            </div>
            <p className="text-xs text-emerald-400/80">
              คุณสามารถเข้าสู่ระบบและเริ่มค้นหางานวิ่งที่คุณสนใจได้ทันที
            </p>
          </div>

          <Link
            href="/auth/sign-in"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all font-display uppercase tracking-wider"
          >
            <span>เข้าสู่ระบบเลย</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Waiting for Email verification (Instruction State) */}
      {!token && !verified && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto text-[var(--accent)]">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="text-sm text-[var(--ink)]">
              ส่งไปที่:{" "}
              <strong className="text-[var(--accent)] font-mono">
                {emailParam || "อีเมลของคุณ"}
              </strong>
            </div>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              กรุณาเปิดอีเมลและกดปุ่ม <strong>"ยืนยันอีเมลทันที"</strong> เพื่อเปิดใช้งานบัญชีของคุณ (หากไม่พบ กรุณาตรวจดูในกล่องขยะ/Spam)
            </p>
          </div>

          {resendSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว</span>
            </div>
          )}

          {emailParam && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-semibold hover:bg-[var(--surface-2)]/80 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>ส่งอีเมลยืนยันใหม่อีกครั้ง</span>
            </button>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/auth/sign-in"
              className="text-xs text-[var(--accent)] hover:underline font-medium"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--base)] text-[var(--ink)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
