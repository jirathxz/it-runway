"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EventItem } from "@/components/events/event-card";
import { EventDialog } from "@/components/events/event-dialog";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Clock,
  Timer,
  Search,
  Grid3X3,
  List,
  Sparkles,
  Share2,
  Download,
  Flame,
  Footprints,
  Compass,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

interface CalendarViewProps {
  initialEvents: EventItem[];
}

const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const MONTH_SHORT_TH = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const DAY_NAMES_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAY_NAMES_FULL_TH = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "road", label: "วิ่งถนน" },
  { id: "trail", label: "เทรล" },
  { id: "cycling", label: "ปั่นจักรยาน" },
  { id: "triathlon", label: "ไตรกีฬา" },
];

export function CalendarView({ initialEvents }: CalendarViewProps) {
  // Parse event dates and enrich
  const parsedEvents = React.useMemo(() => {
    return initialEvents.map((ev) => {
      // Parse ISO / date string or fallback
      const dateObj = new Date(ev.date);
      const isDateValid = !isNaN(dateObj.getTime());
      return {
        ...ev,
        dateObj: isDateValid ? dateObj : new Date("2026-03-15T05:30:00+07:00"),
        year: isDateValid ? dateObj.getFullYear() : 2026,
        month: isDateValid ? dateObj.getMonth() : 2, // 0-indexed
        day: isDateValid ? dateObj.getDate() : 15,
        isoDate: isDateValid
          ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
          : "2026-03-15",
      };
    });
  }, [initialEvents]);

  // Find initial month (earliest event month in 2026, e.g. March = 2)
  const initialYear = 2026;
  const initialMonth = 2; // March 2026

  const [currentYear, setCurrentYear] = React.useState(initialYear);
  const [currentMonth, setCurrentMonth] = React.useState(initialMonth);
  const [selectedDate, setSelectedDate] = React.useState<string | null>("2026-03-15");
  const [viewMode, setViewMode] = React.useState<"month" | "timeline">("month");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);

  // Filter events
  const filteredEvents = React.useMemo(() => {
    return parsedEvents.filter((ev) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (ev.category !== selectedCategory) {
          const lowerTitle = ev.title.toLowerCase();
          if (selectedCategory === "trail" && !lowerTitle.includes("trail") && !lowerTitle.includes("เทรล")) return false;
          if (selectedCategory === "cycling" && !lowerTitle.includes("cycling") && !lowerTitle.includes("จักรยาน")) return false;
          if (selectedCategory === "triathlon" && !lowerTitle.includes("triathlon") && !lowerTitle.includes("ไตรกีฬา")) return false;
          if (selectedCategory === "road" && (lowerTitle.includes("trail") || lowerTitle.includes("cycling") || lowerTitle.includes("triathlon") || lowerTitle.includes("เทรล"))) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchLocation = ev.location.toLowerCase().includes(q);
        const matchDistance = ev.distance.toLowerCase().includes(q);
        if (!matchTitle && !matchLocation && !matchDistance) return false;
      }

      return true;
    });
  }, [parsedEvents, selectedCategory, searchQuery]);

  // Events grouped by ISO Date string ("YYYY-MM-DD")
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, typeof parsedEvents>();
    filteredEvents.forEach((ev) => {
      const list = map.get(ev.isoDate) || [];
      list.push(ev);
      map.set(ev.isoDate, list);
    });
    return map;
  }, [filteredEvents]);

  // Event counts by month (for year navigation pills)
  const eventCountByMonth = React.useMemo(() => {
    const counts = Array(12).fill(0);
    parsedEvents.forEach((ev) => {
      if (ev.year === currentYear) {
        counts[ev.month] += 1;
      }
    });
    return counts;
  }, [parsedEvents, currentYear]);

  // Selected date events
  const selectedDayEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate.get(selectedDate) || [];
  }, [selectedDate, eventsByDate]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToEarliestEvent = () => {
    setCurrentYear(2026);
    setCurrentMonth(2); // March 2026
    setSelectedDate("2026-03-15");
  };

  // Generate calendar grid for currentYear & currentMonth
  const calendarGrid = React.useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const iso = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        month: prevM,
        year: prevY,
        isoDate: iso,
        isCurrentMonth: false,
        events: eventsByDate.get(iso) || [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        month: currentMonth,
        year: currentYear,
        isoDate: iso,
        isCurrentMonth: true,
        events: eventsByDate.get(iso) || [],
      });
    }

    // Next month overflow days (to fill 35 or 42 cells)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const iso = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        month: nextM,
        year: nextY,
        isoDate: iso,
        isCurrentMonth: false,
        events: eventsByDate.get(iso) || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDate]);

  // Download iCal / .ics file for an event
  const handleDownloadICS = (ev: EventItem) => {
    const d = new Date(ev.date);
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };
    const startStr = formatDate(d);
    const endDate = new Date(d.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration
    const endStr = formatDate(endDate);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//IT RUNWAY//Running Event Calendar//TH",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:ระยะทาง ${ev.distance} • ค่าสมัคร ${ev.price} บาท • RFID Chip Timing`,
      `LOCATION:${ev.location}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ev.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-near)]">

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" className="font-bold flex items-center gap-1.5">
                <CalendarIcon className="size-3" />
                CALENDAR {currentYear}
              </Badge>
              <span className="font-[var(--font-mono)] text-[11px] text-[var(--ink-3)]">
                {parsedEvents.length} กิจกรรมตลอดปี
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[var(--font-display)] tracking-tight text-[var(--ink)]">
              ปฏิทินงานวิ่ง & กิจกรรมกีฬา {currentYear}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
              วางแผนตารางซ้อมและเลือกสนามวิ่งทั่วจังหวัดนครปฐม ข้อมูลวันเวลา ปล่อยตัว และสถานะการรับสมัครแม่นยำทุกรายการ
            </p>
          </div>

          {/* Quick Stats & View Switcher */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-1">
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="h-8 gap-1.5 text-xs font-bold"
              >
                <Grid3X3 className="size-3.5" />
                <span className="hidden sm:inline">ปฏิทินรายเดือน</span>
                <span className="sm:hidden">ปฏิทิน</span>
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="h-8 gap-1.5 text-xs font-bold"
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">กำหนดการ / ไทม์ไลน์</span>
                <span className="sm:hidden">ไทม์ไลน์</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={jumpToEarliestEvent}
              className="h-8 text-xs font-[var(--font-mono)] font-bold border-[var(--line)] hover:border-[var(--accent)]"
            >
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              <span>เริ่ม มี.ค. 2026</span>
            </Button>
          </div>
        </div>

        {/* 12-Month Navigation Ribbon */}
        <div className="mt-6 pt-5 border-t border-[var(--line)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MONTH_SHORT_TH.map((mName, idx) => {
              const count = eventCountByMonth[idx];
              const isActive = currentMonth === idx;
              return (
                <button
                  key={mName}
                  onClick={() => {
                    setCurrentMonth(idx);
                    // If month has events, select first event date
                    const firstEv = parsedEvents.find((e) => e.year === currentYear && e.month === idx);
                    if (firstEv) {
                      setSelectedDate(firstEv.isoDate);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[62px] sm:min-w-[72px] flex-1 py-2 px-2 rounded-[var(--radius)] border transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-near)] scale-[1.03]"
                      : count > 0
                      ? "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface)]"
                      : "bg-transparent border-transparent text-[var(--ink-3)] opacity-40 hover:opacity-80"
                  )}
                >
                  <span className="font-[var(--font-display)] text-xs font-bold leading-tight">
                    {mName}
                  </span>
                  <span
                    className={cn(
                      "font-[var(--font-mono)] text-[10px] mt-0.5 font-semibold",
                      isActive ? "text-[var(--accent-ink)]" : count > 0 ? "text-[var(--accent)]" : "text-[var(--ink-3)]"
                    )}
                  >
                    {count > 0 ? `${count} งาน` : "-"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-3 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-[var(--radius)] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-[var(--ink)] text-[var(--base)]"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] border border-[var(--line)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)] pointer-events-none" />
          <Input
            type="text"
            placeholder="ค้นหาชื่องาน, สถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 h-8.5 text-xs bg-[var(--surface-2)] border-[var(--line)] focus-visible:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* Main Calendar View Content */}
      {viewMode === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Monthly Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] px-4 py-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold font-[var(--font-display)] text-[var(--ink)] flex items-center gap-2">
                  <span>{MONTH_NAMES_TH[currentMonth]}</span>
                  <span className="font-[var(--font-bib)] text-xl text-[var(--accent)] tracking-tight">
                    {currentYear}
                  </span>
                </h2>
                <Badge variant="surface" size="sm" className="hidden sm:inline-flex text-[10px]">
                  {calendarGrid.reduce((sum, d) => sum + (d.isCurrentMonth ? d.events.length : 0), 0)} งานในเดือนนี้
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={prevMonth}
                  className="size-8 rounded-[var(--radius)]"
                  title="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={nextMonth}
                  className="size-8 rounded-[var(--radius)]"
                  title="เดือนถัดไป"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-[var(--font-mono)] text-xs font-bold py-2 px-1 bg-[var(--surface-2)]/60 rounded-[var(--radius)] border border-[var(--line)]">
              {DAY_NAMES_TH.map((day, idx) => (
                <div
                  key={day}
                  className={cn(
                    "py-1",
                    idx === 0
                      ? "text-red-400"
                      : idx === 6
                      ? "text-amber-400"
                      : "text-[var(--ink-2)]"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarGrid.map((cell, idx) => {
                const hasEvents = cell.events.length > 0;
                const isSelected = selectedDate === cell.isoDate;
                const isWeekend = idx % 7 === 0 || idx % 7 === 6;

                return (
                  <button
                    key={`${cell.isoDate}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(cell.isoDate);
                    }}
                    aria-label={`${cell.dayNumber} เดือน${MONTH_NAMES_TH[cell.month]}${cell.events.length > 0 ? ` มี ${cell.events.length} กิจกรรม` : ""}`}
                    aria-pressed={selectedDate === cell.isoDate}
                    className={cn(
                      "group relative flex flex-col p-1.5 sm:p-2 min-h-[78px] sm:min-h-[105px] lg:min-h-[115px] rounded-[var(--radius-sm)] border transition-all cursor-pointer select-none text-left w-full",
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--surface-2)] ring-2 ring-[var(--accent)]/30 z-10 shadow-[var(--shadow-near)]"
                        : cell.isCurrentMonth
                        ? hasEvents
                          ? "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--ink-3)] hover:bg-[var(--surface-2)]"
                          : "bg-[var(--surface)] border-[var(--line)]/50 hover:border-[var(--line)]"
                        : "bg-[var(--surface)]/20 border-transparent opacity-30 pointer-events-none sm:pointer-events-auto"
                    )}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-5 sm:size-6 items-center justify-center rounded-full font-[var(--font-mono)] text-xs font-bold",
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : hasEvents
                            ? "text-[var(--ink)] font-extrabold"
                            : isWeekend
                            ? "text-[var(--ink-2)]"
                            : "text-[var(--ink-3)]"
                        )}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Event Count Indicator Dot / Badge */}
                      {hasEvents && (
                        <span className="flex items-center gap-1 font-[var(--font-mono)] text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-1 rounded">
                          <span className="size-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                          <span className="hidden sm:inline">{cell.events.length}</span>
                        </span>
                      )}
                    </div>

                    {/* Event Tag Snippets inside cell (Desktop) */}
                    <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                      {cell.events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(cell.isoDate);
                            setSelectedEvent(ev);
                          }}
                          className="hidden sm:flex flex-col gap-0.5 px-1.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--line)] text-left hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-all"
                        >
                          <div className="flex items-center gap-1 font-[var(--font-mono)] text-[9px] font-bold text-[var(--accent)] line-clamp-1">
                            <span className="size-1 rounded-full bg-[var(--positive)] shrink-0" />
                            {ev.distance}
                          </div>
                          <span className="font-[var(--font-display)] text-[10px] font-bold text-[var(--ink)] line-clamp-1 leading-tight">
                            {ev.title}
                          </span>
                        </div>
                      ))}

                      {cell.events.length > 2 && (
                        <span className="hidden sm:block text-[9px] font-[var(--font-mono)] text-[var(--ink-3)] font-bold text-center">
                          +{cell.events.length - 2} รายการ
                        </span>
                      )}

                      {/* Mobile indicator dots */}
                      {hasEvents && (
                        <div className="sm:hidden flex items-center justify-center gap-0.5 mt-auto pt-1">
                          {cell.events.map((_, i) => (
                            <span key={i} className="size-1.5 rounded-full bg-[var(--accent)]" />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Day Inspector & Event Details (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-24">
            <Card className="border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-near)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div>
                  <span className="font-[var(--font-mono)] text-[10px] uppercase text-[var(--accent)] font-bold block">
                    ตารางการแข่งขัน
                  </span>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--ink)]">
                    {selectedDate ? (
                      (() => {
                        const parts = selectedDate.split("-");
                        const y = parseInt(parts[0]);
                        const m = parseInt(parts[1]) - 1;
                        const d = parseInt(parts[2]);
                        const dayOfWeek = new Date(y, m, d).getDay();
                        return `${DAY_NAMES_FULL_TH[dayOfWeek]}ที่ ${d} ${MONTH_NAMES_TH[m]} ${y}`;
                      })()
                    ) : (
                      "เลือกวันที่ต้องการดู"
                    )}
                  </h3>
                </div>
                <Badge variant={selectedDayEvents.length > 0 ? "accent" : "surface"} size="sm">
                  {selectedDayEvents.length} กิจกรรม
                </Badge>
              </div>

              {/* Event List on Selected Date */}
              <div className="flex flex-col gap-4 mt-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="group flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-4 transition-all hover:border-[var(--accent)] hover:shadow-[var(--shadow-near)]"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative h-32 w-full overflow-hidden rounded-[var(--radius)] bg-[var(--surface)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600"}
                          alt={ev.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-black/30" />
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 backdrop-blur-sm text-[10px] font-[var(--font-mono)] font-bold text-white">
                          <span className="size-1.5 rounded-full bg-[var(--positive)] animate-pulse" />
                          <span>{ev.status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}</span>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <span className="font-[var(--font-mono)] text-[10px] font-bold text-[var(--accent)] bg-[var(--base)]/90 px-1.5 py-0.5 rounded border border-[var(--line)] backdrop-blur-sm">
                            {ev.distance}
                          </span>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
                          <span className="flex items-center gap-1 text-[var(--ink-2)] font-semibold">
                            <Clock className="size-3 text-[var(--accent)]" />
                            {ev.time || "05:30 น."}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[var(--positive)] font-bold">
                            <Timer className="size-3" />
                            RFID CHIP
                          </span>
                        </div>

                        <h4
                          onClick={() => setSelectedEvent(ev)}
                          className="font-[var(--font-display)] text-base font-bold text-[var(--ink)] leading-snug hover:text-[var(--accent)] cursor-pointer transition-colors line-clamp-2"
                        >
                          {ev.title}
                        </h4>

                        <p className="flex items-start gap-1 text-xs text-[var(--ink-2)] line-clamp-2">
                          <MapPin className="size-3.5 shrink-0 text-[var(--ink-3)] mt-0.5" />
                          <span>{ev.location}</span>
                        </p>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-1">
                        <div>
                          <span className="font-[var(--font-mono)] text-[9px] uppercase text-[var(--ink-3)] block">
                            ค่าสมัครเริ่มต้น
                          </span>
                          <span className="font-[var(--font-bib)] text-xl font-black text-[var(--ink)] tabular-nums">
                            {ev.price}.-
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleDownloadICS(ev)}
                            title="บันทึกลงปฏิทิน (.ics)"
                            className="size-8"
                          >
                            <Download className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedEvent(ev)}
                            className="h-8 font-bold text-xs gap-1"
                          >
                            <span>ดูรายละเอียด</span>
                            <ArrowUpRight className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface-2)]/40">
                    <CalendarIcon className="size-8 text-[var(--ink-3)] mb-2 stroke-[1.5]" />
                    <p className="font-[var(--font-display)] text-sm font-bold text-[var(--ink)]">
                      ไม่มีกิจกรรมในวันนี้
                    </p>
                    <p className="text-xs text-[var(--ink-3)] mt-1 max-w-xs">
                      ลองคลิกวันที่ที่มีจุดสีเหลืองบนปฏิทิน หรือคลิกเดือนอื่นด้านบนเพื่อดูรายการแข่งขัน
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={jumpToEarliestEvent}
                      className="mt-4 text-xs font-bold"
                    >
                      ดูงานวิ่งถัดไป (15 มี.ค.)
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Helper Box */}
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)]/60 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--accent)] font-[var(--font-mono)]">
                <Footprints className="size-4" />
                <span>คำแนะนำการวางแผน</span>
              </div>
              <p className="text-[var(--ink-2)] leading-relaxed">
                สนามแข่งส่วนใหญ่เริ่มปล่อยตัวเวลา 05:00 - 06:00 น. แนะนำให้ลงทะเบียนล่วงหน้าอย่างน้อย 2-4 สัปดาห์เพื่อรับเสื้อและ BIB ก่อนวันแข่งจริง
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline / Agenda List View */
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
          {/* Timeline Grouped By Month */}
          {Array.from(
            filteredEvents.reduce((acc, ev) => {
              const key = `${MONTH_NAMES_TH[ev.month]} ${ev.year}`;
              const list = acc.get(key) || [];
              list.push(ev);
              acc.set(key, list);
              return acc;
            }, new Map<string, typeof parsedEvents>())
          ).map(([monthYear, monthEvents]) => (
            <div key={monthYear} className="flex flex-col gap-4">
              {/* Month Divider Header */}
              <div className="flex items-center gap-3 sticky top-20 z-10 bg-[var(--base)]/90 backdrop-blur-md py-2 border-b border-[var(--line)]">
                <span className="size-3 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                  {monthYear}
                </h3>
                <Badge variant="secondary" size="sm" className="font-mono">
                  {monthEvents.length} รายการ
                </Badge>
              </div>

              {/* Event Timeline Cards */}
              <div className="flex flex-col gap-4 pl-4 sm:pl-6 border-l-2 border-[var(--line)] ml-1.5 space-y-2">
                {monthEvents.map((ev) => {
                  const d = ev.dateObj;
                  const dayName = DAY_NAMES_FULL_TH[d.getDay()];
                  const dayNum = d.getDate();

                  return (
                    <Card
                      key={ev.id}
                      className="group relative flex flex-col md:flex-row overflow-hidden border-[var(--line)] bg-[var(--surface)] transition-all hover:border-[var(--accent)] hover:shadow-[var(--shadow-near)]"
                    >
                      {/* Left Date Ribbon */}
                      <div className="flex md:flex-col items-center justify-between md:justify-center p-4 md:w-28 shrink-0 bg-[var(--surface-2)] border-b md:border-b-0 md:border-r border-[var(--line)] text-center">
                        <span className="font-[var(--font-mono)] text-xs font-semibold text-[var(--accent)]">
                          {dayName}
                        </span>
                        <span className="font-[var(--font-bib)] text-3xl sm:text-4xl font-black text-[var(--ink)] leading-none my-1">
                          {dayNum}
                        </span>
                        <span className="font-[var(--font-mono)] text-[10px] text-[var(--ink-3)]">
                          {ev.time || "05:30 น."}
                        </span>
                      </div>

                      {/* Photo Banner Thumbnail */}
                      <div className="relative h-44 md:h-auto md:w-56 md:min-w-[220px] shrink-0 overflow-hidden bg-[var(--surface-2)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.image || "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600"}
                          alt={ev.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-md text-[10px] font-[var(--font-mono)] font-bold text-white">
                          <span className="size-1.5 rounded-full bg-[var(--positive)] animate-pulse" />
                          <span>{ev.status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}</span>
                        </div>
                        <div className="absolute bottom-3 left-3 font-[var(--font-mono)] text-xs font-bold text-[var(--accent)] bg-[var(--base)]/80 px-2 py-0.5 rounded border border-[var(--line)] backdrop-blur-sm">
                          {ev.distance}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex flex-1 flex-col justify-between p-5 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
                            <span className="flex items-center gap-1 text-[var(--positive)] font-bold">
                              <Timer className="size-3.5" />
                              RFID CHIP TIMING
                            </span>
                            <span>•</span>
                            <span>จังหวัดนครปฐม</span>
                          </div>

                          <h4
                            onClick={() => setSelectedEvent(ev)}
                            className="font-[var(--font-display)] text-lg font-bold text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer transition-colors line-clamp-1"
                          >
                            {ev.title}
                          </h4>

                          <p className="flex items-center gap-1 text-xs text-[var(--ink-2)] line-clamp-1">
                            <MapPin className="size-3.5 shrink-0 text-[var(--ink-3)]" />
                            <span>{ev.location}</span>
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
                          <div>
                            <span className="font-[var(--font-mono)] text-[9px] uppercase text-[var(--ink-3)] block leading-none mb-0.5">
                              ค่าสมัครเริ่มต้น
                            </span>
                            <span className="font-[var(--font-bib)] text-2xl font-black text-[var(--ink)] leading-none tabular-nums">
                              {ev.price}
                              <span className="text-xs font-normal text-[var(--ink-3)] ml-0.5">บาท</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadICS(ev)}
                              className="h-9 text-xs gap-1"
                            >
                              <Download className="size-3.5" />
                              <span className="hidden sm:inline">ลงปฏิทิน</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setSelectedEvent(ev)}
                              className="h-9 font-bold text-xs gap-1"
                            >
                              <span>สมัครเลย</span>
                              <ChevronRight className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]">
              <CalendarIcon className="size-12 text-[var(--ink-3)] mb-3 stroke-[1.5]" />
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--ink)]">
                ไม่พบงานวิ่งตามเงื่อนไขที่ค้นหา
              </h3>
              <p className="text-xs text-[var(--ink-3)] mt-1 max-w-sm">
                ลองเปลี่ยนคำค้นหาหรือเลือกประเภทกิจกรรมทั้งหมด
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 text-xs font-bold"
              >
                ล้างตัวกรองทั้งหมด
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick View Event Dialog */}
      <EventDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  );
}
