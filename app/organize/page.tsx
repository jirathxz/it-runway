"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Footprints,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Shield,
  QrCode,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  PlusCircle,
  FileCheck,
  ChevronRight,
  Lock,
  Zap,
  Check,
  Megaphone,
  CreditCard,
  Tv,
  Award,
  Download,
  Share2,
  FileSpreadsheet,
  Cpu,
  Trophy,
  Layers,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

// Popular Templates for Quick 1-Click Auto Fill
const QUICK_TEMPLATES = [
  {
    name: "พระปฐมเจดีย์ มินิมาราธอน (10K)",
    title: "พระปฐมเจดีย์ มินิมาราธอน 2026",
    location: "องค์พระปฐมเจดีย์ อ.เมืองนครปฐม",
    distance: "10 KM (Mini Marathon)",
    price: "550",
    time: "05:30",
    image: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    name: "ศาลายา แคมปัส รัน (5K / 10K)",
    title: "ศาลายา แคมปัส รัน 2026",
    location: "มหาวิทยาลัยมหิดล ศาลายา",
    distance: "5 / 10 KM",
    price: "450",
    time: "05:45",
    image: "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    name: "กำแพงแสน ฮาล์ฟมาราธอน (21K)",
    title: "กำแพงแสน ฮาล์ฟมาราธอน ซีซั่น 2",
    location: "มหาวิทยาลัยเกษตรศาสตร์ กำแพงแสน",
    distance: "21 KM (Half Marathon)",
    price: "750",
    time: "05:00",
    image: "https://images.pexels.com/photos/3775603/pexels-photo-3775603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    name: "สามพราน ริเวอร์ไซด์ เทรล (15K)",
    title: "สามพราน ริเวอร์ไซด์ เทรล รัน 2026",
    location: "ริมแม่น้ำท่าจีน อ.สามพราน",
    distance: "15 KM (Trail)",
    price: "650",
    time: "06:00",
    image: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
];

const PRESET_LOCATIONS = [
  "องค์พระปฐมเจดีย์ อ.เมืองนครปฐม",
  "พระราชวังสนามจันทร์ อ.เมืองนครปฐม",
  "พุทธมณฑลสาย 4 ต.ศาลายา",
  "มหาวิทยาลัยมหิดล ศาลายา",
  "มหาวิทยาลัยเกษตรศาสตร์ กำแพงแสน",
  "ริมแม่น้ำท่าจีน อ.สามพราน",
  "วัดไร่ขิง พระอารามหลวง อ.สามพราน",
];

const DISTANCE_OPTIONS = [
  "5 KM (Fun Run)",
  "10 KM (Mini Marathon)",
  "21 KM (Half Marathon)",
  "42 KM (Full Marathon)",
  "5 / 10 KM",
  "5 / 10 / 21 KM",
  "15 KM (Trail)",
];

const PRESET_POSTERS = [
  {
    label: "สวนและเส้นทางสีเขียว",
    url: "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    label: "องค์พระปฐมเจดีย์และเมือง",
    url: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    label: "แสงพระอาทิตย์ยามเช้า",
    url: "https://images.pexels.com/photos/3775603/pexels-photo-3775603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    label: "เส้นทางเทรลและธรรมชาติ",
    url: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
];

export default function OrganizeEventPage() {
  const router = useRouter();
  const { data: session, isPending: authPending } = useSession();

  // Form states
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState(PRESET_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = React.useState("");
  const [date, setDate] = React.useState("2026-05-10");
  const [time, setTime] = React.useState("05:30");
  const [distance, setDistance] = React.useState(DISTANCE_OPTIONS[1]);
  const [price, setPrice] = React.useState("550");
  const [image, setImage] = React.useState(PRESET_POSTERS[0].url);
  const [organizerName, setOrganizerName] = React.useState("");
  const [organizerContact, setOrganizerContact] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // User's requested events list
  const [myRequests, setMyRequests] = React.useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = React.useState(true);

  // Auto fill organizer name from session
  React.useEffect(() => {
    if (session?.user) {
      setOrganizerName((prev) => prev || session.user.name || "");
      setOrganizerContact((prev) => prev || session.user.email || "");
    }
  }, [session]);

  // Fetch user's event requests
  const fetchMyRequests = React.useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/events/request");
      const data = await res.json();
      if (data.requests) {
        setMyRequests(data.requests);
      }
    } catch (e) {
      console.error("Failed to load requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (session?.user) {
      fetchMyRequests();
    }
  }, [session, fetchMyRequests]);

  // Apply Quick Template
  const handleApplyTemplate = (tmpl: (typeof QUICK_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setLocation(tmpl.location);
    setDistance(tmpl.distance);
    setPrice(tmpl.price);
    setTime(tmpl.time);
    setImage(tmpl.image);
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push("/auth/sign-in?callbackUrl=/organize");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    const finalLocation = location === "other" ? customLocation : location;

    try {
      const res = await fetch("/api/events/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          location: finalLocation,
          date,
          time,
          distance,
          price: Number(price) || 0,
          image,
          organizerName,
          organizerContact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งคำขอ");
      }

      setSubmitSuccess(data.message || "ส่งคำขอจัดงานวิ่งสำเร็จ!");
      setTitle("");
      setPrice("550");
      fetchMyRequests();

      // Scroll to requests container smoothly
      const el = document.getElementById("my-requests-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setSubmitting(false);
    }
  };

  const hasApprovedEvents = myRequests.some((r) => r.approvalStatus === "approved");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 w-full">
        {/* HERO SECTION (Runlah-inspired layout) */}
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-gradient-to-b from-[var(--surface-2)] via-[var(--base)] to-[var(--base)] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[var(--content-max)] mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-mono text-[var(--accent)] font-bold">
                  <Footprints className="size-3.5" />
                  <span>สำหรับผู้จัดงานวิ่งในนครปฐม</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[var(--font-display)] tracking-tight text-[var(--ink)] leading-[1.15]">
                  เครื่องมือที่ช่วยให้การจัดงานวิ่งของคุณ{" "}
                  <span className="text-[var(--accent)]">ง่ายขึ้นในทุกขั้นตอน</span>
                </h1>

                <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
                  ตั้งแต่เปิดรับสมัคร ชำระเงินออนไลน์ ตรวจสอบรายชื่อ ไปจนถึงจับเวลา RFID จอแสดงผลสด และตรวจ BIB หน้างาน
                  ดูแลงานวิ่งในนครปฐมครบวงจรในที่เดียว
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <Button asChild size="lg" className="font-bold text-xs sm:text-sm h-11 px-6 shadow-lg">
                    <a href="#create-form">
                      <PlusCircle className="size-4 mr-2" />
                      <span>ยื่นขอจัดงานวิ่งฟรี</span>
                    </a>
                  </Button>

                  {hasApprovedEvents ? (
                    <Button asChild variant="secondary" size="lg" className="font-bold text-xs sm:text-sm h-11 px-6 text-emerald-400 border-emerald-500/30">
                      <Link href="/organizer/checkin">
                        <QrCode className="size-4 mr-2" />
                        <span>เปิดแถบตรวจ BIB หน้างาน</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="lg" className="font-mono text-xs sm:text-sm h-11 px-5">
                      <a href="#services">
                        <span>ดูบริการทั้งหมด (4 ขั้นตอน)</span>
                        <ChevronRight className="size-3.5 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Stat Pillars */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md shrink-0">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm text-center">
                  <div className="text-2xl sm:text-3xl font-black font-[var(--font-display)] text-[var(--accent)]">
                    100%
                  </div>
                  <div className="text-xs font-mono text-[var(--ink-2)] mt-1">
                    RFID Chip Timing
                  </div>
                  <div className="text-[10px] text-[var(--ink-3)] mt-0.5">จับเวลาแม่นยำรายวินาที</div>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm text-center">
                  <div className="text-2xl sm:text-3xl font-black font-[var(--font-display)] text-emerald-400">
                    4+
                  </div>
                  <div className="text-xs font-mono text-[var(--ink-2)] mt-1">
                    อำเภอหลักในนครปฐม
                  </div>
                  <div className="text-[10px] text-[var(--ink-3)] mt-0.5">ครอบคลุมทุกสนามวิ่ง</div>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm text-center">
                  <div className="text-2xl sm:text-3xl font-black font-[var(--font-display)] text-[var(--ink)]">
                    10,000+
                  </div>
                  <div className="text-xs font-mono text-[var(--ink-2)] mt-1">
                    ฐานข้อมูลนักวิ่งในระบบ
                  </div>
                  <div className="text-[10px] text-[var(--ink-3)] mt-0.5">เข้าถึงนักวิ่งตัวจริง</div>
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm text-center">
                  <div className="text-2xl sm:text-3xl font-black font-[var(--font-display)] text-blue-400">
                    0 บาท
                  </div>
                  <div className="text-xs font-mono text-[var(--ink-2)] mt-1">
                    ยื่นขอจัดงานฟรี
                  </div>
                  <div className="text-[10px] text-[var(--ink-3)] mt-0.5">ไม่มีค่าธรรมเนียมส่งคำขอ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 STAGES WORKFLOW (Runlah Style) */}
        <section id="services" className="py-12 sm:py-16 border-b border-[var(--line)] max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="outline" size="sm" className="font-mono uppercase">
              Full-Lifecycle Event Solution
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)]">
              ใช้ครบวงจรตั้งแต่ต้น — งานเดินได้เองทั้งเส้น
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-2)]">
              ข้อมูลชุดเดียวไหลต่อเนื่องตั้งแต่เปิดรับสมัครจนถึงวันวิ่งและดาวน์โหลดเกียรติบัตร
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stage 1 */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-mono font-black text-sm">
                  1
                </div>
                <Megaphone className="size-4 text-[var(--accent)]" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)]">
                ประชาสัมพันธ์งาน
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                ลงปฏิทินงานวิ่งนครปฐมฟรี พร้อมระบบค้นหาอัจฉริยะ (Smart Autocomplete) ให้นักวิ่งเข้าถึงงานของคุณได้ทันที
              </p>
              <ul className="text-[11px] font-mono text-[var(--ink-3)] space-y-1 pt-1">
                <li>• ลงปฏิทินงานวิ่งฟรี</li>
                <li>• แท็กตัวกรองระยะ 5K / 10K / 21K</li>
                <li>• คีย์ลัดค้นหา ⌘K ทั่วเว็บ</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-mono font-black text-sm">
                  2
                </div>
                <CreditCard className="size-4 text-blue-400" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)]">
                รับสมัคร & ชำระเงิน
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                ระบบรับสมัครและจ่ายเงินจำลองพร้อมเพย์ QR, บัตรเครดิต, และโมบายแบงก์กิ้ง พร้อมระบบยกเลิกและคืนเงินอัตโนมัติ
              </p>
              <ul className="text-[11px] font-mono text-[var(--ink-3)] space-y-1 pt-1">
                <li>• พร้อมเพย์ QR & บัตรเครดิต</li>
                <li>• ตัวเลือกไซส์เสื้อ S/M/L/XL/2XL</li>
                <li>• ออกเลข BIB & ชิป RFID ทันที</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-mono font-black text-sm">
                  3
                </div>
                <QrCode className="size-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)]">
                วันงาน & ตรวจ BIB
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                แถบตรวจ BIB และสแกนชิป RFID หน้างาน เช็คอินนักวิ่งเข้าสู่จุดปล่อยตัว Corral พร้อมสถิติความคืบหน้าแบบเรียลไทม์
              </p>
              <ul className="text-[11px] font-mono text-[var(--ink-3)] space-y-1 pt-1">
                <li>• สแกน / ค้นหา BIB หน้างาน</li>
                <li>• เช็คอินเข้าจุดปล่อยตัว Corral</li>
                <li>• แสดงสถิติผู้เข้างานสด</li>
              </ul>
            </div>

            {/* Stage 4 */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-mono font-black text-sm">
                  4
                </div>
                <Award className="size-4 text-purple-400" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)]">
                ผลสด & e-Certificate
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                ประกาศผลการแข่งขันสดรายบุคคล อันดับ และดาวน์โหลด Official Timing Certificate ดิจิทัลความละเอียดสูงได้ทันที
              </p>
              <ul className="text-[11px] font-mono text-[var(--ink-3)] space-y-1 pt-1">
                <li>• ผลสดแบ่งตามรุ่นอายุ/ระยะ</li>
                <li>• ดาวน์โหลด e-Certificate</li>
                <li>• ส่งออกสรุปสถิติงาน</li>
              </ul>
            </div>
          </div>
        </section>

        {/* MAIN INTERACTIVE CREATOR FORM & ORGANIZER STATUS */}
        <section id="create-form" className="py-12 sm:py-16 max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Super-Simple 1-Click Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-5">
                  <div className="flex items-center gap-2">
                    <Zap className="size-5 text-[var(--accent)]" />
                    <div>
                      <h2 className="text-base sm:text-lg font-bold font-[var(--font-display)]">
                        แบบฟอร์มขอจัดงานวิ่ง (Easy Event Request)
                      </h2>
                      <p className="text-[11px] text-[var(--ink-3)] font-mono">
                        กรอกง่ายเพียง 3 ส่วนสั้นๆ หรือเลือกเทมเพลตด่วนใน 1 คลิก
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Template Presets */}
                <div className="mb-6 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-2.5">
                  <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 font-[var(--font-display)]">
                    <Sparkles className="size-3.5 text-[var(--accent)]" />
                    <span>เลือกเทมเพลตยอดนิยม (กรอกอัตโนมัติในคลิกเดียว):</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.name}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="text-left px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-xs text-[var(--ink-2)] transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate font-semibold">{tmpl.name}</span>
                        <ChevronRight className="size-3 opacity-50 group-hover:opacity-100 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {submitSuccess && (
                  <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-bold">{submitSuccess}</p>
                      <p className="text-[11px] text-emerald-400/80 mt-0.5">
                        คำขอของคุณถูกส่งไปยังแอดมินแล้ว เมื่อได้รับการอนุมัติ งานจะออนไลน์สู่หน้าเว็บและเปิดใช้งานระบบตรวจ BIB ทันที
                      </p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-start gap-3">
                    <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
                    <p>{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  {/* Step 1: Event Title & Location */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold uppercase">
                      <span className="size-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>ข้อมูลงานวิ่งและสถานที่</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                        ชื่องานวิ่ง <span className="text-[var(--accent)]">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="เช่น นครปฐม ฮาล์ฟมาราธอน 2026"
                        className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                        สถานที่จัดงาน (ในจังหวัดนครปฐม) <span className="text-[var(--accent)]">*</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {PRESET_LOCATIONS.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => setLocation(loc)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              location === loc
                                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow-sm"
                                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--line)]"
                            }`}
                          >
                            {loc.split(" ")[0]}
                          </button>
                        ))}
                      </div>

                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-11 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-xs sm:text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                      >
                        {PRESET_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                        <option value="other">สถานที่อื่นๆ (ระบุเอง)</option>
                      </select>

                      {location === "other" && (
                        <Input
                          type="text"
                          required
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="ระบุสถานที่จัดงานในนครปฐม..."
                          className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm mt-2"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                          วันที่จัดงาน <span className="text-[var(--accent)]">*</span>
                        </label>
                        <Input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                          เวลาปล่อยตัว <span className="text-[var(--accent)]">*</span>
                        </label>
                        <Input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Distance & Price */}
                  <div className="space-y-3 pt-3 border-t border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold uppercase">
                      <span className="size-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>ระยะทางและค่าสมัคร</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1.5">
                        ระยะทางที่เปิดรับสมัคร <span className="text-[var(--accent)]">*</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {DISTANCE_OPTIONS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDistance(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              distance === d
                                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow-sm"
                                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--line)]"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                        ค่าสมัครเริ่มต้น (บาท / THB) <span className="text-[var(--accent)]">*</span>
                      </label>
                      <Input
                        type="number"
                        required
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="เช่น 550"
                        className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Step 3: Organizer & Poster */}
                  <div className="space-y-3 pt-3 border-t border-[var(--line)]">
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold uppercase">
                      <span className="size-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>ผู้จัดงานและภาพโปสเตอร์</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1.5">
                        เลือกภาพโปสเตอร์สำเร็จรูป
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        {PRESET_POSTERS.map((poster) => (
                          <button
                            key={poster.url}
                            type="button"
                            onClick={() => setImage(poster.url)}
                            className={`rounded-xl border p-1 text-left transition-all overflow-hidden cursor-pointer ${
                              image === poster.url
                                ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                                : "border-[var(--line)] opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={poster.url}
                              alt={poster.label}
                              className="h-12 w-full object-cover rounded-lg mb-1"
                            />
                            <p className="text-[9px] font-mono truncate px-1 text-[var(--ink-2)]">
                              {poster.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                          ชื่อผู้จัดงาน / องค์กร <span className="text-[var(--accent)]">*</span>
                        </label>
                        <Input
                          type="text"
                          required
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                          placeholder="ชื่อผู้จัดงาน"
                          className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                          เบอร์โทร / Line ID ติดต่อ <span className="text-[var(--accent)]">*</span>
                        </label>
                        <Input
                          type="text"
                          required
                          value={organizerContact}
                          onChange={(e) => setOrganizerContact(e.target.value)}
                          placeholder="เช่น 081-234-5678"
                          className="h-11 bg-[var(--surface-2)] text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    {session ? (
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 text-sm font-bold shadow-lg"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <Footprints className="size-4 animate-spin" />
                            <span>กำลังส่งคำขอจัดงาน...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FileCheck className="size-4" />
                            <span>ยื่นคำขอจัดงานวิ่งไปยังแอดมิน (ส่งฟรี)</span>
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => router.push("/auth/sign-in?callbackUrl=/organize")}
                        className="w-full h-12 text-sm font-bold"
                      >
                        <Lock className="size-4 mr-2" />
                        <span>เข้าสู่ระบบสมาชิกเพื่อยื่นคำขอจัดงาน</span>
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live Preview Card & My Event Requests */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Preview Card */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] font-bold">
                    <Sparkles className="size-3.5" />
                    <span>ตัวอย่างการ์ดงานวิ่งจริง (LIVE PREVIEW)</span>
                  </div>
                  <Badge variant="outline" size="sm" className="font-mono text-[9px]">
                    PREVIEW
                  </Badge>
                </div>

                <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] overflow-hidden shadow-sm">
                  <div className="relative aspect-16/9 w-full bg-black/20">
                    <img
                      src={image}
                      alt="Event Preview"
                      className="size-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="default" size="sm" className="font-mono text-[10px]">
                        เปิดรับสมัคร
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-bold text-[var(--ink)] line-clamp-1">
                      {title || "ชื่องานวิ่งของคุณ (กรอกในแบบฟอร์ม)"}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--ink-2)]">
                      <MapPin className="size-3 text-[var(--accent)] shrink-0" />
                      <span className="truncate">{location === "other" ? customLocation || "สถานที่ในนครปฐม" : location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-xs font-mono">
                      <span className="text-[var(--ink-3)]">{distance}</span>
                      <span className="font-bold text-[var(--accent)]">฿{Number(price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Action Portal */}
              <div id="my-requests-section" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[var(--accent)]" />
                    <h3 className="text-xs font-bold font-mono uppercase text-[var(--ink)]">
                      งานที่คุณยื่นขอจัด ({myRequests.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={fetchMyRequests}
                    className="text-[10px] font-mono text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    รีเฟรช
                  </button>
                </div>

                {hasApprovedEvents && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span>คุณได้รับสิทธิ์ "ผู้จัดงาน" เรียบร้อยแล้ว</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                      งานวิ่งของคุณผ่านการอนุมัติ สามารถเปิดแถบตรวจ BIB นักวิ่งและเช็คอินหน้างานได้ทันที
                    </p>
                    <Button asChild size="sm" className="w-full font-bold text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white">
                      <Link href="/organizer/checkin" className="flex items-center justify-center gap-2">
                        <QrCode className="size-3.5" />
                        <span>เปิดแถบตรวจ BIB นักวิ่งเข้างาน</span>
                      </Link>
                    </Button>
                  </div>
                )}

                {loadingRequests ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--ink-3)] font-mono">
                    <Footprints className="size-6 animate-pulse text-[var(--accent)]" />
                    <span>กำลังโหลดรายการคำขอ...</span>
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--ink-3)] space-y-1">
                    <p>ยังไม่มีรายการคำขอจัดงานวิ่ง</p>
                    <p className="text-[10px]">เลือกเทมเพลตด่วนหรือกรอกแบบฟอร์มด้านซ้ายเพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((req) => {
                      const isApproved = req.approvalStatus === "approved";
                      const isPending = req.approvalStatus === "pending";
                      const isRejected = req.approvalStatus === "rejected";

                      return (
                        <div
                          key={req.id}
                          className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                              {req.title}
                            </h4>
                            {isApproved && (
                              <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0">
                                <CheckCircle2 className="size-3 mr-1" />
                                อนุมัติแล้ว
                              </Badge>
                            )}
                            {isPending && (
                              <Badge variant="secondary" size="sm" className="bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
                                <Clock3 className="size-3 mr-1" />
                                รออนุมัติ
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge variant="destructive" size="sm" className="shrink-0">
                                <AlertCircle className="size-3 mr-1" />
                                ปฏิเสธ
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[var(--ink-3)]">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-[var(--accent)] shrink-0" />
                              <span className="truncate">{req.location}</span>
                            </span>
                            <span className="flex items-center gap-1 justify-end">
                              <Footprints className="size-3 text-[var(--accent)] shrink-0" />
                              <span>{req.distance}</span>
                            </span>
                          </div>

                          {isApproved && (
                            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                              <span className="text-[10px] text-emerald-400 font-mono">
                                ออนไลน์ในหน้าเว็บแล้ว
                              </span>
                              <Link
                                href={`/organizer/checkin?eventId=${req.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline"
                              >
                                <QrCode className="size-3.5" />
                                <span>ตรวจ BIB</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
