"use client";

import * as React from "react";
import {
  Users,
  Shield,
  Footprints,
  User,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  UserCheck,
  UserX,
  ShieldAlert,
  Loader2,
  Ticket,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export default function AdminUsersPage() {
  const { data: session } = useSession();

  const [users, setUsers] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "admin" | "organizer" | "member">("all");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (targetUserId: string, targetUserName: string, newRole: "admin" | "member") => {
    const roleName = newRole === "admin" ? "แอดมิน (Admin)" : "สมาชิกทั่วไป (Member)";
    const confirmMessage = newRole === "admin"
      ? `คุณต้องการมอบสิทธิ์ "${roleName}" ให้แก่ "${targetUserName}" หรือไม่? (ผู้ใช้จะเข้าถึงระบบ Admin Portal ได้ทันที)`
      : `คุณต้องการปรับสิทธิ์ "${targetUserName}" กลับเป็น "${roleName}" หรือไม่?`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoading(targetUserId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "ดำเนินการไม่สำเร็จ");
      }
      setActionMessage(data.data?.message || data.message || "ปรับสิทธิ์เรียบร้อยแล้ว");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.effectiveRole !== roleFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchRole = u.roleBadge?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              จัดการสมาชิกและกำหนดบทบาท (Users & Roles)
            </h1>
          </div>
          <p className="text-xs text-[var(--ink-2)] mt-1">
            ค้นหา ตรวจสอบประวัติการสมัครงานวิ่ง และกำหนดสิทธิ์ผู้ดูแลระบบ (Admin) หรือสมาชิก (Member)
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchUsers}
          className="h-9 text-xs font-mono self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="size-3.5 mr-1.5 text-blue-400" />
          <span>รีเฟรชรายชื่อ</span>
        </Button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-mono cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Role Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase">สมาชิกทั้งหมด</span>
          <span className="text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
            {stats?.totalUsers ?? users.length}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-amber-400/80 uppercase">ผู้ดูแลระบบ (Admin)</span>
          <span className="text-xl font-bold font-[var(--font-display)] text-amber-400">
            {stats?.adminsCount ?? 1}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-emerald-400/80 uppercase">ผู้จัดงาน (Organizer)</span>
          <span className="text-xl font-bold font-[var(--font-display)] text-emerald-400">
            {stats?.organizersCount ?? 0}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase">สมาชิกทั่วไป (Member)</span>
          <span className="text-xl font-bold font-[var(--font-display)] text-[var(--ink-2)]">
            {stats?.membersCount ?? 0}
          </span>
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              roleFilter === "all"
                ? "bg-[var(--surface-2)] text-[var(--ink)] font-bold"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            ทั้งหมด ({users.length})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              roleFilter === "admin"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <Shield className="size-3.5" />
            <span>แอดมิน ({stats?.adminsCount ?? 1})</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("organizer")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              roleFilter === "organizer"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <Footprints className="size-3.5" />
            <span>ผู้จัดงาน ({stats?.organizersCount ?? 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("member")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              roleFilter === "member"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <User className="size-3.5" />
            <span>สมาชิก ({stats?.membersCount ?? 0})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, อีเมล, บทบาท..."
            className="pl-9 h-9 text-xs bg-[var(--surface-2)] font-mono"
          />
        </div>
      </div>

      {/* Users Responsive Presentation: Table on Desktop, Cards on Mobile */}
      {loading ? (
        <Card className="p-16 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-3">
          <Footprints className="size-10 animate-pulse text-blue-400" />
          <span>กำลังโหลดข้อมูลสมาชิกจากฐานข้อมูล...</span>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-2">
          <Users className="size-10 text-[var(--ink-3)]/40 mb-1" />
          <p className="text-sm font-bold text-[var(--ink)] font-[var(--font-display)]">
            ไม่พบรายชื่อสมาชิกตามเงื่อนไข
          </p>
        </Card>
      ) : (
        <Card className="border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[11px] font-mono text-[var(--ink-3)] uppercase">
                <tr>
                  <th className="py-3 px-4">สมาชิก</th>
                  <th className="py-3 px-4">อีเมล</th>
                  <th className="py-3 px-4 text-center">สิทธิ์ปัจจุบัน</th>
                  <th className="py-3 px-4 text-center">สมัครวิ่งแล้ว</th>
                  <th className="py-3 px-4 text-center">งานที่ขอจัด</th>
                  <th className="py-3 px-4">วันที่สมัคร</th>
                  <th className="py-3 px-4 text-right">จัดการบทบาท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredUsers.map((u) => {
                  const isUserAdmin = u.effectiveRole === "admin";
                  const isOrganizer = u.effectiveRole === "organizer";
                  const isCurrentUser = u.id === session?.user?.id;

                  return (
                    <tr key={u.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 border border-[var(--line)]">
                            <AvatarImage src={u.image || undefined} />
                            <AvatarFallback className="font-mono text-xs">
                              {u.name?.slice(0, 2) || "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-mono text-amber-400 font-normal">
                                  (คุณ)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[var(--ink-2)]">
                        {u.email}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isUserAdmin ? (
                          <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 font-bold font-mono text-[9px]">
                            <Shield className="size-3 mr-1" />
                            ADMIN
                          </Badge>
                        ) : isOrganizer ? (
                          <Badge variant="secondary" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold font-mono text-[9px]">
                            <Footprints className="size-3 mr-1" />
                            ORGANIZER
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="font-mono text-[9px] text-[var(--ink-3)]">
                            <User className="size-3 mr-1" />
                            MEMBER
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--ink)]">
                        {u.registeredCount} งาน
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs">
                        {u.organizedCount > 0 ? (
                          <span className="text-emerald-400 font-bold">
                            {u.approvedOrganizedCount} อนุมัติ / {u.organizedCount} คำขอ
                          </span>
                        ) : (
                          <span className="text-[var(--ink-3)]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ink-3)]">
                        {new Date(u.createdAt).toLocaleDateString("th-TH")}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isCurrentUser ? (
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            บัญชีปัจจุบัน
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {isUserAdmin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === u.id}
                                onClick={() => handleUpdateRole(u.id, u.name, "member")}
                                className="h-7 px-2.5 text-[10px] font-mono border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                title="ลดสิทธิ์เป็นสมาชิกทั่วไป"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  "ถอนสิทธิ์แอดมิน"
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === u.id}
                                onClick={() => handleUpdateRole(u.id, u.name, "admin")}
                                className="h-7 px-2.5 text-[10px] font-mono border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
                                title="มอบสิทธิ์แอดมิน"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  "+ ตั้งเป็นแอดมิน"
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[var(--line)]">
            {filteredUsers.map((u) => {
              const isUserAdmin = u.effectiveRole === "admin";
              const isOrganizer = u.effectiveRole === "organizer";
              const isCurrentUser = u.id === session?.user?.id;

              return (
                <div key={u.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-9 border border-[var(--line)]">
                        <AvatarImage src={u.image || undefined} />
                        <AvatarFallback className="font-mono text-xs">
                          {u.name?.slice(0, 2) || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[var(--ink)]">
                          {u.name}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--ink-3)] truncate max-w-[170px]">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    {isUserAdmin ? (
                      <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 font-bold font-mono text-[9px]">
                        ADMIN
                      </Badge>
                    ) : isOrganizer ? (
                      <Badge variant="secondary" size="sm" className="bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[9px]">
                        ORGANIZER
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="font-mono text-[9px] text-[var(--ink-3)]">
                        MEMBER
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[var(--surface-2)] text-[11px] font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--ink-3)] block">สมัครวิ่ง:</span>
                      <span className="font-bold text-[var(--ink)]">{u.registeredCount} งาน</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--ink-3)] block">ขอจัดงาน:</span>
                      <span className="font-bold text-emerald-400">{u.organizedCount} งาน</span>
                    </div>
                  </div>

                  {!isCurrentUser && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {isUserAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === u.id}
                          onClick={() => handleUpdateRole(u.id, u.name, "member")}
                          className="h-8 text-xs font-mono border-rose-500/30 text-rose-400 w-full"
                        >
                          ถอนสิทธิ์แอดมิน
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={actionLoading === u.id}
                          onClick={() => handleUpdateRole(u.id, u.name, "admin")}
                          className="h-8 text-xs font-mono bg-amber-500 text-slate-950 font-bold w-full"
                        >
                          + มอบสิทธิ์ผู้ดูแลระบบ (Admin)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
