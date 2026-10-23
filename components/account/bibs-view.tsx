"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AccountNav } from "./account-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EventItem } from "@/components/events/event-card";
import { EventDialog } from "@/components/events/event-dialog";
import { CancellationDialog } from "./cancellation-dialog";
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  PackageCheck,
  Download,
  ChevronRight,
  Sparkles,
  Trophy,
  Activity,
  Footprints,
  Compass,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2,
  LogIn,
  Printer,
  Image as ImageIcon,
  RotateCcw,
  XCircle,
  ShieldAlert,
  UserCheck,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadBibImage, printBib } from "@/lib/bib-canvas";
import { BibTransferDialog } from "./bib-transfer-dialog";
import { CertificateDialog } from "@/components/results/certificate-dialog";
import { CertificateData } from "@/lib/certificate-canvas";

interface DigitalBib {
  id: string;
  eventId?: string;
  bibNumber: string;
  corral: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  distance: string;
  category: "upcoming" | "completed" | "cancelled";
  status?: string;
  image: string;
  chipCode: string;
  shippingStatus: "delivered" | "pickup" | "completed";
  trackingNumber?: string;
  pickupDate?: string;
  officialTime?: string;
  pace?: string;
  rank?: string;
  tshirtSize: string;
}

interface BibsViewProps {
  initialEvents?: EventItem[];
}

