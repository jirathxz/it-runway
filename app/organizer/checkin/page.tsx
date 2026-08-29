"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Footprints,
  Calendar,
  MapPin,
  Shield,
  RotateCcw,
  Users,
  Activity,
  Check,
  X,
  Sparkles,
  Shirt,
  Flame,
  Clock,
  ArrowLeft,
  ChevronDown,
  Lock,
  Camera,
  Download,
  Truck,
  Radio,
} from "lucide-react";
import { QrScannerDialog } from "@/components/organizer/qr-scanner-dialog";
import { ShirtBreakdownDialog } from "@/components/organizer/shirt-breakdown-dialog";
import { TrackingManagerDialog } from "@/components/organizer/tracking-manager-dialog";
import { RfidTimingConsoleDialog } from "@/components/organizer/rfid-timing-console-dialog";

function OrganizerCheckInContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("eventId");
  const { data: session, isPending: authPending } = useSession();

  const [events, setEvents] = React.useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>(initialEventId || "");
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
    percent: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Scanner & Search State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scannedRunner, setScannedRunner] = React.useState<any | null>(null);
  const [checkinMessage, setCheckinMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [processing, setProcessing] = React.useState(false);

  // Table filter
  const [tableFilter, setTableFilter] = React.useState<"all" | "checked" | "pending">("all");
  const [tableSearch, setTableSearch] = React.useState("");

  // Organizer Tool Modals
  const [shirtModalOpen, setShirtModalOpen] = React.useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = React.useState(false);
  const [rfidModalOpen, setRfidModalOpen] = React.useState(false);

  // Export Complete Participants CSV with UTF-8 BOM
  const handleExportRunnersCSV = () => {
    const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
    const eventName = selectedEvent ? selectedEvent.title : "Running-Event";

    const headers = [
      "ลำดับ",
      "หมายเลข BIB",
      "ชื่อ-นามสกุล",
      "เพศ",
      "เบอร์โทรศัพท์",
      "อีเมล",
      "ระยะทาง",
      "ไซส์เสื้อ",
      "กลุ่มปล่อยตัว (Corral)",
      "การรับอุปกรณ์",
      "หมายเลขพัสดุ (Tracking)",
      "ผู้ติดต่อฉุกเฉิน",
      "เบอร์ติดต่อฉุกเฉิน",
      "รหัสชิป RFID",
      "สถานะเช็คอิน",
      "เวลาเช็คอิน",
      "วันที่สมัคร",
    ];

    const rows = participants.map((p, idx) => {
      return [
        idx + 1,
        `"${p.bibNumber || ""}"`,
        `"${p.userName || ""}"`,
        `"${p.gender || "-"}"`,
        `"${p.userPhone || "-"}"`,
        `"${p.userEmail || "-"}"`,
        `"${p.distance || ""}"`,
        `"${p.tshirtSize || ""}"`,
        `"${p.corral || "CORRAL A"}"`,
        `"${p.shippingStatus === "delivered" ? "จัดส่งไปรษณีย์" : "รับหน้างาน Expo"}"`,
        `"${p.trackingNumber || "-"}"`,
        `"${p.emergencyName || "-"}"`,
        `"${p.emergencyPhone || "-"}"`,
        `"${p.chipCode || ""}"`,
        `"${p.checkedIn === "yes" ? "เช็คอินแล้ว" : "ยังไม่เข้างาน"}"`,
        `"${p.checkedInAt ? new Date(p.checkedInAt).toLocaleString("th-TH") : "-"}"`,
        `"${p.registeredAt ? new Date(p.registeredAt).toLocaleString("th-TH") : "-"}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `it-runway-participants-${selectedEventId || "all"}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load participants and organized events
  const loadEventData = React.useCallback(async (eventId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = eventId
        ? `/api/organizer/participants?eventId=${eventId}`
        : "/api/organizer/participants";

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถโหลดข้อมูลงานวิ่งได้");
      }

      setEvents(data.accessibleEvents || []);
      if (data.event) {
        setSelectedEventId(data.event.id);
      }
      setParticipants(data.participants || []);
      setStats(data.stats || { total: 0, checkedIn: 0, pending: 0, percent: 0 });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      loadEventData(selectedEventId || undefined);
    }
  }, [session, selectedEventId, loadEventData]);

  // Handle Check-in Action
  const handleCheckin = async (runner: any, action: "checkin" | "uncheck" = "checkin") => {
    setProcessing(true);
    setCheckinMessage(null);

    try {
      const res = await fetch("/api/organizer/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: runner.id,
          eventId: selectedEventId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการเช็คอิน");
      }

      setCheckinMessage({
        type: "success",
        text: data.message,
      });

      // Update scanned runner state
      setScannedRunner((prev: any) =>
        prev && prev.id === runner.id
          ? {
              ...prev,
              checkedIn: action === "checkin" ? "yes" : "no",
              checkedInAt: action === "checkin" ? new Date().toISOString() : null,
            }
          : prev
      );

      // Refresh list
      loadEventData(selectedEventId);
    } catch (err: any) {
      setCheckinMessage({
        type: "error",
        text: err.message || "เช็คอินไม่สำเร็จ",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle QR Scan Detection
  const handleQrScan = (codeText: string) => {
    setSearchQuery(codeText);
    const q = codeText.trim().toLowerCase();
    const found = participants.find(
      (p) =>
        p.bibNumber.toLowerCase() === q ||
        p.chipCode.toLowerCase() === q ||
        p.id.toLowerCase() === q ||
        (p.userName && p.userName.toLowerCase().includes(q)) ||
        (p.userEmail && p.userEmail.toLowerCase().includes(q))
    );

    if (found) {
      setScannedRunner(found);
      setCheckinMessage(null);
    } else {
      setScannedRunner(null);
      setCheckinMessage({
        type: "error",
        text: `ไม่พบข้อมูลนักวิ่งจาก QR Code (${codeText}) ในงานนี้`,
      });
    }
  };

  // Search or Scan Runner
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = participants.find(
      (p) =>
        p.bibNumber.toLowerCase() === q ||
        p.chipCode.toLowerCase() === q ||
        (p.userName && p.userName.toLowerCase().includes(q)) ||
        (p.userEmail && p.userEmail.toLowerCase().includes(q))
    );

    if (found) {
      setScannedRunner(found);
      setCheckinMessage(null);
    } else {
      setScannedRunner(null);
      setCheckinMessage({
        type: "error",
        text: `ไม่พบข้อมูลนักวิ่งที่ตรงกับ "${searchQuery}" ในงานนี้`,
      });
    }
  };

  // Filtered Table Participants
  const filteredParticipants = React.useMemo(() => {
    return participants.filter((p) => {
      // Tab status filter
      if (tableFilter === "checked" && p.checkedIn !== "yes") return false;
      if (tableFilter === "pending" && p.checkedIn === "yes") return false;

      // Search keyword filter
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const matchBib = p.bibNumber.toLowerCase().includes(q);
        const matchChip = p.chipCode.toLowerCase().includes(q);
        const matchName = p.userName && p.userName.toLowerCase().includes(q);
        const matchDistance = p.distance.toLowerCase().includes(q);
        return matchBib || matchChip || matchName || matchDistance;
      }
      return true;
    });
  }, [participants, tableFilter, tableSearch]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Header & Event Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)] mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/organize"
                className="inline-flex items-center gap-1 text-xs font-mono text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>กลับสู่ศูนย์ผู้จัดงาน</span>
              </Link>
              <Badge variant="default" size="sm" className="font-mono">
                <QrCode className="size-3 mr-1" />
                RFID & BIB GATE
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-[var(--font-display)] flex items-center gap-2">
              <span>แถบตรวจ BIB และเช็คอินนักวิ่งเข้างาน</span>
            </h1>
          </div>

          {/* Event Picker Dropdown */}
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--ink-3)] shrink-0">เลือกงาน:</span>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="h-10 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 pr-8 text-xs font-bold text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none cursor-pointer appearance-none max-w-[280px]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.distance})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center max-w-lg mx-auto space-y-4">
            <AlertCircle className="size-12 text-red-400 mx-auto" />
            <h2 className="text-lg font-bold">ไม่สามารถเข้าถึงระบบตรวจ BIB ได้</h2>
            <p className="text-xs text-[var(--ink-2)]">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button asChild size="sm">
                <Link href="/organize">ขอจัดงานวิ่ง</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Organizer Tools Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10 font-bold">
                  ORGANIZER MANAGEMENT TOOLS
                </Badge>
                <span className="text-xs font-mono text-[var(--ink-2)] hidden sm:inline">
                  {participants.length} นักวิ่งในระบบ
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Shirt Size Breakdown */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShirtModalOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-[var(--surface-2)]"
                >
                  <Shirt className="size-3.5 text-[var(--accent)]" />
                  <span>สรุปยอดสั่งเสื้อ (Sizes)</span>
                </Button>

                {/* 2. Tracking Manager */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTrackingModalOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-[var(--surface-2)]"
                >
                  <Truck className="size-3.5 text-blue-400" />
                  <span>จัดการเลขพัสดุ (Tracking)</span>
                </Button>

                {/* 3. RFID Timing Console */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRfidModalOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  <Radio className="size-3.5 text-amber-400 animate-pulse" />
                  <span>ควบคุมพรม RFID (Timing Mat)</span>
                </Button>

                {/* 4. Export CSV */}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExportRunnersCSV}
                  disabled={participants.length === 0}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 shadow-sm"
                >
                  <Download className="size-3.5" />
                  <span>Export รายชื่อ (Excel/CSV)</span>
                </Button>
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)] mb-1">
                  <span>ยอดลงทะเบียนทั้งหมด</span>
                  <Users className="size-4 text-[var(--accent)]" />
                </div>
                <div className="text-2xl font-black font-[var(--font-display)] text-[var(--ink)]">
                  {stats.total}{" "}
                  <span className="text-xs font-mono text-[var(--ink-3)] font-normal">คน</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
                  <span>เช็คอินเข้างานแล้ว</span>
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-[var(--font-display)] text-emerald-400">
                  {stats.checkedIn}{" "}
                  <span className="text-xs font-mono text-emerald-400/70 font-normal">
                    ({stats.percent}%)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-1">
                  <span>ยังไม่เข้างาน</span>
                  <Clock className="size-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-[var(--font-display)] text-amber-400">
                  {stats.pending}{" "}
                  <span className="text-xs font-mono text-amber-400/70 font-normal">คน</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)] mb-1">
                  <span>ความคืบหน้าการเช็คอิน</span>
                  <Activity className="size-4 text-[var(--accent)]" />
                </div>
                <div className="space-y-1.5 mt-1">
                  <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-500"
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[var(--ink-2)]">
                    {stats.percent}% เรียบร้อย
                  </span>
                </div>
              </div>
            </div>

            {/* Main Scanner Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* Search & Scanner Input Column */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="size-5 text-[var(--accent)]" />
                      <h3 className="text-sm font-bold font-[var(--font-display)]">
                        ค้นหาหรือสแกนเลข BIB / RFID Chip
                      </h3>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setScannerOpen(true)}
                      className="h-8 px-3 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="size-3.5" />
                      <span>สแกน QR Code</span>
                    </Button>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--accent)]" />
                        <Input
                          type="text"
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="พิมพ์หรือสแกน เช่น NP-10K-0088 หรือ RFID..."
                          className="h-12 pl-10 pr-24 bg-[var(--surface-2)] font-mono text-sm uppercase"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 font-bold text-xs"
                        >
                          ตรวจ BIB
                        </Button>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setScannerOpen(true)}
                        className="h-12 px-4 font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Camera className="size-4" />
                        <span>สแกน QR</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)]">
                      <span>รองรับ: เลข BIB, RFID Chip, หรือชื่อนักวิ่ง</span>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setScannedRunner(null);
                            setCheckinMessage(null);
                          }}
                          className="hover:text-[var(--ink)] cursor-pointer"
                        >
                          ล้างค่า
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Feedback Message */}
                  {checkinMessage && (
                    <div
                      className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                        checkinMessage.type === "success"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/30 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {checkinMessage.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-red-400" />
                      )}
                      <span className="font-semibold">{checkinMessage.text}</span>
                    </div>
                  )}
                </div>

                {/* Quick Shortcuts */}
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm">
                  <span className="text-[11px] font-mono text-[var(--ink-3)] block mb-2">
                    ตัวอย่างหมายเลข BIB ในงานนี้:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {participants.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(p.bibNumber);
                          setScannedRunner(p);
                          setCheckinMessage(null);
                        }}
                        className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 font-mono text-xs text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                      >
                        {p.bibNumber} ({p.checkedIn === "yes" ? "เข้าแล้ว" : "ยังไม่เข้า"})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Runner Details & Check-In Action Column */}
              <div className="lg:col-span-6">
                {scannedRunner ? (
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xl space-y-5 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12 border-2 border-[var(--accent)]">
                          <AvatarImage src={scannedRunner.userImage || undefined} />
                          <AvatarFallback className="font-bold font-mono">
                            {scannedRunner.userName?.slice(0, 2) || "RN"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-base font-bold text-[var(--ink)]">
                            {scannedRunner.userName || "นักวิ่ง IT Runway"}
                          </h4>
                          <p className="text-xs font-mono text-[var(--ink-3)]">
                            {scannedRunner.userEmail || "runner@it-runway.com"}
                          </p>
                        </div>
                      </div>

                      {scannedRunner.checkedIn === "yes" ? (
                        <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="size-3.5 mr-1" />
                          เช็คอินเข้างานแล้ว
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Clock className="size-3.5 mr-1" />
                          รอเช็คอิน
                        </Badge>
                      )}
                    </div>

                    {/* Big BIB Card Display */}
                    <div className="rounded-xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface)] p-4 text-center space-y-2">
                      <span className="text-[10px] font-mono text-[var(--accent)] font-bold uppercase tracking-widest">
                        DIGITAL BIB RUNNER PASS
                      </span>
                      <div className="text-3xl sm:text-4xl font-black font-[var(--font-mono)] text-[var(--ink)] tracking-wider">
                        {scannedRunner.bibNumber}
                      </div>
                      <div className="flex items-center justify-center gap-3 text-xs font-mono text-[var(--ink-2)]">
                        <span>{scannedRunner.distance}</span>
                        <span>•</span>
                        <span className="text-[var(--accent)] font-bold">{scannedRunner.corral}</span>
                        <span>•</span>
                        <span>เสื้อไซส์ {scannedRunner.tshirtSize}</span>
                      </div>
                    </div>

                    {/* Meta Specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--ink-3)] block">RFID CHIP CODE</span>
                        <span className="font-bold text-[var(--ink)]">{scannedRunner.chipCode}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                        <span className="text-[10px] text-[var(--ink-3)] block">เวลาเช็คอิน</span>
                        <span className="font-bold text-[var(--ink)]">
                          {scannedRunner.checkedInAt
                            ? new Date(scannedRunner.checkedInAt).toLocaleTimeString("th-TH")
                            : "ยังไม่เช็คอิน"}
                        </span>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2">
                      {scannedRunner.checkedIn !== "yes" ? (
                        <Button
                          disabled={processing}
                          onClick={() => handleCheckin(scannedRunner, "checkin")}
                          className="w-full h-12 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                        >
                          <Check className="size-5 mr-2 stroke-[3]" />
                          <span>ยืนยันเช็คอินเข้างาน (Confirm Check-in)</span>
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          disabled={processing}
                          onClick={() => handleCheckin(scannedRunner, "uncheck")}
                          className="w-full h-11 text-xs font-semibold text-[var(--ink-2)] hover:text-red-400"
                        >
                          <RotateCcw className="size-3.5 mr-2" />
                          <span>ยกเลิกสถานะเช็คอิน (Undo)</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)]/50 p-8 flex flex-col items-center justify-center text-center text-xs text-[var(--ink-3)] space-y-3">
                    <QrCode className="size-12 text-[var(--ink-3)]/50 stroke-1" />
                    <p className="font-mono">พิมพ์หรือสแกนหมายเลข BIB เพื่อดูข้อมูลนักวิ่งและยืนยันการเข้างาน</p>
                  </div>
                )}
              </div>
            </div>

            {/* Participants Stream Table */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-bold font-[var(--font-display)]">
                    รายชื่อนักวิ่งทั้งหมด ({filteredParticipants.length} จาก {participants.length})
                  </h3>
                </div>

                {/* Filter Tabs & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setTableFilter("all")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        tableFilter === "all" ? "bg-[var(--surface)] text-[var(--ink)] font-bold" : "text-[var(--ink-3)]"
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilter("checked")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        tableFilter === "checked" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-[var(--ink-3)]"
                      }`}
                    >
                      เช็คอินแล้ว ({stats.checkedIn})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilter("pending")}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        tableFilter === "pending" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-[var(--ink-3)]"
                      }`}
                    >
                      ยังไม่เข้า ({stats.pending})
                    </button>
                  </div>

                  <Input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="กรองชื่อ, BIB..."
                    className="h-8 w-36 sm:w-44 text-xs bg-[var(--surface-2)] font-mono"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--line)] text-[11px] font-mono text-[var(--ink-3)] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">BIB Number</th>
                      <th className="py-2.5 px-3">นักวิ่ง</th>
                      <th className="py-2.5 px-3">ระยะทาง</th>
                      <th className="py-2.5 px-3">เสื้อ</th>
                      <th className="py-2.5 px-3">RFID Chip</th>
                      <th className="py-2.5 px-3 text-center">สถานะเข้างาน</th>
                      <th className="py-2.5 px-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[var(--ink-3)] font-mono">
                          ไม่พบรายชื่อที่ตรงกับตัวกรอง
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const isChecked = p.checkedIn === "yes";
                        return (
                          <tr key={p.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-[var(--ink)]">
                              {p.bibNumber}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-[var(--ink)]">{p.userName || "นักวิ่ง IT Runway"}</div>
                              <div className="text-[10px] text-[var(--ink-3)] font-mono">{p.userEmail}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[var(--ink-2)]">
                              {p.distance}
                            </td>
                            <td className="py-3 px-3 font-mono text-[var(--ink-2)]">
                              {p.tshirtSize}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-3)]">
                              {p.chipCode}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isChecked ? (
                                <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  เข้างานแล้ว
                                </Badge>
                              ) : (
                                <Badge variant="secondary" size="sm" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                  ยังไม่เข้า
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isChecked ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={processing}
                                  onClick={() => handleCheckin(p, "uncheck")}
                                  className="h-7 text-[11px] text-[var(--ink-3)] hover:text-red-400"
                                >
                                  ยกเลิก
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={processing}
                                  onClick={() => handleCheckin(p, "checkin")}
                                  className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                  <Check className="size-3 mr-1" />
                                  เช็คอิน
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* QR Scanner Camera Modal */}
        <QrScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={handleQrScan}
          participants={participants}
          eventName={events.find((e) => e.id === selectedEventId)?.title || "งานวิ่ง"}
        />

        {/* T-Shirt Size Breakdown Modal */}
        <ShirtBreakdownDialog
          open={shirtModalOpen}
          onOpenChange={setShirtModalOpen}
          eventTitle={events.find((e) => e.id === selectedEventId)?.title || "งานวิ่ง"}
          participants={participants}
        />

        {/* Tracking Manager Modal */}
        <TrackingManagerDialog
          open={trackingModalOpen}
          onOpenChange={setTrackingModalOpen}
          participants={participants}
          onTrackingUpdated={() => loadEventData(selectedEventId)}
        />

        {/* RFID Timing Console Modal */}
        <RfidTimingConsoleDialog
          open={rfidModalOpen}
          onOpenChange={setRfidModalOpen}
          eventId={selectedEventId}
          eventName={events.find((e) => e.id === selectedEventId)?.title || "งานวิ่ง"}
          participants={participants}
          onTimingUpdated={() => loadEventData(selectedEventId)}
        />
      </main>
    </div>
  );
}

export default function OrganizerCheckInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--base)] text-[var(--ink)] gap-3 font-mono text-xs">
          <Footprints className="size-8 animate-pulse text-[var(--accent)]" />
          <span>กำลังโหลดระบบตรวจ BIB...</span>
        </div>
      }
    >
      <OrganizerCheckInContent />
    </React.Suspense>
  );
}
