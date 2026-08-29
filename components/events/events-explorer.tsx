"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EventCard,
  EventItem,
} from "@/components/events/event-card";
import {
  EventFilters,
  FilterState,
} from "@/components/events/event-filters";
import { EventDialog } from "@/components/events/event-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Compass,
  Footprints,
  Calendar,
  MapPin,
  Sparkles,
  SearchX,
  RotateCcw,
  Database,
  Zap,
} from "lucide-react";

interface EventsExplorerProps {
  initialEvents: EventItem[];
}

export function EventsExplorer({ initialEvents }: EventsExplorerProps) {
  const searchParams = useSearchParams();
  const [eventsList, setEventsList] = React.useState<EventItem[]>(initialEvents);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Sync state if initialEvents changes
  React.useEffect(() => {
    setEventsList(initialEvents);
  }, [initialEvents]);

  // Filter State
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    category: "all",
    distance: "all",
    location: "all",
    month: "all",
    status: "all",
    sort: "date_asc",
  });

  // Sync with URL Query Parameters (e.g. /events?q=10K)
  React.useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    const dist = searchParams.get("distance");
    if (q || cat || dist) {
      setFilters((prev) => ({
        ...prev,
        search: q ?? prev.search,
        category: cat ?? prev.category,
        distance: dist ?? prev.distance,
      }));
    }
  }, [searchParams]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      distance: "all",
      location: "all",
      month: "all",
      status: "all",
      sort: "date_asc",
    });
  };

  const handleOpenDialog = (event: EventItem) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  // Filter & Sorting Logic
  const filteredEvents = React.useMemo(() => {
    return eventsList
      .filter((ev) => {
        // Keyword Search (Title, Location, Distance)
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchTitle = ev.title.toLowerCase().includes(q);
          const matchLoc = ev.location.toLowerCase().includes(q);
          const matchDist = ev.distance.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchDist) return false;
        }

        // Category Filter
        if (filters.category !== "all") {
          if (ev.category !== filters.category) return false;
        }

        // Distance Filter
        if (filters.distance !== "all") {
          const distCode = filters.distance.toLowerCase();
          if (distCode === "5k" && !ev.distance.includes("5")) return false;
          if (distCode === "10k" && !ev.distance.includes("10")) return false;
          if (distCode === "21k" && !ev.distance.includes("21")) return false;
          if (distCode === "42k" && !ev.distance.includes("42")) return false;
        }

        // Location Filter
        if (filters.location !== "all") {
          const loc = filters.location;
          if (loc === "muang" && !ev.location.includes("เมือง") && !ev.location.includes("มาลัยแมน") && !ev.location.includes("ราชภัฏ")) return false;
          if (loc === "salaya" && !ev.location.includes("ศาลายา") && !ev.location.includes("พุทธมณฑล") && !ev.location.includes("มหิดล")) return false;
          if (loc === "samphran" && !ev.location.includes("สามพราน")) return false;
          if (loc === "kamphaengsaen" && !ev.location.includes("กำแพงแสน")) return false;
          if (loc === "nakhonchaisi" && !ev.location.includes("นครชัยศรี")) return false;
        }

        // Month Filter
        if (filters.month !== "all") {
          const m = filters.month;
          if (m === "mar" && !ev.date.includes("มี.ค.")) return false;
          if (m === "apr" && !ev.date.includes("เม.ย.")) return false;
          if (m === "may" && !ev.date.includes("พ.ค.")) return false;
          if (m === "jun" && !ev.date.includes("มิ.ย.")) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === "price_asc") return a.price - b.price;
        if (filters.sort === "price_desc") return b.price - a.price;
        return 0; // default order
      });
  }, [eventsList, filters]);

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-[var(--font-mono)] text-[var(--ink-3)]"
      >
        <Link
          href="/"
          className="hover:text-[var(--accent)] transition-colors"
        >
          หน้าหลัก
        </Link>
        <ChevronRight className="size-3 text-[var(--line)]" />
        <span className="text-[var(--ink)] font-bold">ค้นหางานวิ่ง</span>
      </nav>

      {/* Page Header Banner */}
      <div className="relative rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-[var(--shadow-far)] overflow-hidden">
        {/* Subtle Background Glow & Runway Stripe */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm" className="font-bold">
                NAKHON PATHOM RUNWAY
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[var(--font-display)] tracking-tight text-[var(--ink)]">
              ค้นหาและสมัครงานวิ่ง
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
              กิจกรรมงานวิ่ง มาราธอน เทรล ปั่นจักรยาน และไตรกีฬาทั่วจังหวัดนครปฐม ข้อมูลอัปเดตแบบเรียลไทม์
            </p>
          </div>

          {/* Quick Counter Card */}
          <div className="flex items-center gap-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--radius)] px-5 py-3.5 shrink-0">
            <div>
              <span className="font-[var(--font-mono)] text-[10px] uppercase text-[var(--ink-3)] block">
                งานวิ่งทั้งหมดในระบบ
              </span>
              <span className="font-[var(--font-bib)] text-3xl font-black text-[var(--accent)] leading-none tabular-nums">
                {eventsList.length}
                <span className="text-xs font-normal text-[var(--ink-2)] ml-1">
                  รายการ
                </span>
              </span>
            </div>
            <div className="size-10 rounded-[var(--radius)] bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
              <Compass className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar Component */}
      <EventFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        totalCount={eventsList.length}
        filteredCount={filteredEvents.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Events Grid / List / Empty State */}
      {filteredEvents.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              : "flex flex-col gap-4"
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              viewMode={viewMode}
              onSelect={handleOpenDialog}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 shadow-[var(--shadow-near)]">
          <div className="size-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-3)]">
            <SearchX className="size-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-[var(--ink)]">
              ไม่พบงานวิ่งที่ตรงกับเงื่อนไขการค้นหา
            </h3>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              ลองปรับเปลี่ยนคำค้นหา ปรับระยะทาง หรือล้างตัวกรองทั้งหมดเพื่อดูงานวิ่งทั้งหมดในระบบ
            </p>
          </div>
          <Button
            variant="default"
            size="default"
            onClick={handleResetFilters}
            className="mt-2 font-bold text-xs"
          >
            <RotateCcw className="size-4" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </Button>
        </div>
      )}

      {/* Bottom Pagination / Results Info */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--line)] pt-6 mt-2">
          <span className="font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
            แสดง 1 - {filteredEvents.length} จาก {filteredEvents.length} รายการ
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 text-xs font-[var(--font-mono)] opacity-50"
            >
              ย้อนกลับ
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 size-8 p-0 text-xs font-bold font-[var(--font-mono)]"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 text-xs font-[var(--font-mono)] opacity-50"
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      {/* Quick View Event Dialog Modal */}
      <EventDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
