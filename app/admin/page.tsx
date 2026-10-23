"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Calendar,
  Users,
  Timer,
  CheckCircle2,
  Clock,
  MapPin,
  Footprints,
  Shield,
  QrCode,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle,
  Database,
  Radio,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function AdminDashboardOverviewPage() {
  const { data: session } = useSession();

  const [stats, setStats] = React.useState<any>(null);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/requests"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data?.stats || data.stats);
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        throw new Error(data.error?.message || data.error || "ดำเนินการไม่สำเร็จ");
      }
      setActionMessage(data.data?.message || data.message || "บันทึกข้อมูลสำเร็จ");
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter(
    (r) => r.approvalStatus === "pending" || r.approvalStatus === "PENDING"
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-[var(--surface)] to-[var(--surface)] shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Shield className="size-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
                ศูนย์ควบคุม IT RUNWAY ADMIN
              </h1>
              <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 font-mono text-[9px] font-black">
                ONLINE
              </Badge>
            </div>
            <p className="text-xs text-[var(--ink-2)] mt-0.5">
              ยินดีต้อนรับคุณ {session?.user?.name || "แอดมิน"} • ควบคุมระบบงานวิ่ง สมาชิก และชิปจับเวลาทั่วจังหวัดนครปฐม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            className="h-9 text-xs font-mono border-[var(--line)] hover:border-amber-500/40 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1 text-amber-400" />
            <span>รีเฟรชข้อมูล</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm"
          >
            <Link href="/admin/events">
              <span>จัดการคำขอ ({pendingRequests.length})</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
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
            className="text-emerald-400 hover:text-emerald-200 text-xs cursor-pointer font-mono"
          >
            ปิด
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Approvals */}
        <Card className={cn(
          "border-[var(--line)] bg-[var(--surface)] transition-all",
          pendingRequests.length > 0 && "border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-[var(--surface)]"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-[var(--ink-2)]">คำขอรออนุมัติ</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-[var(--font-display)] text-[var(--ink)]">
              {stats?.events?.pending ?? pendingRequests.length}
            </div>
            <p className="text-[11px] text-[var(--ink-3)] flex items-center gap-1 font-mono">
              {pendingRequests.length > 0 ? (
                <span className="text-amber-400 font-bold">ต้องพิจารณาเปิดรับสมัคร</span>
              ) : (
                <span className="text-emerald-400">ไม่มีคำขอค้างในระบบ</span>
              )}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/admin/events"
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group"
            >
              <span>ตรวจสอบคำขอทั้งหมด</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Metric 2: Active Athletes */}
        <Card className="border-[var(--line)] bg-[var(--surface)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-[var(--ink-2)]">สมาชิกนักวิ่งทั้งหมด</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-[var(--font-display)] text-blue-400">
              {stats?.users?.total ?? 0}
            </div>
            <p className="text-[11px] text-[var(--ink-3)] font-mono">
              แอดมิน {stats?.users?.admins ?? 1} • ผู้จัดงาน {stats?.users?.organizers ?? 0} • สมาชิก {stats?.users?.members ?? 0}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/admin/users"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 group"
            >
              <span>จัดการรายชื่อและสิทธิ์</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Metric 3: Total Approved Races */}
        <Card className="border-[var(--line)] bg-[var(--surface)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-[var(--ink-2)]">งานวิ่งที่อนุมัติแล้ว</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-[var(--font-display)] text-emerald-400">
              {stats?.events?.approved ?? 0}
            </div>
            <p className="text-[11px] text-[var(--ink-3)] font-mono">
              จากทั้งหมด {stats?.events?.total ?? 0} งานในระบบ
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/admin/events?tab=approved"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group"
            >
              <span>ดูงานวิ่งที่เปิดรับสมัคร</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Metric 4: RFID Timing Mat Status */}
        <Card className="border-[var(--line)] bg-[var(--surface)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-[var(--ink-2)]">ระบบชิปจับเวลา RFID</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Radio className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-black font-[var(--font-display)] text-purple-400 flex items-center gap-2">
              <span>ONLINE</span>
              <span className="size-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-[var(--ink-3)] font-mono">
              พร้อมสำหรับ Start / Checkpoints / Finish
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/admin/timing"
              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group"
            >
              <span>ศูนย์ควบคุมสถานี RFID</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pending Requests Priority Queue (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-400" />
              <h2 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)]">
                คำขอจัดงานวิ่งรอการพิจารณา ({pendingRequests.length})
              </h2>
            </div>

            <Button asChild size="sm" variant="ghost" className="text-xs font-mono text-amber-400 hover:text-amber-300">
              <Link href="/admin/events">ดูทั้งหมด</Link>
            </Button>
          </div>

          {loading ? (
            <Card className="p-12 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-2">
              <Footprints className="size-8 animate-pulse text-amber-500" />
              <span>กำลังดึงรายการคำขอจัดงานล่าสุด...</span>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card className="p-8 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-2 border-[var(--line)]">
              <CheckCircle2 className="size-10 text-emerald-400/80 mb-1" />
              <p className="text-sm font-bold text-[var(--ink)] font-[var(--font-display)]">
                ไม่มีคำขอจัดงานวิ่งค้างอยู่
              </p>
              <p className="text-[11px] text-[var(--ink-2)] max-w-sm">
                ทุกคำขอได้รับการพิจารณาอนุมัติเรียบร้อยแล้ว เมื่อมีสมาชิกยื่นคำขอใหม่ ระบบจะแสดงแจ้งเตือนที่นี่ทันที
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <Card key={req.id} className="p-5 border-amber-500/30 bg-[var(--surface)] flex flex-col gap-4 shadow-sm hover:border-amber-500/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-[9px]">
                          รออนุมัติ
                        </Badge>
                        <h3 className="text-base font-bold text-[var(--ink)]">
                          {req.title}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-[var(--ink-3)] flex items-center gap-1.5">
                        <MapPin className="size-3 text-amber-400 shrink-0" />
                        <span>{req.location}</span>
                        <span>•</span>
                        <span>{new Date(req.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      <span className="px-2 py-1 rounded-md bg-[var(--surface-2)] text-[var(--ink)] font-bold">
                        {req.distance}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 font-bold">
                        ฿{req.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Organizer Details Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 border border-[var(--line)]">
                        <AvatarImage src={req.organizer?.image || undefined} />
                        <AvatarFallback className="text-[10px] font-mono">
                          {req.organizerName?.slice(0, 2) || "RN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--ink)]">{req.organizerName || req.organizer?.name}</span>
                        <span className="text-[10px] font-mono text-[var(--ink-3)]">{req.organizerContact || req.organizer?.email}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[var(--ink-3)] hidden sm:inline">
                      ยื่นเมื่อ: {new Date(req.createdAt).toLocaleDateString("th-TH")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[var(--line)]">
                    <Button
                      size="sm"
                      disabled={actionLoading === req.id}
                      onClick={() => handleRequestAction(req.id, "approve")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 cursor-pointer"
                    >
                      <Check className="size-4 mr-1 stroke-[3]" />
                      <span>อนุมัติงานวิ่ง (Approve)</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === req.id}
                      onClick={() => handleRequestAction(req.id, "reject")}
                      className="h-9 text-xs cursor-pointer"
                    >
                      <X className="size-4 mr-1" />
                      <span>ปฏิเสธ</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Tools & System Health (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Tools Navigation */}
          <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold font-[var(--font-display)] text-sm text-[var(--ink)]">
              <Activity className="size-4 text-amber-400" />
              <span>เครื่องมือด่วน (Quick Tools)</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/organizer/checkin"
                className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-xs font-semibold transition-all select-none"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="size-4" />
                  <span>เปิดแถบตรวจ BIB นักวิ่ง (Gate)</span>
                </div>
                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                href="/admin/events"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--ink)] text-xs font-semibold transition-all select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="size-4 text-amber-400" />
                  <span>จัดการและอนุมัติงานวิ่ง</span>
                </div>
                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--ink)] text-xs font-semibold transition-all select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 text-blue-400" />
                  <span>จัดการสมาชิกและบทบาท</span>
                </div>
                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                href="/admin/timing"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--ink)] text-xs font-semibold transition-all select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Timer className="size-4 text-purple-400" />
                  <span>มอนิเตอร์ชิปจับเวลา RFID</span>
                </div>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>

          {/* System Health Status */}
          <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold font-[var(--font-display)] text-sm text-[var(--ink)]">
                <Database className="size-4 text-emerald-400" />
                <span>สถานะเซิร์ฟเวอร์ & ฐานข้อมูล</span>
              </div>
              <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                HEALTHY
              </Badge>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[var(--ink-3)]">Database:</span>
                <span className="font-bold text-emerald-400">Neon PostgreSQL (Serverless)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[var(--ink-3)]">Auth Engine:</span>
                <span className="font-bold text-[var(--ink)]">Better Auth 1.7</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[var(--ink-3)]">RFID Station:</span>
                <span className="font-bold text-purple-400">ACTIVE • 4 Mats Ready</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                <span className="text-[var(--ink-3)]">Email Service:</span>
                <span className="font-bold text-[var(--ink)]">Resend API</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
