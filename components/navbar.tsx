"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Footprints,
  Search,
  ChevronRight,
  ChevronDown,
  LogOut,
  Shield,
  User,
  Ticket,
  Calendar,
  Trophy,
  Flame,
  X,
  Compass,
  Sparkles,
  Home,
  QrCode,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { SearchCommandDialog } from "@/components/search/search-command-dialog";
import { NotificationCenterDialog } from "@/components/notifications/notification-center-dialog";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "outline" | "accent";
  number?: string;
}

const defaultNavItems: NavItem[] = [
  {
    label: "หน้าหลัก",
    href: "/",
    icon: Home,
    number: "01",
  },
  {
    label: "ค้นหางานวิ่ง",
    href: "/events",
    icon: Compass,
    badge: "32 OPEN",
    badgeVariant: "default",
    number: "02",
  },
  {
    label: "ปฏิทิน 2026",
    href: "/calendar",
    icon: Calendar,
    badge: "2026",
    badgeVariant: "secondary",
    number: "03",
  },
  {
    label: "ผลการแข่งขัน",
    href: "/results",
    icon: Trophy,
    badge: "CHIP",
    badgeVariant: "success",
    number: "04",
  },
];

interface NavbarProps {
  className?: string;
  items?: NavItem[];
}

export function Navbar({ className, items = defaultNavItems }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = React.useState(0);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch unread notifications count
  React.useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((json) => {
          const payload = json.data || json;
          if (payload.counts) {
            setUnreadNotifCount(payload.counts.unread || 0);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const [organizerStatus, setOrganizerStatus] = React.useState<{
    isOrganizer: boolean;
    role: string;
    roleLabel: string;
  } | null>(null);

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

  const userRole = (session?.user as any)?.role || "member";
  const isAdmin = userRole === "admin";
  const isOrganizer = organizerStatus?.isOrganizer || false;
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "RN";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--base)]/92 backdrop-blur-[16px] transition-all duration-200",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-[var(--content-max)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-3 lg:gap-5 xl:gap-7 shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] whitespace-nowrap shrink-0"
              aria-label="IT Runway หน้าแรก"
              onClick={() => setMobileOpen(false)}
            >
              {/* Runway Emblem */}
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-near)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                <Footprints className="size-5 stroke-[2.2]" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[var(--positive)] ring-2 ring-[var(--base)] animate-pulse" />
              </div>

              {/* Title & Location Pill */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-[var(--font-display)] text-lg font-extrabold tracking-tight text-[var(--ink)] whitespace-nowrap">
                  IT<span className="font-light text-[var(--ink-2)]"> RUNWAY</span>
                </span>
                <Badge
                  variant="surface"
                  size="sm"
                  className="hidden sm:inline-flex border-[var(--line)] text-[9px] font-bold tracking-widest uppercase whitespace-nowrap shrink-0"
                >
                  NAKHON PATHOM
                </Badge>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0"
              aria-label="เมนูหลัก"
            >
              {items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href === "/" && pathname === "");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative inline-flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 font-[var(--font-text)] text-xs font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-[var(--surface-2)] text-[var(--ink)] shadow-sm border border-[var(--line)]"
                        : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0 transition-colors duration-150",
                          isActive
                            ? "text-[var(--accent)]"
                            : "text-[var(--ink-3)] group-hover:text-[var(--accent)]"
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.25 font-[var(--font-mono)] text-[9px] font-bold uppercase transition-transform group-hover:scale-105 whitespace-nowrap shrink-0",
                          item.badgeVariant === "default"
                            ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                            : item.badgeVariant === "success"
                            ? "bg-[var(--positive)]/15 text-[var(--positive)] border border-[var(--positive)]/30"
                            : "bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--line)]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {(isOrganizer || isAdmin) && (
                <Link
                  href="/organizer/checkin"
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 font-[var(--font-text)] text-xs font-bold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] whitespace-nowrap shrink-0 border",
                    pathname.startsWith("/organizer/checkin")
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm"
                      : "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/25 bg-emerald-500/5"
                  )}
                >
                  <QrCode className="size-3.5 shrink-0 text-emerald-400" />
                  <span>ตรวจ BIB นักวิ่ง</span>
                  <span className="rounded-md px-1.5 py-0.25 font-[var(--font-mono)] text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GATE
                  </span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Quick Search, Auth Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-2.5 sm:px-3 text-xs text-[var(--ink-2)] transition-all hover:border-[var(--ink-3)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="ค้นหางานวิ่ง (Ctrl+K)"
            >
              <Search className="size-3.5 shrink-0 text-[var(--accent)]" />
              <span className="hidden md:inline font-[var(--font-text)] whitespace-nowrap">
                ค้นหางานวิ่ง...
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] text-[var(--ink-3)] whitespace-nowrap">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center Trigger */}
            {session && (
              <button
                type="button"
                onClick={() => setNotifOpen(true)}
                className="relative flex size-9 items-center justify-center rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-all hover:border-[var(--accent)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shrink-0 cursor-pointer"
                aria-label="ศูนย์แจ้งเตือน"
              >
                <Bell className="size-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-[var(--base)] animate-pulse font-mono">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </button>
            )}

            {/* Authenticated State vs Guest State */}
            {isPending ? (
              <div className="hidden sm:flex size-9 items-center justify-center rounded-full bg-[var(--surface-2)] animate-pulse shrink-0" />
            ) : session ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-1 sm:pr-2.5 transition-all hover:border-[var(--accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer whitespace-nowrap shrink-0"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="เมนูผู้ใช้งาน"
                >
                  <Avatar className="size-7 sm:size-7.5 border-none shrink-0">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name}
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="max-w-[100px] truncate text-xs font-semibold text-[var(--ink)] leading-none whitespace-nowrap">
                      {session.user.name}
                    </span>
                    <span className="text-[10px] font-mono leading-none mt-0.5 whitespace-nowrap flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-[var(--accent)] font-bold flex items-center gap-1">
                          <Shield className="size-2.5" />
                          <span>ADMIN</span>
                        </span>
                      ) : isOrganizer ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Footprints className="size-2.5" />
                          <span>ORGANIZER</span>
                        </span>
                      ) : (
                        <span className="text-[var(--ink-3)] flex items-center gap-1">
                          <User className="size-2.5" />
                          <span>MEMBER</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-3 text-[var(--ink-3)] transition-transform duration-200 hidden sm:block shrink-0",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-far)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50"
                    role="menu"
                  >
                    {/* User Summary Header */}
                    <div className="px-2.5 py-2 border-b border-[var(--line)] mb-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[var(--ink)] truncate">
                          {session.user.name}
                        </p>
                        <Badge
                          variant="default"
                          size="sm"
                          className={cn(
                            "text-[9px] font-mono px-1.5 py-0",
                            isAdmin
                              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                              : isOrganizer
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-[var(--surface-2)] text-[var(--ink-3)] border-[var(--line)]"
                          )}
                        >
                          {isAdmin ? "แอดมิน" : isOrganizer ? "ผู้จัดงาน" : "สมาชิก"}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-mono text-[var(--ink-3)] truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col gap-0.5">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--accent)] hover:bg-[var(--surface-2)] font-bold transition-colors whitespace-nowrap"
                          role="menuitem"
                        >
                          <Shield className="size-3.5 shrink-0" />
                          <span>แดชบอร์ดแอดมิน & อนุมัติงาน</span>
                        </Link>
                      )}

                      {(isOrganizer || isAdmin) && (
                        <Link
                          href="/organizer/checkin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-[var(--surface-2)] font-bold transition-colors whitespace-nowrap"
                          role="menuitem"
                        >
                          <QrCode className="size-3.5 shrink-0" />
                          <span>แถบตรวจ BIB / เช็คอินนักวิ่ง</span>
                        </Link>
                      )}

                      <Link
                        href="/organize"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors whitespace-nowrap"
                        role="menuitem"
                      >
                        <Calendar className="size-3.5 shrink-0 text-[var(--ink-3)]" />
                        <span>ยื่นคำขอจัดงานวิ่ง</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors whitespace-nowrap"
                        role="menuitem"
                      >
                        <User className="size-3.5 shrink-0 text-[var(--ink-3)]" />
                        <span>ข้อมูลบัญชีสมาชิก</span>
                      </Link>

                      <Link
                        href="/account/bibs"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors whitespace-nowrap"
                        role="menuitem"
                      >
                        <Ticket className="size-3.5 shrink-0 text-[var(--ink-3)]" />
                        <span>BIB & งานวิ่งของฉัน</span>
                      </Link>

                      <div className="h-px bg-[var(--line)] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer whitespace-nowrap"
                        role="menuitem"
                      >
                        <LogOut className="size-3.5 shrink-0" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  href="/auth/sign-in"
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius)] px-3 text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-all whitespace-nowrap shrink-0"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}

            {/* Primary CTA (Desktop & Tablet) */}
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex h-9 font-bold text-xs whitespace-nowrap shrink-0"
            >
              <Link href="/organize" className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span>จัดงานวิ่ง</span>
                <ChevronRight className="size-3.5 shrink-0 stroke-[2.5]" />
              </Link>
            </Button>

            {/* Mobile Hamburger Button (Accessible Touch Target: 44px min-h) */}
            <button
              type="button"
              aria-label={mobileOpen ? "ปิดเมนูการนำทาง" : "เปิดเมนูการนำทาง"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex size-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:hidden cursor-pointer"
            >
              <div className="relative size-4" aria-hidden="true">
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-full bg-current transition-all duration-200 ease-out",
                    mobileOpen ? "top-1.5 rotate-45" : "top-0.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 h-0.5 w-full bg-current transition-all duration-150 ease-out",
                    mobileOpen ? "opacity-0 scale-x-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-full bg-current transition-all duration-200 ease-out",
                    mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        <div
          id="mobile-navigation-drawer"
          className={cn(
            "grid overflow-hidden border-t border-[var(--line)] bg-[var(--surface)]/98 backdrop-blur-xl transition-all duration-300 ease-in-out lg:hidden",
            mobileOpen
              ? "grid-rows-[1fr] opacity-100 shadow-2xl"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
          aria-hidden={!mobileOpen}
        >
          <div className="min-h-0 max-h-[calc(100dvh-64px)] overflow-y-auto px-4 py-5 flex flex-col gap-4">
            {/* Mobile Search Bar Trigger */}
            <div
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="relative flex items-center h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] pl-10 pr-4 text-xs font-[var(--font-text)] text-[var(--ink-2)] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--ink)] transition-colors"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--accent)]" />
              <span>ค้นหางานวิ่ง, มินิมาราธอน, นครปฐม...</span>
              <kbd className="ml-auto rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 font-[var(--font-mono)] text-[9px] text-[var(--ink-3)]">
                ⌘K
              </kbd>
            </div>

            {/* Mobile Navigation Links (Touch Friendly: min 44px height) */}
            <nav className="flex flex-col gap-1.5" aria-label="เมนูมือถือ">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href === "/" && pathname === "");

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex min-h-[44px] items-center justify-between rounded-[var(--radius)] border px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.99]",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--ink)]"
                        : "border-[var(--line)] bg-[var(--surface-2)]/60 text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-[var(--font-mono)] text-[11px] font-bold text-[var(--ink-3)]">
                        {item.number}
                      </span>
                      {Icon && (
                        <div className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isActive
                            ? "bg-[var(--accent)]/15 border-[var(--accent)]/30 text-[var(--accent)]"
                            : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-3)] group-hover:text-[var(--accent)]"
                        )}>
                          <Icon className="size-3.5" aria-hidden="true" />
                        </div>
                      )}
                      <span className="font-[var(--font-text)] whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || "secondary"}
                        size="sm"
                        className="font-[var(--font-mono)] text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Session Info Card or Auth Buttons */}
            {session ? (
              <div className="flex flex-col gap-2.5 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9">
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-[var(--ink)]">
                        {session.user.name}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--ink-3)] truncate max-w-[180px]">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    size="sm"
                    className={cn(
                      "text-[9px] font-mono",
                      isAdmin
                        ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                        : isOrganizer
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-[var(--surface)] text-[var(--ink-3)] border-[var(--line)]"
                    )}
                  >
                    {isAdmin ? "แอดมิน" : isOrganizer ? "ผู้จัดงาน" : "สมาชิก"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {isAdmin && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="h-10 text-xs text-[var(--accent)] col-span-2"
                    >
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <Shield className="size-3.5" />
                        <span>แดชบอร์ดแอดมิน & อนุมัติงาน</span>
                      </Link>
                    </Button>
                  )}
                  {(isOrganizer || isAdmin) && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="h-10 text-xs text-emerald-400 border-emerald-500/30 col-span-2"
                    >
                      <Link href="/organizer/checkin" onClick={() => setMobileOpen(false)}>
                        <QrCode className="size-3.5" />
                        <span>แถบตรวจ BIB / เช็คอินนักวิ่ง</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs col-span-2 text-[var(--accent)]"
                  >
                    <Link href="/organize" onClick={() => setMobileOpen(false)}>
                      <Calendar className="size-3.5" />
                      <span>ยื่นคำขอจัดงานวิ่ง</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs"
                  >
                    <Link href="/account" onClick={() => setMobileOpen(false)}>
                      <User className="size-3.5" />
                      <span>ข้อมูลบัญชี</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs"
                  >
                    <Link href="/account/bibs" onClick={() => setMobileOpen(false)}>
                      <Ticket className="size-3.5" />
                      <span>BIB ของฉัน</span>
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-10 text-xs col-span-2"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="size-3.5" />
                    <span>ออกจากระบบ</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 border-t border-[var(--line)] pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="min-h-[44px] text-xs font-semibold"
                >
                  <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>
                    เข้าสู่ระบบ
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="default"
                  className="min-h-[44px] text-xs font-bold"
                >
                  <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}>
                    <span>สมัครสมาชิก</span>
                    <ChevronRight className="size-3.5 stroke-[2.5]" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Footer Status */}
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 font-[var(--font-mono)] text-[10px] text-[var(--ink-3)]">
              <span>IT RUNWAY • NAKHON PATHOM</span>
              <div className="flex items-center gap-1.5 text-[var(--positive)]">
                <span className="size-1.5 rounded-full bg-[var(--positive)] animate-pulse" />
                <span>CHIP TIMING READY</span>
              </div>
            </div>
          </div>
        </div>
        {/* Runway Hazard Stripe Line */}
        <div className="h-[3px] w-full runway-stripe" aria-hidden="true" />
      </header>

      {/* Global Real-Time Search & Autocomplete Modal Dialog */}
      <SearchCommandDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Multi-Channel Notification Center Dialog */}
      <NotificationCenterDialog
        open={notifOpen}
        onOpenChange={setNotifOpen}
        onUnreadCountChange={setUnreadNotifCount}
      />
    </>
  );
}

export default Navbar;
