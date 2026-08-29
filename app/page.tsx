"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import SplitText from "@/components/reactbits/SplitText";
import BlurText from "@/components/reactbits/BlurText";
import ShinyText from "@/components/reactbits/ShinyText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";
import FadeContent from "@/components/reactbits/FadeContent";
import DriftWall from "@/components/reactbits/DriftWall";
import Aurora from "@/components/reactbits/Aurora";
import Navbar from "@/components/navbar";
import { EventCard, EventItem } from "@/components/events/event-card";
import { EventDialog } from "@/components/events/event-dialog";
import { Search, ChevronDown, ChevronRight, ArrowDown, Calendar, MapPin, Clock, Footprints, User, LogOut, Shield } from "lucide-react";

const fallbackPexelsItems = [
  // fallback 22 ภาพ (Pexels thai marathon) — ใช้เมื่อ API ยังไม่โหลด/ล้มเหลว
  { image: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Thai Marathon Dawn" },
  { image: "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Nakhon Pathom Road" },
  { image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Trail Run" },
  { image: "https://images.pexels.com/photos/2774140/pexels-photo-2774140.jpeg?auto=compress&cs=tinysrgb&w=600", title: "City Run" },
  { image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Night Run Salaya" },
  { image: "https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Finisher" },
  { image: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Warm Up" },
  { image: "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg?auto=compress&cs=tinysrgb&w=600", title: "BIB Pickup" },
  { image: "https://images.pexels.com/photos/235922/pexels-photo-235922.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Track Lane" },
  { image: "https://images.pexels.com/photos/2377173/pexels-photo-2377173.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Street Run" },
  { image: "https://images.pexels.com/photos/1238961/pexels-photo-1238961.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Group Run" },
  { image: "https://images.pexels.com/photos/949126/pexels-photo-949126.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Runner Closeup" },
  { image: "https://images.pexels.com/photos/10313672/pexels-photo-10313672.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Marathon Crowd" },
  { image: "https://images.pexels.com/photos/767520/pexels-photo-767520.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Sunrise Run" },
  { image: "https://images.pexels.com/photos/1491555/pexels-photo-1491555.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Hill Sprint" },
  { image: "https://images.pexels.com/photos/122935/pexels-photo-122935.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Forest Trail" },
  { image: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Road Race" },
  { image: "https://images.pexels.com/photos/283491/pexels-photo-283491.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Relay" },
  { image: "https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Sprint Finish" },
  { image: "https://images.pexels.com/photos/247520/pexels-photo-247520.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Training" },
  { image: "https://images.pexels.com/photos/3153207/pexels-photo-3153207.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Marathon Pack" },
  { image: "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600", title: "Cool Down" },
];
const thaiMarathonItems = fallbackPexelsItems;

export default function Home() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ทุกประเภท");
  const [distance, setDistance] = useState("ทุกระยะ");
  const [wallItems, setWallItems] = useState(fallbackPexelsItems);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Pexels API — สุ่ม thai marathon ล้วนๆ จาก .env PEXELS_API
  useEffect(() => {
    fetch("/api/pexels")
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length) {
          const shuffled = [...d.items].sort(() => Math.random() - 0.5);
          setWallItems(shuffled.slice(0, 22));
        }
      })
      .catch(() => {});
  }, []);

  // Events & Real DB Stats ใน hero (จ.นครปฐม)
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<{ totalEvents: number; totalUsers: number; totalRegistrations: number }>({
    totalEvents: 13,
    totalUsers: 17,
    totalRegistrations: 186,
  });

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (d.events?.length) setDbEvents(d.events);
        if (d.stats) setDbStats(d.stats);
      })
      .catch(() => {});
  }, []);

  const formattedHeroEvents: EventItem[] = dbEvents.map((ev) => {
    const d = new Date(ev.date);
    const thaiDate = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    });
    return {
      id: ev.id,
      title: ev.title,
      location: ev.location,
      date: thaiDate,
      distance: ev.distance,
      price: ev.price,
      slots: "300+",
      status: ev.status || "open",
      image: ev.image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600",
    };
  });

  return (
    <div className="min-h-screen bg-[var(--base)] text-[var(--ink)] overflow-x-hidden">
      <style>{`
        .btn-primary {
          background: var(--accent);
          color: var(--accent-ink);
          border: 1px solid var(--accent);
          border-radius: var(--radius);
          font-family: var(--font-text);
          font-weight: 700;
          font-size: var(--step--1);
          line-height: 1;
          letter-spacing: 0.02em;
          padding: 0 var(--space-m);
          height: 44px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          vertical-align: middle;
          white-space: nowrap;
          box-sizing: border-box;
          transition: background var(--dur) var(--ease), transform var(--dur-fast) var(--ease), box-shadow var(--dur) var(--ease);
          box-shadow: var(--shadow-near);
        }
        .btn-primary svg { display: block; flex-shrink: 0; align-self: center; }
        .btn-primary span { line-height: 1; display: inline-block; }
        .btn-primary:hover { background: oklch(0.85 0.17 95); transform: translateY(-1px); box-shadow: var(--shadow-far); }
        .btn-primary:active { transform: translateY(0) scale(0.98); background: oklch(0.80 0.17 95); }
        .btn-primary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
        .btn-primary:disabled { opacity: 0.45; pointer-events: none; }
        .btn-primary[aria-busy="true"] { opacity: 0.8; pointer-events: none; }

        .btn-ghost {
          background: transparent;
          color: var(--ink-2);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          font-size: var(--step--1);
          line-height: 1;
          font-weight: 500;
          padding: 0 var(--space-s);
          height: 36px;
          display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2xs);
          vertical-align: middle;
          white-space: nowrap;
          transition: all var(--dur) var(--ease);
        }
        .btn-ghost:hover { color: var(--ink); border-color: var(--ink-3); background: var(--surface); }
        .btn-ghost:active { transform: scale(0.97); }
        .btn-ghost:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .btn-ghost[aria-current="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 700; }

        .field {
          background: var(--surface);
          border: var(--border);
          border-radius: var(--radius);
          height: 48px;
          color: var(--ink);
          font-size: var(--step--1);
          line-height: 48px;
          font-family: var(--font-text);
          vertical-align: middle;
          padding-block: 0;
          transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
        }
        .field::placeholder { line-height: 48px; }
        .field:hover { border-color: var(--ink-3); }
        .field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .field:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        .card-interactive { transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease); }
        .card-interactive:hover { border-color: var(--ink-3); transform: translateY(-2px); }
        .card-interactive:active { transform: translateY(0) scale(0.99); }
        .card-interactive:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>

      {/* ===== HEADER — Responsive Navigation Component ===== */}
      <Navbar />

      {/* ===== HERO — DriftWall + Aurora background ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 opacity-[0.95]">
            <DriftWall
              items={wallItems}
              columns={5}
              tileWidth={220}
              tileHeight={140}
              gap={16}
              radius={12}
              tilt={14}
              turn={-10}
              perspective={1200}
              depth={90}
              speed={22}
              direction="up"
              variance={0.35}
              parallax={0.45}
              dim={0.82}
              overlayColor="#09090B"
              fade={0.32}
            />
          </div>
          <div className="absolute inset-0 opacity-[0.32]">
            <Aurora colorStops={["oklch(0.88 0.17 95)", "oklch(0.72 0.16 145)", "oklch(0.88 0.17 95 / 0.6)"]} blend={0.52} amplitude={0.85} speed={0.55} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--base)]/8 via-[var(--base)]/45 to-[var(--base)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--base)]/60 via-transparent to-[var(--base)]/30" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-[0.28]" aria-hidden />

        <div className="relative mx-auto max-w-[var(--content-max)] px-[var(--space-s)] pb-[var(--space-xl)] pt-[var(--space-l)] lg:px-[var(--space-m)] lg:pb-[var(--space-2xl)] lg:pt-[var(--space-xl)]" id="main-content">
          {/* 12-col skeleton */}
          <div className="grid gap-[var(--space-l)] lg:grid-cols-12 lg:gap-[var(--space-m)]">
            {/* LEFT — 7 cols */}
            <div className="lg:col-span-7">
              <FadeContent delay={0} duration={0.6} blur>
                <div
                  className="inline-flex items-center gap-[var(--space-xs)] px-[var(--space-xs)] py-[6px]"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}
                >
                  <span className="flex items-center gap-[6px] font-[var(--font-mono)] text-[11px] font-bold tracking-[0.08em] text-[var(--ink-2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-[var(--radius)] opacity-75" style={{ background: "var(--accent)" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-[var(--radius)]" style={{ background: "var(--accent)" }} />
                    </span>
                    32 EVENTS OPEN
                  </span>
                  <span className="hidden h-3 w-px sm:block" style={{ background: "var(--line)" }} />
                  <span className="hidden font-[var(--font-mono)] text-[11px] text-[var(--ink-3)] sm:block">อัปเดต 2 ชม.ที่แล้ว • นครปฐม</span>
                </div>
              </FadeContent>

              {/* H1 — Chakra (user request) */}
              <h1
                className="mt-[var(--space-m)] font-[var(--font-display)] font-bold tracking-[-0.02em]"
                style={{ fontSize: "var(--step-6)", lineHeight: 1.15 }}
              >
                <div className="text-[var(--ink)]">สนามต่อไป</div>
                <div>
                  <span className="text-[var(--ink)]">ของคุณอยู่</span>
                  <span className="ml-[var(--space-xs)] text-[var(--accent)]">นครปฐม</span>
                </div>
                <span className="block mt-[var(--space-2xs)] font-[var(--font-bib)] font-light tracking-[0.12em] text-[var(--ink-3)]" style={{ fontSize: "var(--step-1)" }}>
                  <BlurText text="IT RUNWAY" delay={70} animateBy="words" direction="top" className="" />
                </span>
              </h1>
              <div className="mt-[6px] h-[6px] w-[280px] max-w-full -rotate-[0.4deg]" style={{ background: "var(--accent)" }} aria-hidden />

              {/* Body — 68ch, full contrast, weight only for emphasis */}
              <FadeContent delay={380} duration={0.6} blur>
                <p className="mt-[var(--space-s)] max-w-[68ch] text-[var(--step-0)] leading-[1.65] text-[var(--ink-2)]" style={{ textWrap: "pretty" }}>
                  ศูนย์รวมงานวิ่ง ปั่นจักรยาน ไตรกีฬา และกีฬาทุกประเภททั่วไทย
                  <span className="font-semibold text-[var(--ink)]"> คัดมาเฉพาะงานคุณภาพในนครปฐม</span> — จบครบตั้งแต่ค้นหา จ่ายเงิน รับ BIB ถึงจับเวลาชิป
                </p>
              </FadeContent>

              {/* SEARCH — tint separation, not shadow */}
              <FadeContent delay={500} duration={0.6}>
                <div
                  className="mt-[var(--space-l)] p-[var(--space-2xs)]"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-near)" }}
                >
                  <div className="flex flex-col gap-[var(--space-2xs)] lg:flex-row lg:items-center">
                    <div className="relative flex-1 flex items-center">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่องาน เช่น City Run, Salaya"
                        className="field w-full pl-10 pr-4 placeholder:text-[var(--ink-3)]"
                        aria-label="ค้นหาชื่องานวิ่ง"
                      />
                    </div>
                    <div className="flex gap-[var(--space-2xs)]">
                      <div className="relative flex-1 lg:w-[160px]">
                        <select value={type} onChange={(e) => setType(e.target.value)} className="field w-full appearance-none px-4 pr-8" aria-label="ประเภทกีฬา">
                          <option>ทุกประเภท</option>
                          <option>วิ่งถนน</option>
                          <option>เทรล</option>
                          <option>ปั่นจักรยาน</option>
                          <option>ไตรกีฬา</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      </div>
                      <div className="relative flex-1 lg:w-[140px]">
                        <select value={distance} onChange={(e) => setDistance(e.target.value)} className="field w-full appearance-none px-4 pr-8" aria-label="ระยะทาง">
                          <option>ทุกระยะ</option>
                          <option>5 KM</option>
                          <option>10 KM</option>
                          <option>21 KM</option>
                          <option>42 KM</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      </div>
                    </div>
                    <button className="btn-primary" style={{ height: "48px", borderRadius: "var(--radius)" }}>
                      <Search className="block shrink-0" size={16} strokeWidth={2} aria-hidden="true" />
                      <span className="leading-none">ค้นหา</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-[var(--space-2xs)] px-[var(--space-2xs)] pb-[2px] pt-[var(--space-xs)]">
                    <span className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.08em] text-[var(--ink-3)]">ยอดนิยม:</span>
                    {["City Run", "ศาลายา", "21 KM", "เทรลสามพราน"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearch(tag)}
                        className="inline-flex items-center rounded-[var(--radius)] border px-3 py-1 font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
                        style={{ borderColor: "var(--line)", background: "color-mix(in oklch, var(--surface-2) 60%, transparent)", fontSize: "var(--step--1)" }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeContent>

              {/* Categories dynamically computed */}
              <div className="mt-[var(--space-m)] flex flex-wrap gap-[var(--space-2xs)]">
                {[
                  { label: "ทั้งหมด", count: dbEvents.length.toString(), active: true },
                  { label: "วิ่งถนน", count: dbEvents.filter(e => !e.title.toLowerCase().includes("trail") && !e.title.toLowerCase().includes("cycling") && !e.title.toLowerCase().includes("triathlon") && !e.title.toLowerCase().includes("เทรล")).length.toString() },
                  { label: "เทรล", count: dbEvents.filter(e => e.title.toLowerCase().includes("trail") || e.title.toLowerCase().includes("เทรล") || e.location.toLowerCase().includes("ป่า")).length.toString() },
                  { label: "ปั่นจักรยาน", count: dbEvents.filter(e => e.title.toLowerCase().includes("cycling") || e.title.toLowerCase().includes("จักรยาน")).length.toString() },
                  { label: "ไตรกีฬา", count: dbEvents.filter(e => e.title.toLowerCase().includes("triathlon") || e.title.toLowerCase().includes("ไตรกีฬา")).length.toString() },
                ].map((c) => (
                  <Link
                    key={c.label}
                    href="/events"
                    className="btn-ghost"
                    style={
                      c.active
                        ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)", fontWeight: 700 }
                        : undefined
                    }
                  >
                    {c.label}
                    <span
                      className="numeric px-[6px] py-[2px] text-[11px] font-bold"
                      style={{ background: c.active ? "var(--accent-ink)" : "var(--surface-2)", color: c.active ? "var(--accent)" : "var(--ink-3)", borderRadius: "var(--radius)" }}
                    >
                      {c.count}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Stats — tabular nums, size hierarchy — always visible, no viewport gate */}
              <div className="mt-[var(--space-l)] grid grid-cols-3 gap-[var(--space-m)] border-t pt-[var(--space-m)]" style={{ borderColor: "var(--line)" }}>
                {[
                  { to: dbStats.totalEvents || dbEvents.length || 13, suffix: " งาน", label: "งานแข่งขัน", sub: "ในระบบนครปฐม" },
                  { to: dbStats.totalRegistrations || 186, suffix: " คน", label: "ลงทะเบียนแล้ว", sub: "ชิปไทม์มิ่งรับรอง" },
                  { to: dbStats.totalUsers || 17, suffix: " ท่าน", label: "นักวิ่งในระบบ", sub: "บัญชีนักวิ่งจริง" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="numeric font-[var(--font-bib)] font-extrabold tracking-[-0.03em] text-[var(--ink)]" style={{ fontSize: "var(--step-4)", lineHeight: 1 }}>
                      <CountUp to={s.to} suffix={s.suffix} decimals={(s as any).decimals ?? 0} duration={1.4} delay={0.3} />
                    </div>
                    <div className="mt-[4px] text-[var(--step--1)] font-semibold text-[var(--ink)]">{s.label}</div>
                    <div className="font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 5 cols, memorable BIB hanging */}
            <div className="relative lg:col-span-5 lg:pl-[var(--space-m)]">
              <FadeContent delay={550} duration={0.8} blur className="relative mx-auto max-w-[480px]">
                {/* Hairline rule + dot */}
                <div className="absolute -right-6 top-10 hidden h-[520px] w-px lg:block" style={{ background: "var(--line)" }} aria-hidden />
                <div className="absolute -right-6 top-10 hidden h-[7px] w-[7px] -translate-x-1/2 rounded-[var(--radius)] lg:block" style={{ background: "var(--accent)", boxShadow: "0 0 16px var(--accent-glow)" }} aria-hidden />

                {/* MEMORABLE: Giant BIB hanging outside */}
                <div
                  className="pointer-events-none absolute -left-10 -top-6 z-20 hidden select-none font-[var(--font-bib)] font-black leading-none tracking-[-0.06em] lg:block"
                  style={{ fontSize: "clamp(5rem, 10vw, 8rem)", color: "color-mix(in oklch, var(--accent) 14%, transparent)", WebkitTextStroke: "1px color-mix(in oklch, var(--accent) 22%, transparent)" }}
                  aria-hidden
                >
                  042
                </div>

                {dbEvents.length > 0 && (
                  <SpotlightCard spotlightColor="rgba(250,204,21,0.16)" spotlightSize={320} className="shadow-[var(--shadow-far)]" >
                    <div className="p-[var(--space-2xs)]">
                      <div className="overflow-hidden" style={{ borderRadius: "var(--radius)", background: "var(--surface)", border: "var(--border)" }}>
                        {/* Top bar — timing gate */}
                        <div className="flex items-center justify-between px-[var(--space-s)] py-[var(--space-2xs)]" style={{ background: "var(--base)", borderBottom: "var(--border)" }}>
                          <span className="flex items-center gap-[var(--space-2xs)] font-[var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[var(--ink-3)]">
                            <span className="h-[7px] w-[7px] rounded-[var(--radius)] animate-pulse" style={{ background: "var(--positive)" }} />
                            CHIP TIMING • RFID SYSTEM
                          </span>
                          <span className="font-[var(--font-mono)] text-[11px] font-bold text-[var(--accent)]">
                            {dbEvents[0].distance}
                          </span>
                        </div>

                        <div className="relative h-[256px] overflow-hidden bg-[var(--surface-2)]">
                          {/* Event Image Banner with Overlay */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={dbEvents[0].image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600"}
                            alt={dbEvents[0].title}
                            className="absolute inset-0 size-full object-cover"
                            fetchPriority="high"
                            loading="eager"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-black/40 to-black/30 z-10" />

                          {/* Center BIB */}
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[var(--space-xs)]">
                            <div
                              className="relative flex h-[136px] w-[168px] flex-col items-center justify-center gap-[2px] border bg-white/95 backdrop-blur px-4 pb-5 pt-6 shadow-2xl transition-transform duration-300 hover:scale-105"
                              style={{ borderColor: "var(--ink)", borderWidth: "2px", borderRadius: "var(--radius)", boxShadow: "var(--shadow-near)" }}
                            >
                              <div className="absolute inset-x-2 top-[1px] h-[10px] bib-perf opacity-30" />
                              <div className="font-[var(--font-mono)] text-[10px] font-bold tracking-[0.18em] text-zinc-500 leading-none">IT RUNWAY • NAKHON PATHOM</div>
                              <div className="font-[var(--font-bib)] text-[64px] font-black leading-none tracking-[-0.06em] text-black">042</div>
                              <div className="font-[var(--font-mono)] text-[10px] font-bold tracking-[0.12em] text-zinc-600 leading-none line-clamp-1">{dbEvents[0].title}</div>
                              <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 h-[3px] w-12 rounded-[var(--radius)]" style={{ background: "var(--accent)" }} />
                            </div>
                            <span className="rounded-[var(--radius)] bg-white/95 px-3 py-1 font-[var(--font-mono)] text-[11px] font-bold tracking-[0.08em] text-black shadow-sm backdrop-blur">
                              RFID CHIP • TIMING GATE
                            </span>
                          </div>
                          <div className="absolute right-3 top-3 z-20 flex items-center gap-[var(--space-2xs)] rounded-full border bg-black/75 px-3 py-1.5 backdrop-blur-md" style={{ borderColor: "color-mix(in oklch, white 15%, transparent)" }}>
                            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--positive)" }} />
                            <span className="text-xs font-bold text-white">เปิดรับสมัคร</span>
                          </div>
                        </div>

                        <div className="p-[var(--space-s)]">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-[6px] font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] text-[var(--ink-3)]">
                              <Calendar size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                              {new Date(dbEvents[0].date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="numeric font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] text-[var(--accent)]">
                              {dbEvents[0].status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}
                            </span>
                          </div>
                          <h3 className="mt-[var(--space-2xs)] font-[var(--font-display)] text-[var(--step-2)] font-bold leading-none tracking-[-0.02em] text-[var(--ink)] line-clamp-1">
                            {dbEvents[0].title}
                          </h3>
                          <p className="mt-[4px] flex items-center gap-[6px] font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)] line-clamp-1">
                            <MapPin size={13} className="shrink-0 text-[var(--ink-3)]" />
                            {dbEvents[0].location} • {dbEvents[0].distance}
                          </p>
                          <div className="mt-[var(--space-s)] flex items-center justify-between">
                            <div>
                              <div className="font-[var(--font-mono)] text-[10px] tracking-[0.08em] text-[var(--ink-3)] uppercase">ค่าสมัครเริ่มต้น</div>
                              <div className="numeric font-[var(--font-bib)] text-[var(--step-2)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]">
                                {dbEvents[0].price}<span className="text-[var(--step--1)] font-medium text-[var(--ink-3)]">.-</span>
                              </div>
                            </div>
                            <Link href="/events" className="btn-primary" style={{ height: "44px" }}>
                              สมัครเลย
                              <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                )}

                {dbEvents.length > 1 && (
                  <div className="mt-[var(--space-xs)] grid grid-cols-2 gap-[var(--space-xs)]">
                    {dbEvents.slice(1, 3).map((ev, idx) => {
                      const d = new Date(ev.date);
                      const thaiDate = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
                      return (
                        <FadeContent key={ev.id || ev.title} delay={900 + idx * 120} duration={0.5}>
                          <Link href="/events" className="group card-interactive flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}>
                            <div className="relative h-24 w-full overflow-hidden bg-[var(--surface-2)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ev.image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600"}
                                alt={ev.title}
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-black/30" />
                              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 backdrop-blur-sm text-[10px] font-[var(--font-mono)] font-bold text-white">
                                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ev.status === "open" ? "var(--positive)" : "var(--accent)" }} />
                                {ev.status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}
                              </div>
                              <div className="absolute bottom-2 left-2">
                                <span className="font-[var(--font-mono)] text-[10px] font-bold text-[var(--accent)] bg-[var(--base)]/90 px-1.5 py-0.5 rounded border border-[var(--line)] backdrop-blur-sm">
                                  {ev.distance}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col p-3 gap-1">
                              <span className="font-[var(--font-mono)] text-[10px] font-semibold text-[var(--ink-3)]">{thaiDate}</span>
                              <h4 className="font-[var(--font-display)] text-[var(--step--1)] font-bold leading-tight text-[var(--ink)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{ev.title}</h4>
                              <p className="font-[var(--font-mono)] text-[10px] tracking-[0.04em] text-[var(--ink-3)] line-clamp-1">{ev.location}</p>
                              <div className="mt-auto pt-1 flex items-center justify-between">
                                <span className="numeric font-[var(--font-mono)] text-[11px] font-bold text-[var(--accent)]">{ev.price}.-</span>
                                <span className="text-[10px] font-bold text-[var(--ink-2)] flex items-center gap-0.5 group-hover:text-[var(--accent)]">
                                  สมัคร <ChevronRight size={12} />
                                </span>
                              </div>
                            </div>
                          </Link>
                        </FadeContent>
                      );
                    })}
                  </div>
                )}

                <FadeContent delay={1100} duration={0.6}>
                  <div
                    className="absolute -bottom-4 -left-4 hidden items-center gap-[var(--space-xs)] p-[var(--space-xs)] lg:flex"
                    style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-far)" }}
                  >
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border-2 font-[var(--font-mono)] text-[10px] font-bold"
                          style={{ background: "var(--surface-2)", borderColor: "var(--base)", color: "var(--ink-2)" }}
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border-2 font-black text-xs" style={{ background: "var(--accent)", borderColor: "var(--base)", color: "var(--accent-ink)" }}>
                        +2k
                      </div>
                    </div>
                    <div className="pr-2">
                      <div className="text-[var(--step--1)] font-bold leading-none text-[var(--ink)]">นักวิ่งลงทะเบียนแล้ว</div>
                      <div className="font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)]">อัปเดตแบบเรียลไทม์ • ชิปไทม์</div>
                    </div>
                  </div>
                </FadeContent>
              </FadeContent>
            </div>
          </div>

          {/* Event cards in hero */}
          {dbEvents.length > 0 && (
            <div className="mt-[var(--space-xl)]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[var(--space-s)] mb-[var(--space-s)]">
                <div>
                  <h2 className="font-[var(--font-kanit)] text-[var(--step-3)] font-bold tracking-[-0.02em] leading-none">
                    อีเวนต์ในมหาวิทยาลัย & จ.นครปฐม
                  </h2>
                  <p className="mt-1 text-xs text-[var(--ink-3)] font-[var(--font-mono)]">
                    ภาพและข้อมูลกิจกรรมส่งตรงจากฐานข้อมูลจริงทั่วจังหวัดนครปฐม
                  </p>
                </div>
                <Link
                  href="/events"
                  className="btn-secondary self-start sm:self-auto text-xs font-bold flex items-center gap-1.5 shrink-0"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)", padding: "8px 14px" }}
                >
                  <span>ดูงานวิ่งทั้งหมด ({dbEvents.length} งาน)</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid gap-[var(--space-m)] sm:grid-cols-2 lg:grid-cols-3">
                {formattedHeroEvents.slice(0, 6).map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    viewMode="grid"
                    onSelect={(selected) => setSelectedEvent(selected)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom — hairline rule, not card */}
          <FadeContent delay={420} duration={0.6}>
            <div id="events" className="mt-[var(--space-xl)] flex flex-wrap items-center justify-between gap-[var(--space-s)] border-t pt-[var(--space-s)]" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-[var(--space-m)]">
                <div className="hidden items-center gap-[var(--space-2xs)] sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center" style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}>
                    <Clock size={16} style={{ color: "var(--accent)" }} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">จับเวลาชิปไทม์</div>
                    <div className="font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)]">ทุกรายการ • RFID</div>
                  </div>
                </div>
                <div className="hidden h-8 w-px sm:block" style={{ background: "var(--line)" }} />
                <div className="flex items-center gap-[var(--space-xs)]">
                  <span className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.12em] text-[var(--ink-3)]">PARTNERS</span>
                  <div className="flex items-center gap-[var(--space-2xs)]">
                    {["THAI RUN", "RUNRIO", "GO2RUN"].map((p) => (
                      <span key={p} className="px-2.5 py-1 font-[var(--font-bib)] text-[11px] font-black tracking-[0.08em] text-[var(--ink-3)]" style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[var(--space-2xs)] font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)]">
                <span className="hidden sm:inline">เลื่อนดูงานทั้งหมด</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius)]" style={{ background: "var(--surface)", border: "var(--border)" }}>
                  <ArrowDown size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                </span>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      <footer className="border-t py-[var(--space-s)]" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col items-center justify-between gap-[var(--space-2xs)] px-[var(--space-s)] font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)] sm:flex-row lg:px-[var(--space-m)]">
          <span>© 2026 IT RUNWAY — Made for runners in Nakhon Pathom. Dark mode only. Yellow always.</span>
          <span className="flex items-center gap-[var(--space-2xs)] font-bold tracking-[0.12em]">
            <span className="h-1.5 w-8 rounded-[var(--radius)]" style={{ background: "var(--accent)" }} aria-hidden />
            NAKHON PATHOM RUN CAPITAL
          </span>
        </div>
      </footer>

      {/* Quick View Event Dialog */}
      <EventDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  );
}
