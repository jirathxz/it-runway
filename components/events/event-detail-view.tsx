"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  SHIRT_SIZE_CHART,
  EventDetailData,
} from "@/lib/event-details-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Clock,
  Shirt,
  Award,
  Timer,
  ShieldCheck,
  ChevronRight,
  Share2,
  ExternalLink,
  CheckCircle2,
  Footprints,
  AlertCircle,
  Navigation,
  Trophy,
  Medal,
  Sparkles,
  Layers,
  HelpCircle,
  Car,
  HeartPulse,
  Droplet,
  ArrowLeft,
  Loader2,
  Ticket,
  Copy,
  Check,
} from "lucide-react";
import { PaymentDialog } from "@/components/payment/payment-dialog";
import { cn } from "@/lib/utils";

interface EventDetailViewProps {
  event: {
    id: string;
    title: string;
    location: string;
    date: string | Date;
    distance: string;
    price: number;
    slots?: number;
    remainingSlots?: number;
    registeredCount?: number;
    isSoldOut?: boolean;
    image?: string | null;
    status?: string | null;
  };
  detailData: EventDetailData;
}

export function EventDetailView({ event, detailData }: EventDetailViewProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [activeTab, setActiveTab] = React.useState<"overview" | "shirt" | "route" | "schedule" | "rules">("overview");
  const [selectedDistance, setSelectedDistance] = React.useState<string>(
    detailData.routes[0]?.distanceLabel || "10.5 KM"
  );
  const [selectedSize, setSelectedSize] = React.useState<string>("L");
  const [shippingMethod, setShippingMethod] = React.useState<"pickup" | "delivered">("pickup");
  const [copied, setCopied] = React.useState(false);

  // Payment & Registration Modal State
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [registeredBib, setRegisteredBib] = React.useState<string | null>(null);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);

  // Unit toggle for size chart
  const [sizeUnit, setSizeUnit] = React.useState<"inch" | "cm">("inch");

  const distances = event.distance.split("/").map((d) => d.trim());

  // Calculate pricing based on distance
  const getPriceForDistance = (dist: string) => {
    if (dist.includes("21")) return event.price + 200;
    if (dist.includes("10")) return event.price;
    return Math.max(350, event.price - 150);
  };

  const currentPrice = getPriceForDistance(selectedDistance);
  const totalPrice = shippingMethod === "delivered" ? currentPrice + 60 : currentPrice;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `สมัครงานวิ่ง ${event.title} ที่นครปฐม บน IT RUNWAY`,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegister = async () => {
    setRegisterError(null);

    if (!session?.user) {
      router.push(`/auth/sign-in?callbackURL=/events/${event.id}`);
      return;
    }

    // Open simulated payment checkout dialog
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (bibNumber: string) => {
    setRegisteredBib(bibNumber);
    setSuccessModalOpen(true);
  };

  const currentRoute = detailData.routes.find((r) => r.distanceLabel === selectedDistance) || detailData.routes[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>ย้อนกลับไปค้นหางานวิ่ง</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs text-[var(--ink)] font-medium transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[var(--positive)]" />
              <span className="text-[var(--positive)]">คัดลอกลิงก์แล้ว</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5 text-[var(--accent)]" />
              <span>แชร์งานวิ่งนี้</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)]">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image || "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940"}
            alt={event.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/60 to-black/30" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              size="default"
              className="bg-black/80 border border-white/20 text-white font-bold backdrop-blur-md px-3 py-1"
            >
              <span className="size-2 rounded-full bg-[var(--positive)] animate-pulse mr-1.5" />
              เปิดรับสมัคร
            </Badge>
            <Badge
              variant="surface"
              size="default"
              className="bg-[var(--base)]/90 border border-[var(--line)] text-[var(--accent)] font-bold backdrop-blur-md px-3 py-1 font-[var(--font-mono)]"
            >
              {event.distance}
            </Badge>
            <Badge
              variant="outline"
              size="default"
              className="bg-black/60 border-amber-500/40 text-amber-300 font-bold backdrop-blur-md px-3 py-1 text-[11px]"
            >
              <Timer className="size-3 mr-1" />
              RFID TIMING CERTIFIED
            </Badge>
          </div>

          {/* Bottom Title Info */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-[var(--font-display)] text-[var(--ink)] tracking-tight drop-shadow-md">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--ink-2)] font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                <Calendar className="size-4 text-[var(--accent)]" />
                {detailData.dateFormatted}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-[var(--ink-3)]" />
                ปล่อยตัว {detailData.startFormattedTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-[var(--ink-3)]" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Sticky Register Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Tabs & Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "overview"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <Sparkles className="size-3.5" />
              <span>ภาพรวม & ไฮไลท์</span>
            </button>

            <button
              onClick={() => setActiveTab("shirt")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "shirt"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <Shirt className="size-3.5" />
              <span>เสื้อวิ่ง & เหรียญรางวัล</span>
            </button>

            <button
              onClick={() => setActiveTab("route")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "route"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <Navigation className="size-3.5" />
              <span>แผนที่เส้นทาง & จุดบริการ</span>
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "schedule"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <Clock className="size-3.5" />
              <span>ตารางเวลา</span>
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "rules"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-sm"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <ShieldCheck className="size-3.5" />
              <span>รางวัล & กติกา</span>
            </button>
          </div>

          {/* TAB CONTENT: 1. Overview */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Footprints className="size-4 text-[var(--accent)]" />
                  <span>เกี่ยวกับงานวิ่งนี้</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
                  {detailData.description}
                </p>
                <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-[var(--ink-3)] font-mono">ผู้จัดงานอย่างเป็นทางการ:</span>
                  <span className="font-semibold text-[var(--ink)]">{detailData.organizer}</span>
                </div>
              </Card>

              {/* Race Entitlements */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Award className="size-4 text-[var(--accent)]" />
                  <span>สิ่งที่นักวิ่งจะได้รับ (Race Entitlements)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                    <div className="size-8 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
                      <Shirt className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--ink)]">เสื้อวิ่ง Official Event Jersey</span>
                      <span className="text-[11px] text-[var(--ink-3)]">ผ้า Micro Poly Cool-Tech สวมใส่สบาย ระบายเหงื่อ</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                    <div className="size-8 rounded-lg bg-[var(--positive)]/15 flex items-center justify-center text-[var(--positive)] shrink-0 mt-0.5">
                      <Timer className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--ink)]">เบอร์วิ่ง BIB พร้อมชิป RFID</span>
                      <span className="text-[11px] text-[var(--ink-3)]">บันทึกเวลา Gun Time และ Chip Time มาตรฐานสากล</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                    <div className="size-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Medal className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--ink)]">เหรียญรางวัล Finisher Medal</span>
                      <span className="text-[11px] text-[var(--ink-3)]">หล่อโลหะ Zinc Alloy สลักลายสามมิติ (เมื่อเข้าเส้นชัย)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                    <div className="size-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <HeartPulse className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--ink)]">ประกันอุบัติเหตุ & อาหารเครื่องดื่ม</span>
                      <span className="text-[11px] text-[var(--ink-3)]">คุ้มครองตลอดการแข่งขัน พร้อมซุ้มอาหารเครื่องดื่มนครปฐม</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Distance Categories Overview */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Layers className="size-4 text-[var(--accent)]" />
                  <span>ประเภทระยะทางการแข่งขัน</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {detailData.routes.map((rt) => (
                    <div
                      key={rt.distanceLabel}
                      className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-[var(--font-bib)] text-xl font-bold text-[var(--accent)]">
                            {rt.distanceLabel}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--ink-3)]">
                            {getPriceForDistance(rt.distanceLabel)} บาท
                          </span>
                        </div>
                        <span className="text-xs text-[var(--ink-2)] block mt-1">
                          {rt.description}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[var(--ink-3)] border-t border-[var(--line)] pt-2 flex flex-col gap-1">
                        <span>Cut-off: {rt.cutoffHours}</span>
                        <span>จุดน้ำ: {rt.waterStations} จุด</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB CONTENT: 2. Shirt & Medals */}
          {activeTab === "shirt" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Shirt Mockup Display */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Shirt className="size-4 text-[var(--accent)]" />
                      <span>เสื้อวิ่งที่ระลึก (Official Running Jersey)</span>
                    </h3>
                    <p className="text-xs text-[var(--ink-3)] mt-0.5">
                      โทนสีประจำงาน: <span className="font-semibold text-[var(--ink-2)]">{detailData.shirtColor}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 w-fit">
                    Cool-Tech Micro Poly 100%
                  </Badge>
                </div>

                {/* Visual Shirt Mockup Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front View */}
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-[var(--ink-3)] bg-black/40 px-2 py-0.5 rounded">
                      ด้านหน้า (FRONT)
                    </div>
                    {/* Stylized SVG Shirt Graphic */}
                    <div className="size-36 flex items-center justify-center relative">
                      <svg className="size-32 text-[var(--accent)] drop-shadow-lg transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-black font-black text-[9px] pointer-events-none">
                        <span className="font-mono tracking-widest uppercase">IT RUNWAY</span>
                        <span className="text-[8px] font-normal">{event.distance}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[var(--ink)]">ลายกราฟิก Sublimation หน้าอก</span>
                  </div>

                  {/* Back View */}
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
                    <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-[var(--ink-3)] bg-black/40 px-2 py-0.5 rounded">
                      ด้านหลัง (BACK)
                    </div>
                    {/* Stylized SVG Shirt Graphic */}
                    <div className="size-36 flex items-center justify-center relative">
                      <svg className="size-32 text-zinc-800 drop-shadow-lg transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--accent)] font-mono text-[9px] pointer-events-none">
                        <span className="text-[8px] tracking-wider">NAKHON PATHOM</span>
                        <span className="text-[12px] font-black font-[var(--font-bib)]">2026</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[var(--ink)]">แถบสะท้อนแสงนิรภัย Reflective Band</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--ink-2)] leading-relaxed bg-[var(--surface-2)] p-3 rounded-lg border border-[var(--line)]">
                  {detailData.shirtDescription}
                </p>
              </Card>

              {/* Size Chart Table */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <Layers className="size-4 text-[var(--accent)]" />
                    <span>ตารางไซส์เสื้อ (Size Chart)</span>
                  </h3>
                  <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-lg border border-[var(--line)] text-xs font-mono">
                    <button
                      onClick={() => setSizeUnit("inch")}
                      className={cn(
                        "px-2.5 py-1 rounded transition-all cursor-pointer",
                        sizeUnit === "inch" ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold" : "text-[var(--ink-3)]"
                      )}
                    >
                      นิ้ว (Inches)
                    </button>
                    <button
                      onClick={() => setSizeUnit("cm")}
                      className={cn(
                        "px-2.5 py-1 rounded transition-all cursor-pointer",
                        sizeUnit === "cm" ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold" : "text-[var(--ink-3)]"
                      )}
                    >
                      ซม. (CM)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-[var(--ink-3)] font-mono">
                        <th className="py-2.5 px-3 font-semibold">ไซส์ (Size)</th>
                        <th className="py-2.5 px-3 font-semibold">รอบอก ({sizeUnit === "inch" ? "นิ้ว" : "ซม."})</th>
                        <th className="py-2.5 px-3 font-semibold">ความยาว ({sizeUnit === "inch" ? "นิ้ว" : "ซม."})</th>
                        <th className="py-2.5 px-3 font-semibold">คำแนะนำรูปร่าง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)] font-mono">
                      {SHIRT_SIZE_CHART.map((sz) => {
                        const isSelected = selectedSize === sz.size;
                        return (
                          <tr
                            key={sz.size}
                            onClick={() => setSelectedSize(sz.size)}
                            className={cn(
                              "hover:bg-[var(--surface-2)] transition-colors cursor-pointer",
                              isSelected && "bg-[var(--accent)]/10 font-bold"
                            )}
                          >
                            <td className="py-2.5 px-3 font-bold text-[var(--ink)] flex items-center gap-2">
                              <span>{sz.size}</span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] font-sans font-bold">
                                  <Check className="size-3" />
                                  <span>เลือกอยู่</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[var(--ink-2)]">
                              {sizeUnit === "inch" ? `${sz.chestInch}"` : `${sz.chestCm} cm`}
                            </td>
                            <td className="py-2.5 px-3 text-[var(--ink-2)]">
                              {sizeUnit === "inch" ? `${sz.lengthInch}"` : `${sz.lengthCm} cm`}
                            </td>
                            <td className="py-2.5 px-3 text-[var(--ink-3)] font-sans">
                              {sz.recommended}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Finisher Medal Preview */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Medal className="size-4 text-amber-400" />
                  <span>เหรียญรางวัลผู้พิชิต (Finisher Medal)</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                  <div className="size-24 rounded-full border-2 border-amber-500/40 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center text-black shadow-lg shrink-0">
                    <Trophy className="size-10 text-black drop-shadow" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-center sm:text-left">
                    <span className="text-sm font-bold text-[var(--ink)]">เหรียญเกียรติยศ Finisher Medal นครปฐม</span>
                    <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                      {detailData.medalDescription}
                    </p>
                    <span className="text-[10px] font-mono text-[var(--accent)]">
                      * มอบให้แก่นักวิ่งทุกท่านที่เข้าเส้นชัยภายในเวลา Cut-off ที่กำหนด
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB CONTENT: 3. Route & Elevation */}
          {activeTab === "route" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Distance Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[var(--ink-3)] mr-2 font-mono">เลือกระยะทางเพื่อดูแผนที่:</span>
                {detailData.routes.map((rt) => (
                  <button
                    key={rt.distanceLabel}
                    onClick={() => setSelectedDistance(rt.distanceLabel)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer",
                      selectedDistance === rt.distanceLabel
                        ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] shadow-sm"
                        : "bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                    )}
                  >
                    {rt.distanceLabel}
                  </button>
                ))}
              </div>

              {/* Route Map Graphic */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Navigation className="size-4 text-[var(--accent)]" />
                      <span>แผนผังเส้นทางวิ่งระยะ {selectedDistance}</span>
                    </h3>
                    <p className="text-xs text-[var(--ink-3)] mt-0.5">
                      ผิวถนน: <span className="text-[var(--ink-2)] font-medium">{currentRoute?.surface}</span>
                    </p>
                  </div>

                  <a
                    href={detailData.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-colors"
                  >
                    <MapPin className="size-3.5" />
                    <span>เปิด Google Maps</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* SVG Route Diagram */}
                <div className="relative h-64 sm:h-72 w-full rounded-xl border border-[var(--line)] bg-[var(--base)] p-4 flex flex-col justify-between overflow-hidden">
                  {/* Grid Lines Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

                  {/* Route Track SVG */}
                  <svg className="size-full absolute inset-0 text-[var(--accent)] pointer-events-none p-6" viewBox="0 0 600 300" fill="none">
                    <path
                      d="M 50 220 C 120 180, 160 80, 240 100 C 320 120, 360 240, 440 220 C 500 200, 540 120, 550 80"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="12 4"
                      className="opacity-80"
                    />
                    {/* Start Marker */}
                    <circle cx="50" cy="220" r="8" fill="#10B981" />
                    <text x="40" y="250" fill="#10B981" fontSize="12" fontWeight="bold" fontFamily="monospace">START / FINISH</text>

                    {/* Water Stations */}
                    <circle cx="200" cy="95" r="6" fill="#38BDF8" />
                    <text x="180" y="80" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="monospace">WS 1 (2.5K)</text>

                    <circle cx="340" cy="180" r="6" fill="#38BDF8" />
                    <text x="320" y="165" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="monospace">WS 2 (5K)</text>

                    {/* U-Turn Marker */}
                    <circle cx="550" cy="80" r="7" fill="#F59E0B" />
                    <text x="490" y="70" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="monospace">U-TURN POINT</text>
                  </svg>

                  {/* Map Legend Footer */}
                  <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 text-[11px] font-mono bg-[var(--surface)]/90 backdrop-blur-md p-2.5 rounded-lg border border-[var(--line)] w-fit">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[var(--ink-2)]">จุดปล่อยตัว/เส้นชัย</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-sky-400" />
                      <span className="text-[var(--ink-2)]">จุดน้ำดื่ม & เกลือแร่ (WS)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <span className="text-[var(--ink-2)]">จุดกลับตัว</span>
                    </div>
                  </div>
                </div>

                {/* Route Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">เวลาตัดตัว (Cut-off)</span>
                    <span className="text-xs font-bold text-[var(--ink)]">{currentRoute?.cutoffHours}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">ระดับความสูงสะสม</span>
                    <span className="text-xs font-bold text-[var(--accent)]">{currentRoute?.elevationGain}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">จุดบริการน้ำดื่ม</span>
                    <span className="text-xs font-bold text-[var(--ink)]">{currentRoute?.waterStations} จุด (ทุก 2 กม.)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">จุดปฐมพยาบาล</span>
                    <span className="text-xs font-bold text-[var(--ink)]">{currentRoute?.medicalPoints} จุด + รถพยาบาล</span>
                  </div>
                </div>
              </Card>

              {/* Parking & Transportation Info */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Car className="size-4 text-[var(--accent)]" />
                  <span>การเดินทางและจุดจอดรถ (Parking & Transport)</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {detailData.parkingInfo.map((p, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--ink-2)]">
                      <CheckCircle2 className="size-4 text-[var(--positive)] shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB CONTENT: 4. Schedule & Timetable */}
          {activeTab === "schedule" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Race Day Timetable */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <Clock className="size-4 text-[var(--accent)]" />
                    <span>กำหนดการวันแข่งขัน (Race Day Schedule)</span>
                  </h3>
                  <Badge variant="surface" className="text-[10px] font-mono text-[var(--accent)]">
                    {detailData.dateFormatted}
                  </Badge>
                </div>

                <div className="relative border-l-2 border-[var(--line)] ml-3 pl-5 flex flex-col gap-5">
                  {detailData.raceDaySchedule.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col gap-1">
                      {/* Timeline Dot */}
                      <span
                        className={cn(
                          "absolute -left-[27px] top-1 size-3 rounded-full border-2 border-[var(--surface)]",
                          item.isHighlight ? "bg-[var(--accent)] ring-4 ring-[var(--accent)]/20" : "bg-[var(--ink-3)]"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--accent)]">{item.time}</span>
                        {item.isHighlight && (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                            ไฮไลท์
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[var(--ink)]">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Expo Day Timetable */}
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Ticket className="size-4 text-[var(--positive)]" />
                  <span>กำหนดการวันรับเบอร์วิ่งและเสื้อ (Expo & Race Pack Collection)</span>
                </h3>
                <div className="relative border-l-2 border-[var(--line)] ml-3 pl-5 flex flex-col gap-4">
                  {detailData.expoSchedule.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col gap-1">
                      <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-[var(--ink-3)] border-2 border-[var(--surface)]" />
                      <span className="font-mono text-xs font-bold text-[var(--ink-2)]">{item.time}</span>
                      <span className="text-xs text-[var(--ink-2)]">{item.activity}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[11px] text-[var(--ink-3)] font-mono">
                  * หลักฐานที่ต้องใช้ในการรับ Race Pack: บัตรประชาชน / ใบขับขี่ หรือ หน้าบัตร Digital BIB จากเว็บไซต์ IT Runway
                </div>
              </Card>
            </div>
          )}

          {/* TAB CONTENT: 5. Rules & Awards */}
          {activeTab === "rules" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Trophy className="size-4 text-amber-400" />
                  <span>รางวัลและการมอบถ้วยเกียรติยศ (Awards & Prizes)</span>
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-2">
                    <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Trophy className="size-3.5 text-amber-400 shrink-0" />
                      <span>ถ้วยรางวัล Overall (อันดับที่ 1-3 ชาย และ หญิง)</span>
                    </span>
                    <span className="text-xs text-[var(--ink-2)]">มอบถ้วยรางวัลเกียรติยศประจำจังหวัดนครปฐม ตัดสินด้วยเวลา Gun Time อย่างเป็นทางการ</span>
                  </div>
                  <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-2">
                    <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Medal className="size-3.5 text-amber-400 shrink-0" />
                      <span>ถ้วยรางวัลตามกลุ่มอายุ (Age Group Categories)</span>
                    </span>
                    <span className="text-xs text-[var(--ink-2)]">อันดับ 1-3 ในแต่ละกลุ่มอายุ (18-29, 30-39, 40-49, 50-59, 60 ปีขึ้นไป)</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[var(--positive)]" />
                  <span>กฎระเบียบและเงื่อนไขการแข่งขัน (Rules & Regulations)</span>
                </h3>
                <div className="flex flex-col gap-2.5">
                  {detailData.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--ink-2)] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--accent)] shrink-0">{idx + 1}.</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Registration Box */}
        <div className="flex flex-col gap-6">
          <Card className="sticky top-20 p-6 border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)] flex flex-col gap-5">
            {/* Price Header */}
            <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--ink-3)] block">ค่าสมัครเข้าร่วม</span>
                <span className="font-[var(--font-bib)] text-3xl font-black text-[var(--accent)] tabular-nums">
                  {totalPrice}
                  <span className="text-xs font-normal font-sans text-[var(--ink-3)] ml-1">บาท</span>
                </span>
              </div>
              {event.isSoldOut || (event.remainingSlots !== undefined && event.remainingSlots <= 0) ? (
                <Badge variant="surface" className="text-[10px] font-bold text-red-500 bg-red-500/10 border-red-500/30">
                  เต็มแล้ว (Sold Out)
                </Badge>
              ) : (
                <Badge variant="surface" className="text-[10px] font-bold text-[var(--positive)] bg-[var(--positive)]/10 border-[var(--positive)]/30">
                  เปิดรับสมัคร
                </Badge>
              )}
            </div>

            {/* Quota & Capacity Progress */}
            {event.slots && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--ink-3)]">โควตารับสมัคร:</span>
                  <span className="font-bold text-[var(--ink)]">
                    {event.remainingSlots !== undefined
                      ? `เหลือ ${event.remainingSlots} จาก ${event.slots} ที่`
                      : `จำกัด ${event.slots} ที่`}
                  </span>
                </div>
                <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      event.isSoldOut || (event.remainingSlots !== undefined && event.remainingSlots <= 0)
                        ? "bg-red-500"
                        : "bg-[var(--accent)]"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          5,
                          (((event.slots - (event.remainingSlots ?? 0)) / event.slots) * 100)
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {registerError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Step 1: Distance Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold font-mono text-[var(--ink)] flex items-center justify-between">
                <span>1. เลือกระยะทางแข่งขัน:</span>
                <span className="text-[10px] text-[var(--ink-3)]">{selectedDistance}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {distances.map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setSelectedDistance(dist)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border flex flex-col items-center gap-0.5 cursor-pointer",
                      selectedDistance === dist
                        ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] shadow-sm"
                        : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                    )}
                  >
                    <span>{dist}</span>
                    <span className="text-[9px] opacity-80">{getPriceForDistance(dist)}฿</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Shirt Size Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono text-[var(--ink)]">
                  2. เลือกไซส์เสื้อวิ่ง:
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab("shirt")}
                  className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="size-3" />
                  <span>ดูตารางไซส์</span>
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {SHIRT_SIZE_CHART.map((sz) => (
                  <button
                    key={sz.size}
                    type="button"
                    onClick={() => setSelectedSize(sz.size)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold font-mono transition-all border cursor-pointer",
                      selectedSize === sz.size
                        ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]"
                        : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                    )}
                  >
                    {sz.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Delivery / Pickup Method */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold font-mono text-[var(--ink)]">
                3. การรับเบอร์วิ่ง (BIB) & เสื้อ:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShippingMethod("pickup")}
                  className={cn(
                    "p-2.5 rounded-xl text-left text-xs transition-all border flex flex-col gap-0.5 cursor-pointer",
                    shippingMethod === "pickup"
                      ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--ink)]"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)]"
                  )}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    <Ticket className="size-3.5 text-[var(--accent)]" />
                    รับหน้างาน Expo
                  </span>
                  <span className="text-[10px] text-[var(--ink-3)]">ฟรี ไม่มีค่าใช้จ่าย</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("delivered")}
                  className={cn(
                    "p-2.5 rounded-xl text-left text-xs transition-all border flex flex-col gap-0.5 cursor-pointer",
                    shippingMethod === "delivered"
                      ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--ink)]"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)]"
                  )}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    <Car className="size-3.5 text-[var(--accent)]" />
                    จัดส่งไปรษณีย์
                  </span>
                  <span className="text-[10px] text-[var(--ink-3)]">+60 บาท จัดส่งถึงบ้าน</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="flex flex-col gap-1 text-xs font-mono text-[var(--ink-3)]">
              <div className="flex justify-between">
                <span>ค่าสมัครระยะ {selectedDistance}:</span>
                <span className="text-[var(--ink)] font-semibold">{currentPrice} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ไซส์เสื้อที่เลือก:</span>
                <span className="text-[var(--ink)] font-semibold">{selectedSize}</span>
              </div>
              <div className="flex justify-between">
                <span>การรับอุปกรณ์:</span>
                <span className="text-[var(--ink)] font-semibold">{shippingMethod === "delivered" ? "ไปรษณีย์ (+60฿)" : "รับหน้างาน (ฟรี)"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--ink)] border-t border-[var(--line)] pt-2 mt-1">
                <span>ยอดรวมสุทธิ:</span>
                <span className="text-[var(--accent)]">{totalPrice} บาท</span>
              </div>
            </div>

            {/* Registration CTA Button */}
            <Button
              size="lg"
              onClick={handleRegister}
              disabled={isRegistering || Boolean(event.isSoldOut || (event.remainingSlots !== undefined && event.remainingSlots <= 0))}
              className={cn(
                "w-full h-12 text-sm font-bold shadow-[var(--shadow-far)] cursor-pointer",
                (event.isSoldOut || (event.remainingSlots !== undefined && event.remainingSlots <= 0)) &&
                  "bg-zinc-700/80 text-zinc-300 hover:bg-zinc-700 cursor-not-allowed border border-zinc-600/50"
              )}
            >
              <CheckCircle2 className="size-4 mr-2" />
              <span>
                {event.isSoldOut || (event.remainingSlots !== undefined && event.remainingSlots <= 0)
                  ? "ขออภัย รับสมัครเต็มจำนวนแล้ว (Sold Out)"
                  : "ดำเนินการชำระเงินและสมัครทันที"}
              </span>
              <ChevronRight className="size-4 stroke-[3]" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[var(--ink-3)]">
              <ShieldCheck className="size-3.5 text-[var(--positive)]" />
              <span>ชิปจับเวลา RFID บันทึกสถิติระบบ IT Runway</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Simulated Payment Checkout Gateway Dialog */}
      <PaymentDialog
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        event={event}
        distance={selectedDistance}
        tshirtSize={selectedSize}
        shippingStatus={shippingMethod}
        totalPrice={totalPrice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Success Registration Dialog Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 border-[var(--line)] bg-[var(--surface)] shadow-2xl flex flex-col items-center text-center gap-5">
            <div className="size-16 rounded-full bg-[var(--positive)]/20 border border-[var(--positive)]/40 flex items-center justify-center text-[var(--positive)]">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
                สมัครเข้าร่วมการแข่งขันสำเร็จ!
              </h3>
              <p className="text-xs text-[var(--ink-2)]">
                คุณได้ลงทะเบียนงาน <span className="font-semibold text-[var(--ink)]">{event.title}</span> เรียบร้อยแล้ว
              </p>
            </div>

            {/* Assigned BIB Box */}
            <div className="w-full p-4 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">หมายเลข BIB ประจำตัวของคุณ</span>
              <span className="font-[var(--font-bib)] text-4xl font-black text-[var(--accent)] tracking-wider">
                {registeredBib}
              </span>
              <span className="text-xs font-mono text-[var(--ink-2)]">
                ระยะ {selectedDistance} • ไซส์เสื้อ {selectedSize}
              </span>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="outline"
                onClick={() => setSuccessModalOpen(false)}
                className="flex-1 text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </Button>
              <Link href="/account/bibs" className="flex-1">
                <Button className="w-full text-xs font-bold cursor-pointer">
                  <Ticket className="size-3.5 mr-1.5" />
                  <span>ดู BIB ดิจิทัลของฉัน</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