export function BibsView({ initialEvents = [] }: BibsViewProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [bibs, setBibs] = useState<DigitalBib[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBibForCancel, setSelectedBibForCancel] = useState<DigitalBib | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // BIB Transfer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedBibForTransfer, setSelectedBibForTransfer] = useState<DigitalBib | null>(null);

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);

  const handleOpenTransferDialog = (bib: DigitalBib) => {
    setSelectedBibForTransfer(bib);
    setTransferModalOpen(true);
  };

  const handleOpenCertificate = (bib: DigitalBib) => {
    setSelectedCertificate({
      id: bib.id,
      name: session?.user?.name || "นักวิ่ง IT Runway",
      bib: bib.bibNumber,
      club: "Nakhon Pathom Runner",
      category: "Road Racing",
      distance: bib.distance,
      chipTime: bib.officialTime || "00:54:12",
      gunTime: bib.officialTime ? "00:55:04" : "00:55:04",
      pace: bib.pace || "05:12",
      rank: bib.rank ? parseInt(bib.rank.replace(/[^0-9]/g, "")) || 42 : 42,
      gender: "ชาย (Male)",
      ageGroup: "30-39 ปี",
      eventTitle: bib.eventTitle,
      eventDate: bib.eventDate,
      location: bib.location,
    });
    setCertificateModalOpen(true);
  };

  const handleTransferSuccess = () => {
    // Reload bibs
    if (session?.user) {
      fetch("/api/user/bibs")
        .then((res) => res.json())
        .then((data) => setBibs(data.bibs || []));
    }
  };

  // Fetch real registered BIBs from database
  useEffect(() => {
    async function loadBibs() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/user/bibs");
        if (res.ok) {
          const data = await res.json();
          setBibs(data.bibs || []);
        }
      } catch (err) {
        console.error("Failed to load user bibs from database:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBibs();
  }, [session]);

  const filteredBibs = bibs.filter((bib) => {
    if (activeFilter === "upcoming") return bib.category === "upcoming";
    if (activeFilter === "completed") return bib.category === "completed";
    if (activeFilter === "cancelled") return bib.category === "cancelled";
    return true;
  });

  const upcomingCount = bibs.filter((b) => b.category === "upcoming").length;
  const completedCount = bibs.filter((b) => b.category === "completed").length;
  const cancelledCount = bibs.filter((b) => b.category === "cancelled").length;

  const athleteName = session?.user?.name || "นักวิ่ง IT Runway";

  const handleDownloadBib = async (bib: DigitalBib) => {
    try {
      await downloadBibImage(
        {
          id: bib.id,
          bibNumber: bib.bibNumber,
          corral: bib.corral,
          eventTitle: bib.eventTitle,
          eventDate: bib.eventDate,
          eventTime: bib.eventTime,
          location: bib.location,
          distance: bib.distance,
          chipCode: bib.chipCode,
          tshirtSize: bib.tshirtSize,
        },
        athleteName
      );
      setDownloadSuccess(bib.bibNumber);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error("Download BIB error:", err);
    }
  };

  const handlePrintBib = (bib: DigitalBib) => {
    printBib(
      {
        id: bib.id,
        bibNumber: bib.bibNumber,
        corral: bib.corral,
        eventTitle: bib.eventTitle,
        eventDate: bib.eventDate,
        eventTime: bib.eventTime,
        location: bib.location,
        distance: bib.distance,
        chipCode: bib.chipCode,
        tshirtSize: bib.tshirtSize,
      },
      athleteName
    );
  };

  const handleOpenEventDialog = (bib: DigitalBib) => {
    // Find matching event from initialEvents if available
    const matched = initialEvents.find(
      (e) => e.title.toLowerCase().trim() === bib.eventTitle.toLowerCase().trim()
    );

    if (matched) {
      setSelectedEventForModal(matched);
      setModalOpen(true);
    } else {
      setSelectedEventForModal({
        id: bib.id,
        title: bib.eventTitle,
        date: bib.eventDate,
        time: bib.eventTime,
        location: bib.location,
        distance: bib.distance,
        price: 350,
        image: bib.image,
        category: "road",
        status: "open",
        organizer: "ชมรมกีฬานครปฐม",
        highlights: ["RFID Chip Timing", "จุดบริการน้ำทุก 2 กม."],
      });
      setModalOpen(true);
    }
  };

  const handleOpenCancelDialog = (bib: DigitalBib) => {
    setSelectedBibForCancel(bib);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = (id: string, refundRef: string) => {
    setBibs((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, category: "cancelled", status: "cancelled" } : b
      )
    );
    setCancelSuccessMsg(
      `ยกเลิกการสมัครสำเร็จ! ระบบได้สร้างคำขอคืนเงินเลขที่ ${refundRef} เรียบร้อยแล้ว (จะดำเนินการโอนเงินคืนภายใน 1-3 วันทำการ)`
    );
    setTimeout(() => setCancelSuccessMsg(null), 8000);
  };

  if (sessionLoading || loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--accent)]" />
        <span className="text-xs font-mono text-[var(--ink-3)]">
          กำลังโหลดข้อมูลบัตรประจำตัวนักวิ่ง (BIB)...
        </span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-full max-w-lg mx-auto py-12">
        <Card className="p-8 text-center border-[var(--line)] bg-[var(--surface)] shadow-lg">
          <Ticket className="size-12 mx-auto text-[var(--accent)] mb-3" />
          <CardTitle className="text-xl mb-2">เข้าสู่ระบบเพื่อดู BIB ของคุณ</CardTitle>
          <CardDescription className="mb-6">
            กรุณาเข้าสู่ระบบเพื่อจัดการเบอร์วิ่ง บัตรประจำตัวนักวิ่งดิจิทัล (Digital BIB) และดาวน์โหลดรูปภาพ
          </CardDescription>
          <Button asChild className="w-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold cursor-pointer">
            <Link href="/auth/sign-in">
              <LogIn className="size-4 mr-2" />
              เข้าสู่ระบบ / สมัครสมาชิก
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Account Sub-navigation */}
      <AccountNav bibCount={bibs.filter((b) => b.category !== "cancelled").length} />

      {/* Header Overview Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 mb-8 shadow-[var(--shadow-far)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 mb-2">
              <Sparkles className="size-3" />
              <span>OFFICIAL RUNNER PASS</span>
            </div>
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
              บัตรประจำตัวนักวิ่งดิจิทัล (Digital BIB)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-2)] mt-1 max-w-xl font-[var(--font-text)]">
              เบอร์วิ่งทางการพร้อมรหัสชิปจับเวลา RFID สำหรับงานวิ่งในจังหวัดนครปฐม รองรับการดาวน์โหลดความละเอียดสูงและพิมพ์บัตร
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-center min-w-[90px]">
              <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase block">BIB ทั้งหมด</span>
              <span className="font-[var(--font-bib)] text-2xl sm:text-3xl font-black text-[var(--accent)]">
                {bibs.filter((b) => b.category !== "cancelled").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Stat 1: Upcoming */}
        <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-near)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--ink-3)] text-xs font-mono">
            <span>เร็วๆ นี้ (Upcoming)</span>
            <Calendar className="size-4 text-[var(--accent)]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-[var(--font-bib)] font-black text-[var(--ink)]">
              {upcomingCount} <span className="text-xs font-normal font-sans text-[var(--ink-3)]">งาน</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] mt-0.5">
              เตรียมพร้อมเข้าสู่จุดปล่อยตัว
            </p>
          </div>
        </Card>

        {/* Stat 2: Completed */}
        <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-near)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--ink-3)] text-xs font-mono">
            <span>เข้าเส้นชัยแล้ว (Finished)</span>
            <Trophy className="size-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-[var(--font-bib)] font-black text-amber-400">
              {completedCount} <span className="text-xs font-normal font-sans text-[var(--ink-3)]">เหรียญ</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] mt-0.5">
              บันทึกสถิติชิปเรียบร้อย
            </p>
          </div>
        </Card>

        {/* Stat 3: Cancelled */}
        <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-near)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--ink-3)] text-xs font-mono">
            <span>ยกเลิกแล้ว (Cancelled)</span>
            <XCircle className="size-4 text-red-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-[var(--font-bib)] font-black text-red-400">
              {cancelledCount} <span className="text-xs font-normal font-sans text-[var(--ink-3)]">รายการ</span>
            </div>
            <p className="text-[11px] text-[var(--ink-2)] mt-0.5">
              คืนเงิน / ยกเลิกสิทธิ์แล้ว
            </p>
          </div>
        </Card>

        {/* Stat 4: Chip Status */}
        <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-near)] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--ink-3)] text-xs font-mono">
            <span>สถานะ RFID Gate</span>
            <Activity className="size-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-[var(--font-display)] font-extrabold text-[var(--positive)]">
              READY <span className="text-xs font-normal text-[var(--ink-3)]">CHIP</span>
            </div>
            <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">
              พร้อมเข้าสู่ Timing Gate
            </p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Action Links */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface)] border border-[var(--line)] overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeFilter === "all"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            ทั้งหมด ({bibs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("upcoming")}
            className={cn(
              "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeFilter === "upcoming"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            เร็วๆ นี้ ({upcomingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("completed")}
            className={cn(
              "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeFilter === "completed"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            แข่งขันแล้ว ({completedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("cancelled")}
            className={cn(
              "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeFilter === "cancelled"
                ? "bg-red-500 text-white font-bold shadow"
                : "text-red-400 hover:text-red-300"
            )}
          >
            ยกเลิกแล้ว ({cancelledCount})
          </button>
        </div>

        {/* Find More Events Button */}
        <Link
          href="/events"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-bold text-[var(--ink)] transition-colors shadow-sm whitespace-nowrap"
        >
          <Compass className="size-3.5 text-[var(--accent)]" />
          <span>ค้นหางานวิ่งเพิ่มในนครปฐม</span>
        </Link>
      </div>

      {/* Cancellation Success Alert Message */}
      {cancelSuccessMsg && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-red-300">แจ้งยกเลิกและทำเรื่องขอคืนเงินสำเร็จ</span>
            <span>{cancelSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Download Alert Message */}
      {downloadSuccess && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>
            สร้างบัตร BIB ดิจิทัลหมายเลข <strong>#{downloadSuccess}</strong> พร้อมบันทึกลงเครื่องเรียบร้อยแล้ว
          </span>
        </div>
      )}

      {/* Digital BIB List Container */}
      <div className="space-y-6">
        {filteredBibs.map((bib) => {
          const isCancelled = bib.category === "cancelled";
          const isUpcoming = bib.category === "upcoming";
          const isCompleted = bib.category === "completed";

          return (
            <Card
              key={bib.id}
              className={cn(
                "overflow-hidden border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)] transition-all",
                isCancelled ? "opacity-75 grayscale-[30%] border-red-500/30" : "hover:border-[var(--ink-3)]"
              )}
            >
              {/* Top Race Banner Strip */}
              <div
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b text-xs font-mono",
                  isCancelled
                    ? "bg-red-950/20 border-red-500/20 text-red-400"
                    : "bg-[var(--surface-2)] border-[var(--line)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isCancelled
                        ? "bg-red-500"
                        : isCompleted
                        ? "bg-amber-400"
                        : "bg-[var(--accent)] animate-pulse"
                    )}
                  />
                  <span className="font-bold">
                    {isCancelled
                      ? "CANCELLED REGISTRATION"
                      : isCompleted
                      ? "FINISHED RACE"
                      : "UPCOMING RACE"}
                  </span>
                  <span className="text-[var(--ink-3)]">•</span>
                  <span className="text-[var(--ink-2)]">{bib.corral}</span>
                </div>

                {/* Race Kit Shipping / Cancellation Status Badge */}
                <div className="flex items-center gap-2">
                  {isCancelled ? (
                    <Badge variant="destructive" className="font-mono text-[10px] font-bold bg-red-600/20 border-red-500 text-red-300">
                      <XCircle className="size-3 mr-1 inline" />
                      ยกเลิกการสมัครแล้ว (คืนเงิน)
                    </Badge>
                  ) : bib.shippingStatus === "delivered" ? (
                    <Badge variant="success" className="font-mono text-[10px] font-bold">
                      <Truck className="size-3 mr-1 inline" />
                      จัดส่งพัสดุแล้ว ({bib.trackingNumber || "TH-TRACK"})
                    </Badge>
                  ) : bib.shippingStatus === "pickup" ? (
                    <Badge variant="outline" className="font-mono text-[10px] font-bold text-amber-400 border-amber-400/30 bg-amber-400/10">
                      <PackageCheck className="size-3 mr-1 inline" />
                      รับ Race Kit หน้างาน
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                      <CheckCircle2 className="size-3 mr-1 inline text-emerald-400" />
                      เสร็จสิ้นการแข่งขัน
                    </Badge>
                  )}
                </div>
              </div>

              {/* Main BIB Content */}
              <div className="p-4 sm:p-6 lg:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Part: Realistic Digital BIB Graphic (5 Cols) */}
                  <div className="lg:col-span-5 relative">
                    <div
                      className={cn(
                        "relative rounded-2xl border-2 bg-gradient-to-b from-white to-neutral-100 text-neutral-900 p-4 sm:p-5 shadow-xl flex flex-col justify-between select-none overflow-hidden",
                        isCancelled ? "border-red-500/50 opacity-60" : "border-[var(--ink)]/80"
                      )}
                    >
                      {/* Cancelled Watermark Diagonal Stamp */}
                      {isCancelled && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="rotate-[-25deg] px-6 py-2 border-4 border-red-600 bg-red-600/90 text-white font-black font-mono text-xl sm:text-2xl tracking-widest uppercase shadow-2xl rounded-lg">
                            CANCELLED
                          </div>
                        </div>
                      )}

                      {/* BIB Top Header */}
                      <div className="flex items-center justify-between border-b-2 border-neutral-300 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Footprints className="size-4 text-neutral-900 stroke-[2.5]" />
                          <span className="font-[var(--font-display)] text-xs font-black tracking-tighter">
                            IT RUNWAY
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">
                          {bib.distance.split("(")[0]}
                        </span>
                      </div>

                      {/* Giant BIB Number */}
                      <div className="my-4 sm:my-6 text-center">
                        <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-bold">
                          RACE NUMBER / BIB
                        </div>
                        <div className="font-[var(--font-display)] text-4xl sm:text-5xl font-black tracking-tight text-neutral-950">
                          {bib.bibNumber}
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded bg-neutral-900 text-white font-mono text-[10px] font-bold">
                          {bib.corral} • WAVE 1
                        </div>
                      </div>

                      {/* BIB Footer with Barcode & Timing RFID code */}
                      <div className="flex items-end justify-between pt-2 border-t-2 border-neutral-300">
                        <div className="text-left">
                          <div className="text-[9px] font-mono text-neutral-500">ATHLETE NAME</div>
                          <div className="font-bold text-xs text-neutral-900 truncate max-w-[130px]">
                            {athleteName}
                          </div>
                          <div className="font-mono text-[9px] text-neutral-500 mt-0.5">
                            CHIP: {bib.chipCode} • SIZE {bib.tshirtSize}
                          </div>
                        </div>

                        {/* Simulated Timing Barcode */}
                        <div className="flex flex-col items-end">
                          <div className="flex gap-0.5 h-6 items-end">
                            {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map((w, i) => (
                              <div
                                key={i}
                                className="bg-neutral-900"
                                style={{ width: `${w}px`, height: "100%" }}
                              />
                            ))}
                          </div>
                          <span className="text-[8px] font-mono text-neutral-500 mt-0.5">
                            TIMING GATE RFID
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Part: Event Details & Action Controls (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-[var(--ink)] leading-snug">
                        {bib.eventTitle}
                      </h3>

                      {/* Details List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5 text-xs font-[var(--font-text)] text-[var(--ink-2)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-[var(--accent)] shrink-0" />
                          <span>{bib.eventDate} ({bib.eventTime})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{bib.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Footprints className="size-4 text-indigo-400 shrink-0" />
                          <span>ระยะทาง: {bib.distance}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <QrCode className="size-4 text-amber-400 shrink-0" />
                          <span>ชิปจับเวลา: {bib.chipCode}</span>
                        </div>
                      </div>

                      {/* Cancelled Notice Box */}
                      {isCancelled && (
                        <div className="mt-3.5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-start gap-2.5">
                          <ShieldAlert className="size-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-bold text-red-200">รายการนี้ถูกยกเลิกแล้ว</span>
                            <span className="text-[11px] text-red-300/80">
                              ระบบได้ทำการยกเลิกหมายเลข BIB เดิมเรียบร้อยแล้ว (คุณสามารถลงทะเบียนเข้าร่วมงานนี้ใหม่อีกครั้งได้ตลอดเวลา)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Completed Race Timing Badges */}
                      {isCompleted && (
                        <div className="mt-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-[10px] font-mono text-[var(--ink-3)]">OFFICIAL TIME</div>
                            <div className="font-mono text-sm sm:text-base font-bold text-amber-400">
                              {bib.officialTime || "01:52:18"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-[var(--ink-3)]">AVG PACE</div>
                            <div className="font-mono text-sm sm:text-base font-bold text-[var(--ink)]">
                              {bib.pace || "05:19"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-[var(--ink-3)]">OVERALL RANK</div>
                            <div className="font-mono text-sm sm:text-base font-bold text-emerald-400 truncate">
                              {bib.rank?.split("/")[0] || "อันดับ 48"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upcoming Race Kit Notes */}
                      {isUpcoming && bib.pickupDate && (
                        <div className="mt-3.5 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink-2)] flex items-start gap-2.5">
                          <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[var(--ink)]">จุดรับ Race Kit:</span>{" "}
                            <span>{bib.pickupDate}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="bg-[var(--line)] my-2" />

                    {/* Actions Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEventDialog(bib)}
                          className="text-xs text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer"
                        >
                          <span>รายละเอียดงานวิ่ง</span>
                          <ChevronRight className="size-3.5 ml-1" />
                        </Button>

                        {/* Re-register Button for Cancelled BIBs */}
                        {isCancelled && (
                          <Button
                            asChild
                            size="sm"
                            className="bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 font-bold text-xs shadow-sm cursor-pointer"
                          >
                            <Link href={bib.eventId ? `/events/${bib.eventId}` : "/events"}>
                              <RotateCcw className="size-3.5 mr-1.5" />
                              <span>ลงทะเบียนใหม่อีกครั้ง</span>
                            </Link>
                          </Button>
                        )}

                        {/* Cancel Event Button (Only for upcoming events) */}
                        {isUpcoming && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTransferDialog(bib)}
                              className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/50 cursor-pointer"
                            >
                              <UserCheck className="size-3.5 mr-1.5" />
                              <span>โอนสิทธิ์ BIB</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCancelDialog(bib)}
                              className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 cursor-pointer"
                            >
                              <RotateCcw className="size-3.5 mr-1.5" />
                              <span>ขอยกเลิก / คืนเงิน</span>
                            </Button>
                          </>
                        )}

                        {/* e-Certificate Button for Completed Races */}
                        {isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCertificate(bib)}
                            className="text-xs text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 font-bold cursor-pointer"
                          >
                            <Award className="size-3.5 mr-1.5 text-amber-400" />
                            <span>ดู e-Certificate</span>
                          </Button>
                        )}
                      </div>

                      {!isCancelled && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownloadBib(bib)}
                            className="text-xs font-semibold hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] transition-colors cursor-pointer"
                          >
                            <Download className="size-3.5 mr-1.5" />
                            <span>ดาวน์โหลดรูป (PNG)</span>
                          </Button>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePrintBib(bib)}
                            className="text-xs font-bold bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 shadow-sm cursor-pointer"
                          >
                            <Printer className="size-3.5 mr-1.5" />
                            <span>พิมพ์บัตร BIB (Print)</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredBibs.length === 0 && (
          <Card className="p-12 text-center border-[var(--line)] bg-[var(--surface)]">
            <Ticket className="size-12 mx-auto text-[var(--ink-3)] mb-4" />
            <h4 className="font-bold text-lg text-[var(--ink)] mb-1">
              ไม่พบรายการ BIB ในหมวดนี้
            </h4>
            <p className="text-xs text-[var(--ink-2)] max-w-sm mx-auto mb-6">
              คุณยังไม่มีงานวิ่งในหมวดหมู่นี้ เลือกลงทะเบียนงานวิ่งใหม่ในจังหวัดนครปฐมเพื่อรับ BIB ดิจิทัล
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              <Compass className="size-4" />
              <span>ค้นหางานวิ่ง 2026</span>
            </Link>
          </Card>
        )}
      </div>

      {/* Event Details Quick Dialog Modal */}
      {selectedEventForModal && (
        <EventDialog
          event={selectedEventForModal}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}

      {/* Event Cancellation & Refund Dialog Modal */}
      {selectedBibForCancel && (
        <CancellationDialog
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          registration={selectedBibForCancel}
          onCancelSuccess={handleCancelSuccess}
        />
      )}

      {/* BIB Transfer Dialog Modal */}
      {selectedBibForTransfer && (
        <BibTransferDialog
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          bib={selectedBibForTransfer}
          onTransferSuccess={handleTransferSuccess}
        />
      )}

      {/* Certificate Dialog Modal */}
      {selectedCertificate && (
        <CertificateDialog
          open={certificateModalOpen}
          onOpenChange={setCertificateModalOpen}
          certificate={selectedCertificate}
        />
      )}
    </div>
  );
}
