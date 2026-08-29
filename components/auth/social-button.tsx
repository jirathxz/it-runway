"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  label?: string;
  callbackURL?: string;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  label = "ดำเนินการต่อด้วย Google",
  callbackURL = "/",
  onError,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (res?.error) {
        const msg =
          res.error.message ||
          "ไม่สามารถเชื่อมต่อกับ Google ได้ กรุณาตรวจสอบการตั้งค่า GOOGLE_CLIENT_ID";
        setErrorMessage(msg);
        onError?.(msg);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const msg =
        err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบผ่าน Google";
      setErrorMessage(msg);
      onError?.(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] text-[var(--ink)] font-medium text-xs sm:text-sm transition-all hover:border-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 cursor-pointer select-none"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
        )}
        <span>{label}</span>
      </button>

      {errorMessage && (
        <p className="text-[11px] font-mono text-red-400 text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
