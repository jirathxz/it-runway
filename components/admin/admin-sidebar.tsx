"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Timer,
  Settings,
  ArrowLeft,
  Shield,
  QrCode,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Footprints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";

interface AdminSidebarProps {
  pendingCount?: number;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export const adminNavItems = [
  {
    title: "ภาพรวมระบบ",
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "คำขอจัดงานวิ่ง",
    label: "Event Requests",
    href: "/admin/events",
    icon: CalendarCheck2,
    hasBadge: true,
  },
  {
    title: "จัดการสมาชิก & สิทธิ์",
    label: "Users & Roles",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "ระบบจับเวลา RFID",
    label: "Race Timing",
    href: "/admin/timing",
    icon: Timer,
  },
  {
    title: "ตั้งค่าระบบ & ประวัติ",
    label: "Settings & Logs",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({
  pendingCount = 0,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
      <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
        MAIN NAVIGATION
      </div>

      {adminNavItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onMobileOpenChange(false)}
            className={cn(
              "group flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer",
              isActive
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-slate-950"
                    : "text-[var(--ink-3)] group-hover:text-amber-400"
                )}
              />
              <div className="flex flex-col text-left">
                <span>{item.title}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono leading-none",
                    isActive ? "text-slate-900/80" : "text-[var(--ink-3)]"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </div>

            {item.hasBadge && pendingCount > 0 && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0",
                  isActive
                    ? "bg-slate-950 text-amber-300"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="my-3 px-3">
        <div className="h-px bg-[var(--line)]" />
      </div>

      <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)] font-bold">
        QUICK ACCESS
      </div>

      {/* Organizer BIB Check-in */}
      <Link
        href="/organizer/checkin"
        onClick={() => onMobileOpenChange(false)}
        className="group flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 bg-emerald-500/5 transition-all select-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <QrCode className="size-4 shrink-0 text-emerald-400" />
          <div className="flex flex-col text-left">
            <span>ตรวจ BIB นักวิ่ง</span>
            <span className="text-[10px] font-mono text-emerald-500/80">
              Gate Check-in
            </span>
          </div>
        </div>
        <Badge
          variant="secondary"
          size="sm"
          className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono"
        >
          LIVE
        </Badge>
      </Link>

      {/* Back to Public Runner Site */}
      <Link
        href="/"
        onClick={() => onMobileOpenChange(false)}
        className="group flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-all select-none cursor-pointer mt-1"
      >
        <ArrowLeft className="size-4 shrink-0 text-[var(--ink-3)] group-hover:-translate-x-0.5 transition-transform" />
        <div className="flex flex-col text-left">
          <span>กลับหน้าเว็บนักวิ่ง</span>
          <span className="text-[10px] font-mono text-[var(--ink-3)]">
            it-runway.com
          </span>
        </div>
      </Link>
    </nav>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-[var(--line)] bg-[var(--surface)] min-h-[calc(100dvh-64px)] sticky top-16 select-none z-30">
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--line)] flex items-center gap-3 bg-[var(--surface-2)]/40">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Shield className="size-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-[var(--font-display)] text-sm font-extrabold tracking-tight text-[var(--ink)]">
                IT RUNWAY
              </span>
              <Badge
                variant="default"
                size="sm"
                className="bg-amber-500 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0"
              >
                ADMIN
              </Badge>
            </div>
            <span className="text-[10px] font-mono text-[var(--ink-3)] truncate">
              Command & Control Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        {renderNavLinks()}

        {/* Bottom Session Footer */}
        {session && (
          <div className="p-3.5 border-t border-[var(--line)] bg-[var(--surface-2)]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 border border-amber-500/40 shrink-0">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[var(--ink)] truncate max-w-[110px]">
                  {session.user.name}
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold leading-none">
                  SUPERUSER
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              className="size-8 text-[var(--ink-3)] hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => onMobileOpenChange(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-[var(--surface)] border-r border-[var(--line)] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-2)]/50">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                  <Shield className="size-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-[var(--font-display)] text-sm font-bold text-[var(--ink)]">
                      IT RUNWAY
                    </span>
                    <Badge
                      variant="default"
                      size="sm"
                      className="bg-amber-500 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0"
                    >
                      ADMIN
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onMobileOpenChange(false)}
                className="size-8 flex items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                aria-label="ปิดเมนูแอดมิน"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>

            {/* Mobile Session Info */}
            {session && (
              <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)]/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 border border-amber-500/40">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[var(--ink)] truncate max-w-[130px]">
                      {session.user.name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      ADMINISTRATOR
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="h-8 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="size-3.5 mr-1" />
                  <span>ออก</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
