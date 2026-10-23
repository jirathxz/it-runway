"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
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
import { Search, ChevronDown, ChevronRight, ArrowDown, Calendar, MapPin, Clock, Footprints } from "lucide-react";

const fallbackPexelsItems = [
  { image: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Thai Marathon Dawn" },
  { image: "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Nakhon Pathom Road" },
  { image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Trail Run" },
  { image: "https://images.pexels.com/photos/2774140/pexels-photo-2774140.jpeg?auto=compress&cs=tinysrgb&w=400", title: "City Run" },
  { image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Night Run Salaya" },
  { image: "https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Finisher" },
  { image: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Warm Up" },
  { image: "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg?auto=compress&cs=tinysrgb&w=400", title: "BIB Pickup" },
  { image: "https://images.pexels.com/photos/2377173/pexels-photo-2377173.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Street Run" },
  { image: "https://images.pexels.com/photos/1238961/pexels-photo-1238961.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Group Run" },
  { image: "https://images.pexels.com/photos/10313672/pexels-photo-10313672.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Marathon Crowd" },
  { image: "https://images.pexels.com/photos/767520/pexels-photo-767520.jpeg?auto=compress&cs=tinysrgb&w=400", title: "Sunrise Run" },
];

interface HomeViewProps {
  initialEvents: EventItem[];
  initialStats: {
    totalEvents: number;
    totalUsers: number;
    totalRegistrations: number;
  };
}

export function HomeView({ initialEvents = [], initialStats }: HomeViewProps) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ทุกประเภท");
  const [distance, setDistance] = useState("ทุกระยะ");
  const [wallItems, setWallItems] = useState(fallbackPexelsItems);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [effectsLoaded, setEffectsLoaded] = useState(false);

  // Defer background heavy effects until main thread is free
  useEffect(() => {
    const timer = setTimeout(() => {
      setEffectsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter events based on search and dropdowns
  const filteredEvents = initialEvents.filter((ev) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchLoc = ev.location.toLowerCase().includes(q);
      const matchDist = ev.distance.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchDist) return false;
    }

    if (type !== "ทุกประเภท") {
      const t = type.toLowerCase();
      const titleLower = ev.title.toLowerCase();
      if (t === "วิ่งถนน" && (titleLower.includes("trail") || titleLower.includes("เทรล") || titleLower.includes("จักรยาน"))) return false;
      if (t === "เทรล" && !titleLower.includes("trail") && !titleLower.includes("เทรล") && !ev.location.includes("ป่า")) return false;
      if (t === "ปั่นจักรยาน" && !titleLower.includes("cycling") && !titleLower.includes("จักรยาน")) return false;
      if (t === "ไตรกีฬา" && !titleLower.includes("triathlon") && !titleLower.includes("ไตรกีฬา")) return false;
    }

    if (distance !== "ทุกระยะ") {
      if (!ev.distance.includes(distance.replace(" KM", ""))) return false;
    }

    return true;
  });

  return (
    <div className="min-h-dvh bg-[var(--base)] text-[var(--ink)] overflow-x-hidden">
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
          {effectsLoaded && (
            <>
              {/* DriftWall: hidden on mobile (performance), visible sm+ with fewer cols */}
              <div className="absolute inset-0 opacity-[0.85] hidden sm:block">
                <DriftWall
                  items={wallItems}
                  columns={3}
                  tileWidth={220}
                  tileHeight={140}
                  gap={16}
                  radius={12}
                  tilt={12}
                  turn={-8}
                  perspective={1200}
                  depth={80}
                  speed={18}
                  direction="up"
                  variance={0.3}
                  parallax={0.4}
                  dim={0.85}
                  overlayColor="#09090B"
                  fade={0.35}
                />
              </div>
              <div className="absolute inset-0 opacity-[0.25]">
                <Aurora colorStops={["oklch(0.88 0.17 95)", "oklch(0.72 0.16 145)", "oklch(0.88 0.17 95 / 0.6)"]} blend={0.52} amplitude={0.8} speed={0.4} />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--base)]/10 via-[var(--base)]/60 to-[var(--base)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--base)]/70 via-transparent to-[var(--base)]/40" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-[0.22]" aria-hidden />

        <div className="relative mx-auto max-w-[var(--content-max)] px-4 sm:px-6 lg:px-8 pb-[var(--space-xl)] pt-[var(--space-l)] lg:pb-[var(--space-2xl)] lg:pt-[var(--space-xl)]" id="main-content">
          {/* 12-col skeleton */}
          <div className="grid gap-[var(--space-l)] md:grid-cols-2 md:gap-[var(--space-m)] lg:grid-cols-12 min-w-0">
            {/* LEFT — 7 cols */}
            <div className="md:col-span-1 lg:col-span-7 min-w-0">
              <FadeContent delay={0} duration={0.4} blur>
                <div
                  className="inline-flex items-center gap-[var(--space-xs)] px-[var(--space-xs)] py-[6px] max-w-full"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}
                >
                  <span className="flex items-center gap-[6px] font-[var(--font-mono)] text-[11px] font-bold tracking-[0.08em] text-[var(--ink-2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-[var(--radius)] opacity-75" style={{ background: "var(--accent)" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-[var(--radius)]" style={{ background: "var(--accent)" }} />
                    </span>
                    {initialEvents.length} EVENTS OPEN
                  </span>
                  <span className="hidden h-3 w-px sm:block" style={{ background: "var(--line)" }} />
                  <span className="hidden font-[var(--font-mono)] text-[11px] text-[var(--ink-3)] sm:block">อัปเดตแบบเรียลไทม์ • นครปฐม</span>
                </div>
              </FadeContent>

              {/* H1 */}
              <h1
                className="mt-[var(--space-m)] font-[var(--font-display)] font-bold tracking-[-0.02em] break-words"
                style={{ fontSize: "clamp(1.85rem, 6vw, var(--step-6))", lineHeight: 1.15 }}
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

              {/* Body */}
              <FadeContent delay={150} duration={0.4} blur>
                <p className="mt-[var(--space-s)] max-w-[68ch] text-[var(--step-0)] leading-[1.65] text-[var(--ink-2)] break-words" style={{ textWrap: "pretty" }}>
                  ศูนย์รวมงานวิ่ง ปั่นจักรยาน ไตรกีฬา และกีฬาทุกประเภททั่วไทย
                  <span className="font-semibold text-[var(--ink)]"> คัดมาเฉพาะงานคุณภาพในนครปฐม</span> — จบครบตั้งแต่ค้นหา จ่ายเงิน รับ BIB ถึงจับเวลาชิป
                </p>
              </FadeContent>

              {/* SEARCH */}
              <FadeContent delay={250} duration={0.4}>
                <div
                  className="mt-[var(--space-l)] p-2 sm:p-[var(--space-2xs)] w-full overflow-hidden"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-near)" }}
                >
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center w-full">
                    <div className="relative flex-1 min-w-0 flex items-center w-full">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่องาน เช่น City Run, Salaya"
                        className="field w-full pl-10 pr-4 placeholder:text-[var(--ink-3)]"
                        aria-label="ค้นหาชื่องานวิ่ง"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto">
                      <div className="relative w-full lg:w-[150px]">
                        <select value={type} onChange={(e) => setType(e.target.value)} className="field w-full appearance-none px-3 sm:px-4 pr-8 text-xs sm:text-sm cursor-pointer" aria-label="ประเภทกีฬา">
                          <option>ทุกประเภท</option>
                          <option>วิ่งถนน</option>
                          <option>เทรล</option>
                          <option>ปั่นจักรยาน</option>
                          <option>ไตรกีฬา</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      </div>
                      <div className="relative w-full lg:w-[130px]">
                        <select value={distance} onChange={(e) => setDistance(e.target.value)} className="field w-full appearance-none px-3 sm:px-4 pr-8 text-xs sm:text-sm cursor-pointer" aria-label="ระยะทาง">
                          <option>ทุกระยะ</option>
                          <option>5 KM</option>
                          <option>10 KM</option>
                          <option>21 KM</option>
                          <option>42 KM</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={14} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                      </div>
                    </div>
                    <Link href="/events" className="btn-primary w-full lg:w-auto shrink-0" style={{ height: "48px", borderRadius: "var(--radius)" }}>
                      <Search className="block shrink-0" size={16} strokeWidth={2} aria-hidden="true" />
                      <span className="leading-none">ค้นหา</span>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1 pt-3">
                    <span className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.08em] text-[var(--ink-3)]">ยอดนิยม:</span>
                    {["City Run", "ศาลายา", "21 KM", "เทรลสามพราน"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearch(tag)}
                        className="inline-flex items-center rounded-[var(--radius)] border px-2.5 py-1 font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors text-xs cursor-pointer"
                        style={{ borderColor: "var(--line)", background: "color-mix(in oklch, var(--surface-2) 60%, transparent)" }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeContent>

              {/* Categories */}
              <div className="mt-[var(--space-m)] scroll-x sm:overflow-visible flex sm:flex-wrap gap-[var(--space-2xs)] pb-1 sm:pb-0">
                {[
                  { label: "ทั้งหมด", count: initialEvents.length.toString(), active: true },
                  { label: "วิ่งถนน", count: initialEvents.filter(e => !e.title.toLowerCase().includes("trail") && !e.title.toLowerCase().includes("cycling") && !e.title.toLowerCase().includes("triathlon") && !e.title.toLowerCase().includes("เทรล")).length.toString() },
                  { label: "เทรล", count: initialEvents.filter(e => e.title.toLowerCase().includes("trail") || e.title.toLowerCase().includes("เทรล") || e.location.toLowerCase().includes("ป่า")).length.toString() },
                  { label: "ปั่นจักรยาน", count: initialEvents.filter(e => e.title.toLowerCase().includes("cycling") || e.title.toLowerCase().includes("จักรยาน")).length.toString() },
                  { label: "ไตรกีฬา", count: initialEvents.filter(e => e.title.toLowerCase().includes("triathlon") || e.title.toLowerCase().includes("ไตรกีฬา")).length.toString() },
                ].map((c) => (
                  <Link
                    key={c.label}
                    href="/events"
                    className="btn-ghost touch-target shrink-0"
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

              {/* Stats */}
              <div className="mt-[var(--space-l)] grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-s)] sm:gap-[var(--space-m)] border-t pt-[var(--space-m)]" style={{ borderColor: "var(--line)" }}>
                {[
                  { to: initialStats.totalEvents || initialEvents.length || 13, suffix: " งาน", label: "งานแข่งขัน", sub: "ในระบบนครปฐม" },
                  { to: initialStats.totalRegistrations || 210, suffix: " ครั้ง", label: "นักวิ่งลงทะเบียนแล้ว", sub: "อัปเดตแบบเรียลไทม์ • ชิปไทม์" },
                  { to: initialStats.totalUsers || 17, suffix: " ท่าน", label: "นักวิ่งในระบบ", sub: "ใช้จาก Profile จาก Users จริง" },
                ].map((s) => (
                  <div key={s.label} className="flex sm:block items-baseline sm:items-start gap-[var(--space-xs)] sm:gap-0">
                    <div className="numeric font-[var(--font-bib)] font-extrabold tracking-[-0.03em] text-[var(--ink)] shrink-0" style={{ fontSize: "var(--step-4)", lineHeight: 1 }}>
                      <CountUp to={s.to} suffix={s.suffix} decimals={0} duration={1.2} delay={0.2} />
                    </div>
                    <div className="sm:mt-[4px]">
                      <div className="text-[var(--step--1)] font-semibold text-[var(--ink)]">{s.label}</div>
                      <div className="font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)] uppercase hidden sm:block">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 5 cols */}
            <div className="relative md:col-span-1 lg:col-span-5 lg:pl-[var(--space-m)]">
              <FadeContent delay={200} duration={0.5} blur className="relative mx-auto max-w-[480px]">
                {/* Hairline rule + dot */}
                <div className="absolute -right-6 top-10 hidden h-[520px] w-px lg:block" style={{ background: "var(--line)" }} aria-hidden />
                <div className="absolute -right-6 top-10 hidden h-[7px] w-[7px] -translate-x-1/2 rounded-[var(--radius)] lg:block" style={{ background: "var(--accent)", boxShadow: "0 0 16px var(--accent-glow)" }} aria-hidden />

                {/* Giant BIB hanging */}
                <div
                  className="pointer-events-none absolute -left-10 -top-6 z-20 hidden select-none font-[var(--font-bib)] font-black leading-none tracking-[-0.06em] lg:block"
                  style={{ fontSize: "clamp(5rem, 10vw, 8rem)", color: "color-mix(in oklch, var(--accent) 14%, transparent)", WebkitTextStroke: "1px color-mix(in oklch, var(--accent) 22%, transparent)" }}
                  aria-hidden
                >
                  042
                </div>

                {initialEvents.length > 0 && (
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
                            {initialEvents[0].distance}
                          </span>
                        </div>

                        <div className="relative h-[256px] overflow-hidden bg-[var(--surface-2)]">
                          {/* Event Image Banner with Overlay */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={initialEvents[0].image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600"}
                            alt={initialEvents[0].title}
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
                              <div className="font-[var(--font-mono)] text-[10px] font-bold tracking-[0.12em] text-zinc-600 leading-none line-clamp-1">{initialEvents[0].title}</div>
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
                              {initialEvents[0].date}
                            </span>
                            <span className="numeric font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] text-[var(--accent)]">
                              {initialEvents[0].status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}
                            </span>
                          </div>
                          <h3 className="mt-[var(--space-2xs)] font-[var(--font-display)] text-[var(--step-2)] font-bold leading-none tracking-[-0.02em] text-[var(--ink)] line-clamp-1">
                            {initialEvents[0].title}
                          </h3>
                          <p className="mt-[4px] flex items-center gap-[6px] font-[var(--font-mono)] text-[11px] tracking-[0.06em] text-[var(--ink-3)] line-clamp-1">
                            <MapPin size={13} className="shrink-0 text-[var(--ink-3)]" />
                            {initialEvents[0].location} • {initialEvents[0].distance}
                          </p>
                          <div className="mt-[var(--space-s)] flex items-center justify-between">
                            <div>
                              <div className="font-[var(--font-mono)] text-[10px] tracking-[0.08em] text-[var(--ink-3)] uppercase">ค่าสมัครเริ่มต้น</div>
                              <div className="numeric font-[var(--font-bib)] text-[var(--step-2)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]">
                                {initialEvents[0].price}<span className="text-[var(--step--1)] font-medium text-[var(--ink-3)]">.-</span>
                              </div>
                            </div>
                            <Link href={`/events/${initialEvents[0].id}`} className="btn-primary" style={{ height: "44px" }}>
                              สมัครเลย
                              <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                )}

                {initialEvents.length > 1 && (
                  <div className="mt-[var(--space-xs)] grid grid-cols-2 gap-[var(--space-xs)]">
                    {initialEvents.slice(1, 3).map((ev, idx) => (
                      <FadeContent key={ev.id || ev.title} delay={300 + idx * 80} duration={0.4}>
                        <Link href={`/events/${ev.id}`} className="group card-interactive flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)" }}>
                          <div className="relative h-24 w-full overflow-hidden bg-[var(--surface-2)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ev.image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400"}
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
                            <span className="font-[var(--font-mono)] text-[10px] font-semibold text-[var(--ink-3)]">{ev.date}</span>
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
                    ))}
                  </div>
                )}
              </FadeContent>
            </div>
          </div>

          {/* Event cards in hero */}
          {filteredEvents.length > 0 && (
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
                  className="btn-secondary self-start sm:self-auto text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  style={{ background: "var(--surface)", border: "var(--border)", borderRadius: "var(--radius)", padding: "8px 14px" }}
                >
                  <span>ดูงานวิ่งทั้งหมด ({initialEvents.length} งาน)</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid gap-[var(--space-m)] sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.slice(0, 6).map((ev) => (
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

          {/* Bottom */}
          <FadeContent delay={300} duration={0.4}>
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
