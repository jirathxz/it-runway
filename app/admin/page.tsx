"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  LogOut,
  ArrowLeft,
  Loader2,
  Lock,
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  Footprints,
  QrCode,
  Check,
  X,
  Sparkles,
  Phone,
  Mail,
  User,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = React.useState<"requests" | "users" | "overview">("requests");

  // Requests state
  const [requests, setRequests] = React.useState<any[]>([]);
  const [requestFilter, setRequestFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [loadingRequests, setLoadingRequests] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // Users state
  const [users, setUsers] = React.useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState("");

  const isAdmin = (session?.user as any)?.role === "admin";

  // Fetch Requests
  const fetchRequests = React.useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error("Failed to load admin requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  }, [isAdmin]);

  // Fetch Users
  const fetchUsers = React.useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  React.useEffect(() => {
    if (isAdmin) {
      fetchRequests();
      fetchUsers();
    }
  }, [isAdmin, fetchRequests, fetchUsers]);

  // Handle Approve or Reject
  const handleRequestAction = async (eventId: string, action: "approve" | "reject") => {
    setActionLoading(eventId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ดำเนินการไม่สำเร็จ");
      }
      setActionMessage(data.message);
      fetchRequests();
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(null);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--base)] text-[var(--ink)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        <p className="text-xs font-mono text-[var(--ink-2)]">AUTHENTICATING ACCESS...</p>
      </div>
    );
  }

  // Unauthorized state
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--base)]">
        <div className="max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-[var(--surface)]/90 backdrop-blur-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-display text-[var(--ink)]">
            RESTRICTED ACCESS (401)
          </h1>
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            พื้นที่นี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ IT Runway เท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-xs uppercase tracking-wider font-display hover:brightness-110 transition-all"
          >
            เข้าสู่ระบบผู้ดูแลระบบ
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.approvalStatus === "pending");
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === "pending") return r.approvalStatus === "pending";
    if (requestFilter === "approved") return r.approvalStatus === "approved";
    if (requestFilter === "rejected") return r.approvalStatus === "rejected";
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase().trim();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleBadge?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--base)] text-[var(--ink)] flex flex-col">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-[var(--ink-2)] hover:text-[var(--accent)] transition-colors px-2.5 py-1.5 rounded-lg border border-[var(--line)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RUNWAY HOME</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-[var(--ink)]">
              IT RUNWAY <span className="text-[var(--accent)]">ADMIN</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 justify-end">
              <span>{session.user.name}</span>
              <Badge variant="default" size="sm" className="font-mono text-[10px]">
                ADMIN
              </Badge>
            </div>
            <div className="text-[11px] font-mono text-[var(--ink-3)]">
              {session.user.email}
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-[var(--ink-2)] transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Role Warning if user is not admin yet */}
        {!isAdmin && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <div className="font-bold text-amber-200">
                สถานะปัจจุบัน: สมาชิกทั่วไป (Member Role)
              </div>
              <p className="text-amber-300/80">
                คุณเข้าสู่ระบบสำเร็จแล้ว สามารถขอจัดงานวิ่งได้ที่หน้าขอจัดงาน เมื่อได้รับการอนุมัติ ระบบจะปรับสถานะเป็นผู้จัดงานชั่วคราวพร้อมเปิดแถบตรวจ BIB ทันที
              </p>
              <div className="pt-2">
                <Button asChild size="sm">
                  <Link href="/organize">ไปหน้าขอจัดงานวิ่ง</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "requests"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            <Calendar className="size-4" />
            <span>คำขอจัดงานวิ่ง (Event Requests)</span>
            {pendingRequests.length > 0 && (
              <span className="size-5 rounded-full bg-red-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            <Users className="size-4" />
            <span>จัดการสมาชิก & ผู้จัดงาน ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            <Activity className="size-4" />
            <span>ภาพรวมระบบ (Overview)</span>
          </button>

          <div className="ml-auto">
            <Button asChild size="sm" variant="outline" className="h-8 text-xs font-mono">
              <Link href="/organizer/checkin">
                <QrCode className="size-3.5 mr-1 text-[var(--accent)]" />
                <span>เปิดแถบตรวจ BIB ทุกงาน</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* TAB 1: Event Requests */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setRequestFilter("pending")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      requestFilter === "pending"
                        ? "bg-amber-500/20 text-amber-400 font-bold"
                        : "text-[var(--ink-3)]"
                    }`}
                  >
                    รออนุมัติ ({pendingRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("approved")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      requestFilter === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 font-bold"
                        : "text-[var(--ink-3)]"
                    }`}
                  >
                    อนุมัติแล้ว
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("rejected")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      requestFilter === "rejected"
                        ? "bg-red-500/20 text-red-400 font-bold"
                        : "text-[var(--ink-3)]"
                    }`}
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter("all")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      requestFilter === "all"
                        ? "bg-[var(--surface)] text-[var(--ink)] font-bold"
                        : "text-[var(--ink-3)]"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={fetchRequests}
                className="h-8 text-xs font-mono text-[var(--accent)]"
              >
                <RotateCcw className="size-3.5 mr-1" />
                รีเฟรชคำขอ
              </Button>
            </div>

            {actionMessage && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{actionMessage}</span>
              </div>
            )}

            {loadingRequests ? (
              <div className="py-16 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-2">
                <Footprints className="size-8 animate-pulse text-[var(--accent)]" />
                <span>กำลังโหลดรายการคำขอจัดงาน...</span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center text-xs text-[var(--ink-3)] font-mono space-y-2">
                <Calendar className="size-10 mx-auto text-[var(--ink-3)]/50" />
                <p>ไม่มีรายการคำขอในสถานะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => {
                  const isApproved = req.approvalStatus === "approved";
                  const isPending = req.approvalStatus === "pending";
                  const isRejected = req.approvalStatus === "rejected";

                  return (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-[var(--ink)] line-clamp-1">
                            {req.title}
                          </h3>
                          <p className="text-xs font-mono text-[var(--ink-3)] flex items-center gap-1">
                            <MapPin className="size-3 text-[var(--accent)] shrink-0" />
                            <span>{req.location}</span>
                          </p>
                        </div>

                        {isPending && (
                          <Badge variant="secondary" size="sm" className="bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
                            <Clock className="size-3 mr-1" />
                            รออนุมัติ
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                            <CheckCircle2 className="size-3 mr-1" />
                            อนุมัติแล้ว
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" size="sm" className="shrink-0">
                            <AlertCircle className="size-3 mr-1" />
                            ปฏิเสธ
                          </Badge>
                        )}
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[var(--ink-3)] block">วันที่จัดงาน</span>
                          <span className="font-bold text-[var(--ink)]">
                            {new Date(req.date).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--ink-3)] block">ระยะทาง</span>
                          <span className="font-bold text-[var(--ink)]">{req.distance}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--ink-3)] block">ค่าสมัคร</span>
                          <span className="font-bold text-[var(--accent)]">
                            ฿{req.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Organizer Details */}
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs">
                        <Avatar className="size-9 border border-[var(--line)]">
                          <AvatarImage src={req.organizer?.image || undefined} />
                          <AvatarFallback>{req.organizerName?.slice(0, 2) || "RN"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                            <span className="truncate">{req.organizerName || req.organizer?.name}</span>
                            <span className="text-[10px] text-[var(--accent)] font-mono font-normal">
                              (ผู้ขอจัด)
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--ink-3)] font-mono truncate">
                            {req.organizerContact || req.organizer?.email}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
                        {isPending ? (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              size="sm"
                              disabled={actionLoading === req.id}
                              onClick={() => handleRequestAction(req.id, "approve")}
                              className="flex-1 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white h-9"
                            >
                              <Check className="size-4 mr-1 stroke-[3]" />
                              <span>อนุมัติงานวิ่ง (Approve)</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionLoading === req.id}
                              onClick={() => handleRequestAction(req.id, "reject")}
                              className="h-9 text-xs"
                            >
                              <X className="size-4 mr-1" />
                              <span>ปฏิเสธ</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] font-mono text-[var(--ink-3)]">
                              สถานะ: {req.approvalStatus}
                            </span>
                            {isApproved && (
                              <Button asChild size="sm" variant="outline" className="h-8 text-xs font-mono">
                                <Link href={`/organizer/checkin?eventId=${req.id}`}>
                                  <QrCode className="size-3.5 mr-1" />
                                  <span>เปิดแถบตรวจ BIB</span>
                                </Link>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Users Management */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--ink)]">
                  รายชื่อสมาชิกและระดับสิทธิ์ (Users & Roles)
                </h3>
                <p className="text-xs text-[var(--ink-2)]">
                  สมาชิกที่จัดงานวิ่งจะได้รับสิทธิ์ "ผู้จัดงาน" อัตโนมัติในระหว่างที่งานวิ่งเปิดใช้งาน
                </p>
              </div>

              <Input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมล, สิทธิ์..."
                className="h-9 w-full sm:w-60 text-xs bg-[var(--surface-2)] font-mono"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--line)] text-[11px] font-mono text-[var(--ink-3)] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">สมาชิก</th>
                    <th className="py-2.5 px-3">อีเมล</th>
                    <th className="py-2.5 px-3 text-center">ระดับสิทธิ์ (Role)</th>
                    <th className="py-2.5 px-3 text-center">สมัครวิ่งแล้ว</th>
                    <th className="py-2.5 px-3 text-center">งานที่ขอจัด</th>
                    <th className="py-2.5 px-3">วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredUsers.map((u) => {
                    const isUserAdmin = u.effectiveRole === "admin";
                    const isOrganizer = u.effectiveRole === "organizer";

                    return (
                      <tr key={u.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-8">
                              <AvatarImage src={u.image || undefined} />
                              <AvatarFallback>{u.name?.slice(0, 2) || "US"}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-[var(--ink)]">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[var(--ink-2)]">{u.email}</td>
                        <td className="py-3 px-3 text-center">
                          {isUserAdmin ? (
                            <Badge variant="default" size="sm" className="font-mono bg-[var(--accent)] text-[var(--accent-ink)] font-bold">
                              <Shield className="size-3 mr-1" />
                              แอดมิน
                            </Badge>
                          ) : isOrganizer ? (
                            <Badge variant="secondary" size="sm" className="font-mono bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                              <Footprints className="size-3 mr-1" />
                              ผู้จัดงาน
                            </Badge>
                          ) : (
                            <Badge variant="outline" size="sm" className="font-mono text-[var(--ink-3)]">
                              <User className="size-3 mr-1" />
                              สมาชิก
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[var(--ink)]">
                          {u.registeredCount} งาน
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {u.organizedCount > 0 ? (
                            <span className="font-bold text-emerald-400">
                              {u.approvedOrganizedCount} อนุมัติ / {u.organizedCount} คำขอ
                            </span>
                          ) : (
                            <span className="text-[var(--ink-3)]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-3)]">
                          {new Date(u.createdAt).toLocaleDateString("th-TH")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--ink-2)] font-mono">
                  <span>TOTAL EVENT REQUESTS</span>
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="text-2xl font-bold font-display text-[var(--ink)]">
                  {requests.length}{" "}
                  <span className="text-xs font-mono text-[var(--ink-3)] font-normal">งาน</span>
                </div>
                <p className="text-[11px] text-[var(--ink-3)]">
                  {pendingRequests.length} รออนุมัติ • {requests.filter((r) => r.approvalStatus === "approved").length} อนุมัติแล้ว
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--ink-2)] font-mono">
                  <span>ACTIVE MEMBERS</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-display text-emerald-400">
                  {users.length}{" "}
                  <span className="text-xs font-mono text-emerald-400/70 font-normal">คน</span>
                </div>
                <p className="text-[11px] text-[var(--ink-3)]">
                  ระบบจัดระดับสิทธิ์: สมาชิก, ผู้จัดงาน, แอดมิน
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--ink-2)] font-mono">
                  <span>RFID CHECK-IN ENGINE</span>
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-display text-[var(--ink)]">
                  ACTIVE
                </div>
                <p className="text-[11px] text-[var(--ink-3)]">
                  พร้อมใช้งานระบบสแกน BIB & Chip Timing
                </p>
              </div>
            </div>

            {/* Admin Current Session Box */}
            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <h3 className="text-sm font-bold font-display text-[var(--ink)]">
                  ข้อมูลเซสชันผู้ดูแลระบบ (ADMIN SESSION)
                </h3>
                <Badge variant="default" size="sm" className="font-mono">
                  SUPERUSER
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--ink-3)] block">ADMIN NAME</span>
                  <span className="font-bold text-[var(--ink)]">{session.user.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--ink-3)] block">ADMIN EMAIL</span>
                  <span className="font-bold text-[var(--ink)]">{session.user.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
