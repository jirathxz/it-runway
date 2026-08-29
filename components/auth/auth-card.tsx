"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}

export function AuthCard({ children, title, subtitle, badge }: AuthCardProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[var(--base)]">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--accent)]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Back to Home Button */}
      <div className="relative z-10 w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)]/50 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO RUNWAY</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] font-bold">
          <Zap className="w-3.5 h-3.5 fill-[var(--accent)]" />
          <span>IT RUNWAY AUTH</span>
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 backdrop-blur-xl shadow-2xl overflow-hidden p-6 sm:p-8 transition-all">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />

        {/* Card Header */}
        <div className="mb-6">
          {badge && (
            <span className="inline-block mb-2 text-[10px] font-mono font-bold tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded border border-[var(--accent)]/20 uppercase">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight font-display">
            {title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card Body */}
        {children}
      </div>

      {/* Bottom Footer info */}
      <div className="relative z-10 mt-6 text-center text-[11px] font-mono text-[var(--ink-3)]">
        ระบบยืนยันตัวตนความปลอดภัยสูง • IT Runway Nakhon Pathom
      </div>
    </div>
  );
}
