"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Shield,
  ShieldAlert,
  Lock,
  Loader2,
  Menu,
  ArrowLeft,
  Bell,
  Activity,
  CheckCircle2,
  QrCode,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);

  // Fetch pending requests count for badge
  React.useEffect(() => {
    if ((session?.user as any)?.role === "admin") {
      fetch("/api/admin/requests")
        .then((res) => res.json())
        .then((data) => {
          if (data.requests) {
            const pending = data.requests.filter(
              (r: any) => r.approvalStatus === "pending" || r.approvalStatus === "PENDING"
            );
            setPendingRequestsCount(pending.length);
          }
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--base)] text-[var(--ink)] gap-3 p-4">
        <Loader2 className="size-8 animate-spin text-amber-500" />
        <span className="text-xs font-mono text-[var(--ink-2)]">
          VERIFYING IT RUNWAY ADMIN PRIVILEGES...
        </span>
      </div>
    );
  }

  // Not logged in or Not Admin state
  const isAdmin = (session?.user as any)?.role === "admin";

  if (!session?.user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--base)] text-[var(--ink)]">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-red-500/20 bg-[var(--surface)] text-center flex flex-col gap-4 shadow-xl">
          <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock className="size-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              RESTRICTED ADMIN ACCESS
            </h1>
            <Badge
              variant="destructive"
              className="mt-1 font-mono text-[10px]"
            >
              403 FORBIDDEN
            </Badge>
          </div>

          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            {session?.user
              ? `บัญชีของคุณ (${session.user.email}) อยู่ในสถานะสมาชิกทั่วไป ยังไม่ได้รับสิทธิ์เข้าถึงระบบ IT Runway Admin`
              : "พื้นที่นี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ IT Runway กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน"}
          </p>

          <div className="flex flex-col gap-2 pt-2">
            {!session?.user ? (
              <Button
                asChild
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-10 cursor-pointer"
              >
                <Link href="/auth/sign-in">
                  เข้าสู่ระบบผู้ดูแลระบบ (Admin Sign-In)
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-xs h-10 cursor-pointer"
              >
                <Link href="/organize">
                  ยื่นขอจัดงานวิ่ง เพื่อขอสิทธิ์ผู้จัดงาน
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full text-xs h-10 cursor-pointer border-[var(--line)]"
            >
              <Link href="/">
                <ArrowLeft className="size-3.5 mr-1.5" />
                <span>กลับสู่หน้าหลักนักวิ่ง</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active breadcrumb label
  const getBreadcrumb = () => {
    if (pathname === "/admin") return "ภาพรวมระบบ (Overview)";
    if (pathname.startsWith("/admin/events")) return "คำขอจัดงานวิ่ง (Event Requests)";
    if (pathname.startsWith("/admin/users")) return "จัดการสมาชิก & สิทธิ์ (Users & Roles)";
    if (pathname.startsWith("/admin/timing")) return "ระบบจับเวลา RFID (Race Timing)";
    if (pathname.startsWith("/admin/settings")) return "ตั้งค่าระบบ & ประวัติ (Settings & Logs)";
    return "ศูนย์ควบคุมแอดมิน";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Admin Global Header Topbar */}
      <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex size-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:text-amber-400 lg:hidden cursor-pointer shrink-0"
            aria-label="เปิดเมนูแอดมิน"
          >
            <Menu className="size-5" />
          </button>

          {/* Runway Admin Logo for Tablet/Mobile */}
          <Link
            href="/admin"
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-sm">
              <Shield className="size-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-[var(--font-display)] text-sm font-extrabold tracking-tight text-[var(--ink)] leading-none">
                IT RUNWAY <span className="text-amber-400">ADMIN</span>
              </span>
              <span className="text-[9px] font-mono text-[var(--ink-3)] leading-none mt-0.5 hidden sm:inline">
                {getBreadcrumb()}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Topbar Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* RFID Timing Engine Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-mono">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[var(--ink-2)] font-semibold">RFID TIMING:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          {/* Quick Checkin Action */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:inline-flex h-8 text-xs font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15"
          >
            <Link href="/organizer/checkin">
              <QrCode className="size-3.5 mr-1.5" />
              <span>แถบตรวจ BIB</span>
            </Link>
          </Button>

          {/* Switch Back to Runner Site */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
          >
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">หน้าเว็บนักวิ่ง</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Admin Body Area with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Responsive Sidebar */}
        <AdminSidebar
          pendingCount={pendingRequestsCount}
          mobileOpen={mobileSidebarOpen}
          onMobileOpenChange={setMobileSidebarOpen}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Admin Hazard Footer Stripe */}
      <div className="h-[2px] w-full runway-stripe opacity-75" aria-hidden="true" />
    </div>
  );
}
