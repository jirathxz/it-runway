"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Search,
  Timer,
  Footprints,
  Flame,
  Users,
  Compass,
  CheckCircle2,
  Printer,
  Download,
  X,
  FileText,
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  Medal,
  Activity,
  Layers,
  Filter,
  Camera,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { downloadCertificateImage, printCertificate } from "@/lib/certificate-canvas";
import { RunnerPhotosView } from "./runner-photos-view";

export interface FinisherResult {
  id: string;
  rank: number;
  genderRank: number;
  bib: string;
  name: string;
  image?: string;
  gender: "male" | "female";
  ageGroup: string;
  distance: string;
  category?: string;
  gunTime: string;
  chipTime: string;
  pace: string;
  club: string;
  splits: {
    km5?: string;
    km10?: string;
    km15?: string;
    finish: string;
  };
  eventTitle: string;
  eventDate: string;
  location: string;
}

export interface RaceEventSummary {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  distances: string[];
  image: string;
  totalFinishers: number;
  winningTime: string;
  winnerName: string;
  winnerClub: string;
  avgPace: string;
  weather: string;
  status: string;
}

export function ResultsView() {
  const [mainTab, setMainTab] = useState<"results" | "photos">("results");
  const [eventsList, setEventsList] = useState<RaceEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [finishers, setFinishers] = useState<FinisherResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventSwitching, setEventSwitching] = useState(false);

  // Event List Filters
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");

  // Leaderboard Filters
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<FinisherResult | null>(null);

  // Fetch initial events from database
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await fetch("/api/results");
        if (res.ok) {
          const data = await res.json();
          setEventsList(data.events || []);
        }
      } catch (err) {
        console.error("Failed to load race results events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Select an event to view detailed leaderboard
  const handleSelectEvent = async (eventId: string) => {
    setSelectedEventId(eventId);
    // Reset leaderboard filters
    setDistanceFilter("all");
    setGenderFilter("all");
    setAgeGroupFilter("all");
    setSearchQuery("");

    try {
      setEventSwitching(true);
      const res = await fetch(`/api/results?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setFinishers(data.results || []);
      }
    } catch (err) {
      console.error("Failed to load results for event:", err);
    } finally {
      setEventSwitching(false);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentEvent = useMemo(() => {
    return eventsList.find((e) => e.id === selectedEventId) || null;
  }, [eventsList, selectedEventId]);

  // Filtered Completed Events List for Stage 1
  const filteredEventsList = useMemo(() => {
    return eventsList.filter((e) => {
      if (eventCategoryFilter !== "all") {
        if (eventCategoryFilter === "21k" && !e.distance.includes("21")) return false;
        if (eventCategoryFilter === "10k" && !e.distance.includes("10")) return false;
        if (eventCategoryFilter === "5k" && !e.distance.includes("5")) return false;
        if (eventCategoryFilter === "trail" && !e.title.toLowerCase().includes("trail") && !e.distance.includes("Trail")) return false;
      }
      if (eventSearch.trim()) {
        const q = eventSearch.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.winnerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventsList, eventCategoryFilter, eventSearch]);

  // Filtered Finishers for Stage 2
  const filteredFinishers = useMemo(() => {
    return finishers.filter((f) => {
      // Distance
      if (
        distanceFilter !== "all" &&
        !f.distance.toLowerCase().includes(distanceFilter.toLowerCase())
      ) {
        return false;
      }
      // Gender
      if (genderFilter !== "all" && f.gender !== genderFilter) {
        return false;
      }
      // Age Group
      if (ageGroupFilter !== "all" && !f.ageGroup.includes(ageGroupFilter)) {
        return false;
      }
      // Search Query (BIB, Name, Club)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBib = f.bib.toLowerCase().includes(q);
        const matchName = f.name.toLowerCase().includes(q);
        const matchClub = f.club.toLowerCase().includes(q);
        if (!matchBib && !matchName && !matchClub) return false;
      }
      return true;
    });
  }, [finishers, distanceFilter, genderFilter, ageGroupFilter, searchQuery]);

  // Top 3 Podium
  const topPodium = useMemo(() => {
    return filteredFinishers.slice(0, 3);
  }, [filteredFinishers]);

  const handlePrintCertificate = () => {
    window.print();
  };

  const getInitials = (name: string) => {
    return name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "RN";
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--accent)]" />
        <span className="text-xs font-mono text-[var(--ink-3)]">
          กำลังโหลดข้อมูลผลการแข่งขันจากฐานข้อมูล...
        </span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: COMPLETED EVENTS DIRECTORY / CARD LIST (หน้าเลือกงานที่แข่งจบไปแล้ว)
  // =========================================================================
  if (!selectedEventId || !currentEvent) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Top Feature Mode Switcher */}
        <div className="grid grid-cols-1 sm:flex items-center gap-2 p-1.5 bg-[var(--surface-2)] rounded-2xl border border-[var(--line)] w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setMainTab("results")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              mainTab === "results"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <Trophy className="size-4" />
            <span>ผลการแข่งขัน & สถิติเวลา (Race Results)</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("photos")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              mainTab === "photos"
                ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <Camera className="size-4" />
            <span>ค้นหาภาพถ่ายนักวิ่งตาม BIB (Runner Photos)</span>
          </button>
        </div>

        {mainTab === "photos" ? (
          <RunnerPhotosView />
        ) : (
          <>
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[var(--surface)] via-[var(--surface-2)] to-[var(--surface)] p-5 sm:p-8 lg:p-10 shadow-[var(--shadow-far)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Badge
              variant="outline"
              className="font-mono text-xs text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10 font-bold uppercase tracking-wider"
            >
              <Trophy className="size-3.5 mr-1.5" />
              OFFICIAL TIMING & RACE RESULTS DIRECTORY
            </Badge>

            <span className="text-xs font-mono text-[var(--ink-3)]">
              NAKHON PATHOM TIMING SYSTEM • 2026
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-[var(--font-display)] text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight leading-tight">
              ผลการแข่งขันงานวิ่ง
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
              เลือกรายการแข่งขันที่เสร็จสิ้นแล้วด้านล่างเพื่อตรวจสอบสถิติเวลาอย่างเป็นทางการ (Official Gun & Chip Time) อันดับการแข่งขัน โพเดียมผู้ชนะ และออกใบรับรองผลการแข่งขันอิเล็กทรอนิกส์ (e-Certificate)
            </p>
          </div>

          {/* Quick Summary Counter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--line)]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <Trophy className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-3)] truncate">งานวิ่งบันทึกผลแล้ว</div>
                <div className="text-sm sm:text-lg font-bold font-mono text-[var(--ink)] truncate">
                  {eventsList.length} รายการ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Users className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-3)] truncate">นักวิ่งเข้าเส้นชัยสะสม</div>
                <div className="text-sm sm:text-lg font-bold font-mono text-emerald-400 truncate">
                  {eventsList.reduce((acc, e) => acc + e.totalFinishers, 0).toLocaleString()} คน
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Timer className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-3)] truncate">ระบบจับเวลา</div>
                <div className="text-xs sm:text-base font-bold font-mono text-amber-400 truncate">
                  RFID CHIP GATE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <FileText className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-3)] truncate">ใบรับรองผลแข่ง</div>
                <div className="text-xs sm:text-base font-bold font-mono text-indigo-400 truncate">
                  e-Certificate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar for Completed Events */}
        <Card className="border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-5 shadow-[var(--shadow-near)]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-3)]" />
              <Input
                type="search"
                placeholder="ค้นหารายการแข่งขัน, สถานที่จัดงาน หรือ แชมป์ประจำสนาม..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="pl-10 h-10 text-xs bg-[var(--base)]/70"
              />
            </div>

            {/* Filter Pills with Horizontal Touch Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-x touch-pan-x w-full md:w-auto">
              <button
                type="button"
                onClick={() => setEventCategoryFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  eventCategoryFilter === "all"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
              >
                ทั้งหมด ({eventsList.length})
              </button>
              <button
                type="button"
                onClick={() => setEventCategoryFilter("21k")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  eventCategoryFilter === "21k"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
              >
                21.1 KM (Half)
              </button>
              <button
                type="button"
                onClick={() => setEventCategoryFilter("10k")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  eventCategoryFilter === "10k"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
              >
                10.5 KM (Mini)
              </button>
              <button
                type="button"
                onClick={() => setEventCategoryFilter("5k")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  eventCategoryFilter === "5k"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
              >
                5 KM (Fun Run)
              </button>
              <button
                type="button"
                onClick={() => setEventCategoryFilter("trail")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  eventCategoryFilter === "trail"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
              >
                Trail Challenge
              </button>
            </div>
          </div>
        </Card>

        {/* Completed Race Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventsList.map((ev) => (
            <Card
              key={ev.id}
              onClick={() => handleSelectEvent(ev.id)}
              className="group cursor-pointer overflow-hidden border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] shadow-[var(--shadow-near)] hover:shadow-[var(--shadow-far)] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Event Image Banner with Status Badge */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Top Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-black font-mono font-bold text-[10px] shadow">
                    <CheckCircle2 className="size-3 mr-1" />
                    เสร็จสิ้นการแข่งขัน
                  </Badge>

                  <Badge variant="secondary" className="font-mono text-[10px] bg-black/60 backdrop-blur-md text-white border-white/20">
                    <Users className="size-3 mr-1 inline" />
                    {ev.totalFinishers} คน
                  </Badge>
                </div>

                {/* Date & Location overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold">
                    <Calendar className="size-3.5" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 truncate mt-0.5">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-base sm:text-lg font-bold text-[var(--ink)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
                    {ev.title}
                  </h3>

                  {/* Distance Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {ev.distances.map((d) => (
                      <Badge
                        key={d}
                        variant="surface"
                        className="font-mono text-[10px] bg-[var(--surface-2)] text-[var(--ink-2)]"
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Winner Snapshot Pill */}
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)] mb-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Trophy className="size-3" />
                      แชมป์ OVERALL
                    </span>
                    <span className="font-bold text-[var(--ink)]">{ev.winningTime} ชม.</span>
                  </div>
                  <div className="font-semibold text-[var(--ink)] truncate">
                    {ev.winnerName}
                  </div>
                  <div className="text-[10px] text-[var(--ink-3)] truncate">
                    {ev.winnerClub}
                  </div>
                </div>
              </CardContent>

              {/* Card Footer Button */}
              <CardFooter className="p-5 pt-0">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-[var(--accent)] text-[var(--accent-ink)] group-hover:brightness-110 font-bold text-xs shadow transition-all"
                >
                  <span>ดูผลการแข่งขันและสถิติเวลา</span>
                  <ChevronRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEventsList.length === 0 && (
          <Card className="p-12 text-center border-[var(--line)] bg-[var(--surface)]">
            <Trophy className="size-12 mx-auto text-[var(--ink-3)] mb-3" />
            <h4 className="font-bold text-lg text-[var(--ink)] mb-1">ไม่พบรายการแข่งขัน</h4>
            <p className="text-xs text-[var(--ink-2)] max-w-sm mx-auto mb-4">
              ลองปรับคำค้นหาหรือตัวกรองระยะทางเพื่อค้นหารายการแข่งขันที่ต้องการ
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEventSearch("");
                setEventCategoryFilter("all");
              }}
              className="text-xs"
            >
              ล้างตัวกรองทั้งหมด
            </Button>
          </Card>
        )}
      </>
    )}
    </div>
  );
}

  // =========================================================================
  // VIEW 2: DETAILED LEADERBOARD FOR SELECTED EVENT (หน้ารายละเอียดผลของงานที่เลือก)
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back Navigation Button */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedEventId(null)}
          className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer group"
        >
          <ArrowLeft className="size-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>กลับไปเลือกรายการแข่งขันอื่น</span>
        </Button>

        <Badge
          variant="outline"
          className="font-mono text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 uppercase"
        >
          <CheckCircle2 className="size-3 mr-1 inline" />
          OFFICIAL VERIFIED RESULTS
        </Badge>
      </div>

      {/* 1. Header Hero Banner for Selected Event */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[var(--surface)] via-[var(--surface-2)] to-[var(--surface)] p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-far)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold">
            <Timer className="size-4" />
            <span>RUNWAY CHIP TIMING GATE • OFFICIAL RESULTS</span>
          </div>

          <span className="text-xs font-mono text-[var(--ink-3)]">
            {currentEvent.date} • {currentEvent.location}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--ink)] tracking-tight leading-tight">
              {currentEvent.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
              ตารางสรุปผลเวลาอย่างเป็นทางการ ผู้นำโพเดียม และใบรับรองผลการแข่งขัน (e-Certificate)
            </p>
          </div>

          {/* Event Fast Switcher Dropdown */}
          <div className="lg:col-span-4 bg-[var(--base)]/80 p-3.5 rounded-2xl border border-[var(--line)] shadow-inner">
            <label className="block text-[11px] font-mono font-bold text-[var(--ink-3)] uppercase mb-1.5">
              สลับดูงานวิ่งอื่น:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => handleSelectEvent(e.target.value)}
              className="w-full h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            >
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Fast Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-3)]">ผู้วิ่งเข้าเส้นชัย</div>
              <div className="text-base sm:text-lg font-bold font-mono text-[var(--ink)]">
                {currentEvent.totalFinishers} คน
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Trophy className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-3)]">เวลาผู้ชนะอันดับ 1</div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400">
                {currentEvent.winningTime} ชม.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-3)]">Pace เฉลี่ยสนาม</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {currentEvent.avgPace} min/km
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Compass className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[var(--ink-3)]">สภาพอากาศวันแข่ง</div>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-400 truncate">
                {currentEvent.weather}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Podium Showcase (Top 3 Finishers with Pexels Avatars) */}
      {topPodium.length >= 3 && distanceFilter === "all" && searchQuery === "" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-[var(--ink)]">
                ผู้นำอันดับ Overall (Podium Top 3)
              </h2>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              OFFICIAL CHIP TIME
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rank 2 (Silver) */}
            <Card className="order-2 md:order-1 border-[var(--line)] bg-[var(--surface)] p-5 relative overflow-hidden shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-400/40 flex items-center gap-1"
                >
                  <Medal className="size-3 text-slate-400" />
                  <span>อันดับ 2 OVERALL</span>
                </Badge>
                <span className="font-mono text-xs text-[var(--ink-3)]">
                  BIB {topPodium[1].bib}
                </span>
              </div>
              <div className="my-4 flex items-center gap-3.5">
                <Avatar className="size-14 border-2 border-slate-400 shadow-md shrink-0">
                  <AvatarImage src={topPodium[1].image} alt={topPodium[1].name} />
                  <AvatarFallback className="font-mono font-bold text-xs bg-[var(--surface-2)] text-[var(--ink)]">
                    {getInitials(topPodium[1].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[var(--ink)] truncate">{topPodium[1].name}</h3>
                  <p className="text-xs text-[var(--ink-3)] truncate">{topPodium[1].club}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-[var(--ink)]">
                      {topPodium[1].chipTime}
                    </span>
                    <span className="font-mono text-xs text-[var(--ink-3)]">
                      Pace {topPodium[1].pace}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertificate(topPodium[1])}
                className="w-full text-xs cursor-pointer"
              >
                <FileText className="size-3.5 mr-1.5" />
                <span>ดู e-Certificate</span>
              </Button>
            </Card>

            {/* Rank 1 (Gold - Center) */}
            <Card className="order-1 md:order-2 border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-[var(--surface)] to-[var(--surface)] p-6 relative overflow-hidden shadow-xl flex flex-col justify-between transform md:-translate-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className="font-mono font-bold text-xs bg-amber-500 text-black shadow-md flex items-center gap-1"
                >
                  <Trophy className="size-3 text-black" />
                  <span>แชมป์อันดับ 1 OVERALL</span>
                </Badge>
                <span className="font-mono text-xs font-bold text-amber-400">
                  BIB {topPodium[0].bib}
                </span>
              </div>
              <div className="my-4 flex items-center gap-4">
                <Avatar className="size-16 border-2 border-amber-400 shadow-lg shrink-0">
                  <AvatarImage src={topPodium[0].image} alt={topPodium[0].name} />
                  <AvatarFallback className="font-mono font-bold text-sm bg-amber-500 text-black">
                    {getInitials(topPodium[0].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-[var(--font-display)] font-extrabold text-lg sm:text-xl text-[var(--ink)] truncate">
                    {topPodium[0].name}
                  </h3>
                  <p className="text-xs text-[var(--accent)] font-semibold truncate">
                    {topPodium[0].club}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
                      {topPodium[0].chipTime}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Pace {topPodium[0].pace}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedCertificate(topPodium[0])}
                className="w-full text-xs font-bold bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 shadow cursor-pointer"
              >
                <FileText className="size-3.5 mr-1.5" />
                <span>ดู e-Certificate ผู้ชนะ</span>
              </Button>
            </Card>

            {/* Rank 3 (Bronze) */}
            <Card className="order-3 md:order-3 border-[var(--line)] bg-[var(--surface)] p-5 relative overflow-hidden shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="font-mono font-bold text-xs bg-amber-900/30 text-amber-600 border-amber-600/40 flex items-center gap-1"
                >
                  <Medal className="size-3 text-amber-600" />
                  <span>อันดับ 3 OVERALL</span>
                </Badge>
                <span className="font-mono text-xs text-[var(--ink-3)]">
                  BIB {topPodium[2].bib}
                </span>
              </div>
              <div className="my-4 flex items-center gap-3.5">
                <Avatar className="size-14 border-2 border-amber-700 shadow-md shrink-0">
                  <AvatarImage src={topPodium[2].image} alt={topPodium[2].name} />
                  <AvatarFallback className="font-mono font-bold text-xs bg-[var(--surface-2)] text-[var(--ink)]">
                    {getInitials(topPodium[2].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[var(--ink)] truncate">{topPodium[2].name}</h3>
                  <p className="text-xs text-[var(--ink-3)] truncate">{topPodium[2].club}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-[var(--ink)]">
                      {topPodium[2].chipTime}
                    </span>
                    <span className="font-mono text-xs text-[var(--ink-3)]">
                      Pace {topPodium[2].pace}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertificate(topPodium[2])}
                className="w-full text-xs cursor-pointer"
              >
                <FileText className="size-3.5 mr-1.5" />
                <span>ดู e-Certificate</span>
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* 3. Filter & Search Controls */}
      <Card className="border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-[var(--shadow-near)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-3)]" />
            <Input
              type="search"
              placeholder="ค้นหาด้วยหมายเลข BIB, ชื่อนักวิ่ง หรือ ชมรม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-[var(--base)]/70"
            />
          </div>

          {/* Distance Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDistanceFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                distanceFilter === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              ทุกระยะทาง
            </button>
            <button
              type="button"
              onClick={() => setDistanceFilter("21.1")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                distanceFilter === "21.1"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              21.1 KM
            </button>
            <button
              type="button"
              onClick={() => setDistanceFilter("10.5")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                distanceFilter === "10.5"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              10.5 KM
            </button>
            <button
              type="button"
              onClick={() => setDistanceFilter("5")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                distanceFilter === "5"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
              )}
            >
              5 KM
            </button>
          </div>

          {/* Gender & Age Filters */}
          <div className="flex items-center gap-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--base)] px-3 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            >
              <option value="all">ทุกเพศ (All)</option>
              <option value="male">ชาย (Male)</option>
              <option value="female">หญิง (Female)</option>
            </select>

            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--base)] px-3 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            >
              <option value="all">ทุกรุ่นอายุ (Age)</option>
              <option value="18-29">18-29 ปี</option>
              <option value="30-39">30-39 ปี</option>
              <option value="40-49">40-49 ปี</option>
              <option value="50+">50+ ปี</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Leaderboard Results Table & Responsive Cards */}
      <Card className="overflow-hidden border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)]">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--surface-2)] border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-[var(--accent)]" />
            <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
              ตารางสรุปผลเวลาอย่างเป็นทางการ (Official Leaderboard)
            </span>
          </div>
          <span className="font-mono text-xs text-[var(--ink-3)]">
            พบ {filteredFinishers.length} รายการ
          </span>
        </div>

        {eventSwitching ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-[var(--accent)]" />
            <span className="text-xs font-mono text-[var(--ink-3)]">กำลังโหลดผลการแข่งขัน...</span>
          </div>
        ) : (
          <>
            {/* Desktop View: Clean Table with Athlete Avatars */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 font-mono text-[11px] text-[var(--ink-3)] uppercase">
                    <th className="py-3 px-4 font-bold">อันดับ</th>
                    <th className="py-3 px-4 font-bold">หมายเลข BIB</th>
                    <th className="py-3 px-4 font-bold">นักวิ่ง & สังกัด</th>
                    <th className="py-3 px-4 font-bold">รุ่นอายุ</th>
                    <th className="py-3 px-4 font-bold">ระยะทาง</th>
                    <th className="py-3 px-4 font-bold text-right">เวลาสุทธิ (Chip Time)</th>
                    <th className="py-3 px-4 font-bold text-right">Pace</th>
                    <th className="py-3 px-4 font-bold text-center">e-Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredFinishers.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-[var(--surface-2)]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {f.rank === 1 ? (
                          <span className="text-amber-400 flex items-center gap-1.5 font-black">
                            <Trophy className="size-4 text-amber-400" />
                            <span>1</span>
                          </span>
                        ) : f.rank === 2 ? (
                          <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                            <Medal className="size-4 text-slate-300" />
                            <span>2</span>
                          </span>
                        ) : f.rank === 3 ? (
                          <span className="text-amber-600 flex items-center gap-1.5 font-bold">
                            <Medal className="size-4 text-amber-600" />
                            <span>3</span>
                          </span>
                        ) : (
                          <span className="text-[var(--ink-2)]">#{f.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--ink)]">
                        <Badge variant="outline" className="font-mono text-xs">
                          {f.bib}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 border border-[var(--line)] shrink-0">
                            <AvatarImage src={f.image} alt={f.name} />
                            <AvatarFallback className="text-[10px] font-mono bg-[var(--surface-2)]">
                              {getInitials(f.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-[var(--ink)] truncate">{f.name}</div>
                            <div className="text-[11px] text-[var(--ink-3)] truncate max-w-[180px]">
                              {f.club}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--ink-2)]">
                        <div>{f.gender === "male" ? "ชาย (M)" : "หญิง (F)"}</div>
                        <div className="text-[10px] font-mono text-[var(--ink-3)]">{f.ageGroup}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="surface" className="font-mono text-[10px]">
                          {f.distance}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-right text-[var(--ink)]">
                        {f.chipTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-right text-emerald-400 font-semibold">
                        {f.pace}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCertificate(f)}
                          className="h-8 px-2 text-xs text-[var(--accent)] hover:text-[var(--accent-ink)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
                          title="ดูและดาวน์โหลด e-Certificate"
                        >
                          <FileText className="size-3.5 mr-1" />
                          <span>เกียรติบัตร</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Responsive Card List with Avatars */}
            <div className="md:hidden divide-y divide-[var(--line)]">
              {filteredFinishers.map((f) => (
                <div key={f.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-[var(--accent)]">
                        #{f.rank}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {f.bib}
                      </Badge>
                    </div>
                    <Badge variant="surface" className="font-mono text-[10px]">
                      {f.distance}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-[var(--line)] shrink-0">
                      <AvatarImage src={f.image} alt={f.name} />
                      <AvatarFallback className="text-xs font-mono bg-[var(--surface-2)]">
                        {getInitials(f.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[var(--ink)] truncate">{f.name}</h4>
                      <p className="text-xs text-[var(--ink-3)] truncate">{f.club}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--surface-2)] font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--ink-3)] block">CHIP TIME</span>
                      <span className="font-bold text-sm text-[var(--ink)]">{f.chipTime}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--ink-3)] block">AVG PACE</span>
                      <span className="font-bold text-sm text-emerald-400">{f.pace} min/km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[var(--ink-3)] font-mono">
                      {f.gender === "male" ? "ชาย" : "หญิง"} • {f.ageGroup}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCertificate(f)}
                      className="h-8 text-xs text-[var(--accent)] border-[var(--accent)]/30 cursor-pointer"
                    >
                      <FileText className="size-3.5 mr-1" />
                      <span>e-Certificate</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty Search State */}
        {!eventSwitching && filteredFinishers.length === 0 && (
          <div className="p-12 text-center">
            <Search className="size-10 mx-auto text-[var(--ink-3)] mb-3" />
            <h4 className="font-bold text-base text-[var(--ink)] mb-1">ไม่พบผลการค้นหา</h4>
            <p className="text-xs text-[var(--ink-2)] max-w-sm mx-auto mb-4">
              ลองเปลี่ยนคำค้นหา หมายเลข BIB หรือปรับตัวกรองระยะทางใหม่
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setDistanceFilter("all");
                setGenderFilter("all");
                setAgeGroupFilter("all");
              }}
              className="text-xs cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </Button>
          </div>
        )}
      </Card>

      {/* 5. e-Certificate Modal Dialog */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer z-10"
            >
              <X className="size-5" />
            </button>

            {/* Certificate Document (Crisp Solid White & Gold Parchment) */}
            <div className="rounded-2xl border-4 border-amber-600/40 bg-[#FAF9F5] text-slate-900 p-5 sm:p-8 shadow-xl text-center select-none relative my-2">
              {/* Inner Double Gold Frame */}
              <div className="border-2 border-amber-500/50 rounded-xl p-5 sm:p-8 bg-white relative shadow-sm">
                {/* Header: Organization & Timing System */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Footprints className="size-5 text-amber-800 stroke-[2.5]" />
                  <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-slate-700 uppercase">
                    IT RUNWAY TIMING SYSTEM • OFFICIAL TIMING PARTNER
                  </span>
                </div>

                <Sparkles className="size-4 text-amber-600 mx-auto mb-1" />

                <h2 className="text-2xl sm:text-4xl font-black text-amber-900 tracking-tight font-[var(--font-display)]">
                  FINISHER CERTIFICATE
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  เกียรติบัตรรับรองการเข้าร่วมและผลการแข่งขันอย่างเป็นทางการ
                </p>

                {/* Athlete Section */}
                <div className="my-5 py-4 border-y-2 border-slate-200/80">
                  <div className="flex justify-center mb-3">
                    <Avatar className="size-20 border-3 border-amber-500 shadow-md ring-4 ring-amber-100">
                      <AvatarImage src={selectedCertificate.image} alt={selectedCertificate.name} />
                      <AvatarFallback className="font-bold text-base bg-amber-50 text-amber-900">
                        {getInitials(selectedCertificate.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 my-1 font-[var(--font-display)]">
                    {selectedCertificate.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    {selectedCertificate.club ? `สังกัด: ${selectedCertificate.club} • ` : ""}หมายเลข BIB: #{selectedCertificate.bib}
                  </p>
                </div>

                {/* Event & Distance Accomplishment */}
                <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mx-auto">
                  ได้สำเร็จการแข่งขันในรายการ{" "}
                  <strong className="text-slate-950 font-bold">{selectedCertificate.eventTitle}</strong>
                  <br />
                  ระยะทาง <strong className="text-slate-950 font-bold">
                    {selectedCertificate.distance.toUpperCase().includes("KM") || selectedCertificate.distance.toUpperCase().includes("K")
                      ? selectedCertificate.distance
                      : `${selectedCertificate.distance} KM`}
                  </strong> • ประเภท {selectedCertificate.category || "Official Finisher"}
                </p>

                {/* Key Statistics Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 my-5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                  <div className="p-2">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">CHIP TIME</div>
                    <div className="text-base sm:text-2xl font-black text-slate-950 mt-0.5">
                      {selectedCertificate.chipTime}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Gun: {selectedCertificate.gunTime || selectedCertificate.chipTime}
                    </div>
                  </div>
                  <div className="p-2 border-x border-slate-200">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">AVG PACE</div>
                    <div className="text-base sm:text-2xl font-black text-emerald-600 mt-0.5">
                      {selectedCertificate.pace}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">min/km</div>
                  </div>
                  <div className="p-2">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">OVERALL RANK</div>
                    <div className="text-base sm:text-2xl font-black text-amber-700 mt-0.5">
                      อันดับ #{selectedCertificate.rank}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {selectedCertificate.gender === "female" ? "หญิง" : "ชาย"} ({selectedCertificate.ageGroup})
                    </div>
                  </div>
                </div>

                {/* Footer Signatures & Official Timing Seal */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-600 gap-3">
                  <div className="text-center sm:text-left">
                    <div className="font-bold text-slate-800">
                      {selectedCertificate.location || "จังหวัดนครปฐม (Nakhon Pathom)"}
                    </div>
                    <div className="text-[11px] text-slate-500">{selectedCertificate.eventDate}</div>
                  </div>

                  {/* Certified Timing Seal */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>OFFICIAL TIMING VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 mt-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertificate(null)}
                className="text-xs cursor-pointer"
              >
                ปิด
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCertificateImage(selectedCertificate)}
                className="border-amber-500/40 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-xs font-bold cursor-pointer"
              >
                <Download className="size-3.5 mr-1.5" />
                <span>ดาวน์โหลดรูป (PNG)</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => printCertificate(selectedCertificate)}
                className="bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-xs cursor-pointer shadow-md"
              >
                <Printer className="size-3.5 mr-1.5" />
                <span>สั่งพิมพ์ / เซฟเกียรติบัตร (PDF)</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
