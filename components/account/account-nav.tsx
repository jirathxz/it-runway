"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Ticket, Sparkles, ArrowLeft, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";

interface AccountNavProps {
  bibCount?: number;
}

export function AccountNav({ bibCount = 3 }: AccountNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [organizerStatus, setOrganizerStatus] = React.useState<any>(null);

  React.useEffect(() => {
    if (session?.user) {
      fetch("/api/organizer/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.isLoggedIn) {
            setOrganizerStatus(data);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const isProfile = pathname === "/account" || pathname === "/account/profile";
  const isBibs = pathname === "/account/bibs" || pathname === "/my-events";
  const isCheckin = pathname.startsWith("/organizer/checkin");
  const isOrganizer = organizerStatus?.isOrganizer || (session?.user as any)?.role === "admin";

  return (
    <div className="w-full mb-8">
      {/* Back to Events / Home Bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>กลับไปหน้ารวมงานวิ่ง</span>
        </Link>

        <Badge
          variant="outline"
          className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/5"
        >
          RUNNER DASHBOARD • 2026
        </Badge>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-near)]">
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto">
          {/* Tab 1: Profile */}
          <Link
            href="/account"
            className={cn(
              "flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-[var(--font-text)] text-xs sm:text-sm font-semibold transition-all select-none",
              isProfile
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md font-bold"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <User className="size-4 shrink-0" />
            <span>ข้อมูลบัญชีนักวิ่ง</span>
          </Link>

          {/* Tab 2: BIBs */}
          <Link
            href="/account/bibs"
            className={cn(
              "flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-[var(--font-text)] text-xs sm:text-sm font-semibold transition-all select-none",
              isBibs
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md font-bold"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <Ticket className="size-4 shrink-0" />
            <span>BIB & งานวิ่งของฉัน</span>
            <span
              className={cn(
                "ml-0.5 px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold",
                isBibs
                  ? "bg-black/20 text-[var(--accent-ink)]"
                  : "bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]"
              )}
            >
              {bibCount}
            </span>
          </Link>

          {/* Tab 3: Organizer BIB Check-in (when organizer/admin) */}
          {isOrganizer && (
            <Link
              href="/organizer/checkin"
              className={cn(
                "col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-[var(--font-text)] text-xs sm:text-sm font-semibold transition-all select-none border border-emerald-500/30",
                isCheckin
                  ? "bg-emerald-500 text-white shadow-md font-bold"
                  : "text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5 font-bold"
              )}
            >
              <QrCode className="size-4 shrink-0 text-emerald-400" />
              <span>แถบตรวจ BIB นักวิ่ง</span>
              <span className="px-1.5 py-0.25 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                GATE
              </span>
            </Link>
          )}
        </div>

        {/* Right Info Note */}
        <div className="hidden lg:flex items-center gap-2 pr-3 text-[11px] font-mono text-[var(--ink-3)]">
          <Sparkles className="size-3.5 text-[var(--accent)]" />
          <span>NAKHON PATHOM RUNWAY ATHLETE SYSTEM</span>
        </div>
      </div>
    </div>
  );
}
