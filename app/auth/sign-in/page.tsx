"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/social-button";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Lock,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
  User,
  Zap,
  ArrowRight,
} from "lucide-react";
import * as React from "react";

type AuthTab = "password" | "magic-link";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [activeTab, setActiveTab] = useState<AuthTab>("password");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"member" | "admin" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email + Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Magic Link state
  const [magicEmail, setMagicEmail] = useState("");

  // Normalize username or email
  const normalizeEmail = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === "user-runway" || trimmed.toLowerCase() === "user-runway@it-runway.com") {
      return "user-runway@it-runway.com";
    }
    if (trimmed.toLowerCase() === "admin-runway" || trimmed.toLowerCase() === "admin-runway@it-runway.com") {
      return "admin-runway@it-runway.com";
    }
    return trimmed;
  };

  // 1. Handle Email & Password Sign In
  const handlePasswordSignIn = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const inputEmail = overrideEmail || email;
    const inputPassword = overridePassword || password;
    const resolvedEmail = normalizeEmail(inputEmail);

    try {
      const res = await authClient.signIn.email({
        email: resolvedEmail,
        password: inputPassword,
        callbackURL: callbackUrl,
      });

      if (res.error) {
        if (res.error.message?.toLowerCase().includes("verify") || res.error.status === 403) {
          setError("กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ เราได้ส่งลิงก์ยืนยันไปที่อีเมลแล้ว");
        } else {
          setError(res.error.message || "ชื่อผู้ใช้ / อีเมล หรือรหัสผ่านไม่ถูกต้อง");
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
      setDemoLoading(null);
    }
  };

  // 1-Click Demo Login
  const handleQuickDemoLogin = async (type: "member" | "admin") => {
    setDemoLoading(type);
    setError(null);
    setSuccessMessage(null);

    const demoUser = type === "member" ? "user-runway" : "admin-runway";
    const demoPass = type === "member" ? "user-runway" : "admin-runway";

    setEmail(demoUser);
    setPassword(demoPass);

    await handlePasswordSignIn(undefined, demoUser, demoPass);
  };

  // 2. Handle Magic Link Sign In
  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const resolvedEmail = normalizeEmail(magicEmail);

    try {
      const res = await authClient.signIn.magicLink({
        email: resolvedEmail,
        callbackURL: callbackUrl,
      });

      if (res.error) {
        setError(res.error.message || "ไม่สามารถส่ง Magic Link ได้");
      } else {
        setSuccessMessage(`ส่งลิงก์เข้าสู่ระบบไปที่ ${resolvedEmail} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ`);
      }
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการส่ง Magic Link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="ACCELERATE ACCESS"
      title="เข้าสู่ระบบ"
      subtitle="เลือกช่องทางการเข้าใช้งานบัญชีนักวิ่ง IT Runway ของคุณ"
    >
      {/* Alert Messages */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* QUICK DEMO USERS (MEMBER & ADMIN) */}
      <div className="mb-6 p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)] font-[var(--font-display)]">
            <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>บัญชีทดสอบระบบ (Demo Accounts)</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">1-CLICK LOGIN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Member Demo */}
          <button
            type="button"
            disabled={loading || demoLoading !== null}
            onClick={() => handleQuickDemoLogin("member")}
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ink)]">
                <User className="w-3 h-3 text-blue-400" />
                <span>user-runway</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">
                MEMBER
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-3)] group-hover:text-[var(--accent)]">
              <span>รหัส: user-runway</span>
              {demoLoading === "member" ? (
                <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
              ) : (
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>

          {/* Admin Demo */}
          <button
            type="button"
            disabled={loading || demoLoading !== null}
            onClick={() => handleQuickDemoLogin("admin")}
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-amber-500 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ink)]">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>admin-runway</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
                ADMIN
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-3)] group-hover:text-amber-400">
              <span>รหัส: admin-runway</span>
              {demoLoading === "admin" ? (
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              ) : (
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (2 Tabs: Password & Magic Link) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--surface-2)]/80 border border-[var(--line)] mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("password");
            setError(null);
            setSuccessMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "password"
              ? "bg-[var(--surface)] text-[var(--accent)] shadow border border-[var(--line)]"
              : "text-[var(--ink-2)] hover:text-[var(--ink)]"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>รหัสผ่าน</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("magic-link");
            setError(null);
            setSuccessMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "magic-link"
              ? "bg-[var(--surface)] text-[var(--accent)] shadow border border-[var(--line)]"
              : "text-[var(--ink-2)] hover:text-[var(--ink)]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Magic Link</span>
        </button>
      </div>

      {/* 1. Tab Content: Email / Username + Password */}
      {activeTab === "password" && (
        <form onSubmit={(e) => handlePasswordSignIn(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น user-runway หรือ email@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--ink-2)]">
                รหัสผ่าน
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[var(--accent)] hover:underline font-medium"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[var(--accent)]/10 font-display uppercase tracking-wider"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "เข้าสู่ระบบ"}
          </button>
        </form>
      )}

      {/* 2. Tab Content: Magic Link */}
      {activeTab === "magic-link" && (
        <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--ink-2)] mb-1.5">
              อีเมลสำหรับรับ Magic Link
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-3)]" />
              <input
                type="text"
                required
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                placeholder="runner@example.com หรือ user-runway"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:bg-[var(--surface-2)] text-sm text-[var(--ink)] placeholder-[var(--ink-3)] focus:border-[var(--accent)] focus:outline-none transition-all"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--ink-3)]">
              เราจะส่งลิงก์เข้าสู่ระบบให้ทางอีเมลโดยไม่ต้องกรอกรหัสผ่าน
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg font-display uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "ส่ง MAGIC LINK"
            )}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--surface)] px-3 text-[var(--ink-3)] font-mono">
            หรือ
          </span>
        </div>
      </div>

      {/* Social Logins */}
      <GoogleSignInButton label="เข้าสู่ระบบด้วย Google" />

      {/* Sign Up Link */}
      <div className="mt-6 pt-5 border-t border-[var(--line)] text-center text-xs text-[var(--ink-2)]">
        ยังไม่มีบัญชีนักวิ่ง?{" "}
        <Link
          href="/auth/sign-up"
          className="text-[var(--accent)] font-bold hover:underline ml-1"
        >
          สมัครสมาชิกใหม่
        </Link>
      </div>
    </AuthCard>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[var(--base)] flex items-center justify-center text-xs font-mono text-[var(--ink-3)]">กำลังโหลด...</div>}>
      <SignInContent />
    </React.Suspense>
  );
}
