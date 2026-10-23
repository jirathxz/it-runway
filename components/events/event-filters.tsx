"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";

export interface FilterState {
  search: string;
  category: string;
  distance: string;
  location: string;
  month: string;
  status: string;
  sort: string;
}

interface EventFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "road", label: "วิ่งถนน" },
  { id: "trail", label: "เทรล" },
  { id: "cycling", label: "ปั่นจักรยาน" },
  { id: "triathlon", label: "ไตรกีฬา" },
];

export const DISTANCES = [
  { id: "all", label: "ทุกระยะ" },
  { id: "5k", label: "5 KM (Fun Run)" },
  { id: "10k", label: "10 KM (Mini)" },
  { id: "21k", label: "21 KM (Half)" },
  { id: "42k", label: "42 KM (Marathon)" },
];

export const LOCATIONS = [
  { id: "all", label: "ทุกสถานที่" },
  { id: "muang", label: "เมืองนครปฐม (องค์พระปฐมเจดีย์)" },
  { id: "salaya", label: "ศาลายา / พุทธมณฑล / มหิดล" },
  { id: "samphran", label: "สามพราน" },
  { id: "kamphaengsaen", label: "กำแพงแสน (ม.เกษตรศาสตร์)" },
  { id: "nakhonchaisi", label: "นครชัยศรี" },
];

export const MONTHS = [
  { id: "all", label: "ตลอดทั้งปี 2026" },
  { id: "mar", label: "มีนาคม 2026" },
  { id: "apr", label: "เมษายน 2026" },
  { id: "may", label: "พฤษภาคม 2026" },
  { id: "jun", label: "มิถุนายน 2026" },
];

export const SORTS = [
  { id: "date_asc", label: "วันที่จัดงาน (เร็วที่สุด)" },
  { id: "price_asc", label: "ราคา (ต่ำไปสูง)" },
  { id: "price_desc", label: "ราคา (สูงไปต่ำ)" },
  { id: "distance_desc", label: "ระยะทาง (มากไปน้อย)" },
];

export function EventFilters({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
}: EventFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchedSuggestions = React.useMemo(() => {
    if (!filters.search.trim()) return [];
    const q = filters.search.toLowerCase().trim();
    const list = [
      "NPRU Campus Fun Run",
      "พระปฐมเจดีย์ มินิมาราธอน",
      "พระราชวังสนามจันทร์",
      "10K",
      "21K",
      "5K",
      "42K",
      "กำแพงแสน",
      "พุทธมณฑล",
      "ศาลายา",
      "สามพราน",
      "ดอนตูม",
      "นครชัยศรี",
      "วิ่งเทรล",
      "วิ่งถนน",
    ];
    return list.filter(
      (item) => item.toLowerCase().includes(q) && item.toLowerCase() !== q
    ).slice(0, 5);
  }, [filters.search]);

  // Calculate active filter count (excluding default 'all' values)
  const activeCount = [
    filters.category !== "all" ? 1 : 0,
    filters.distance !== "all" ? 1 : 0,
    filters.location !== "all" ? 1 : 0,
    filters.month !== "all" ? 1 : 0,
    filters.status !== "all" ? 1 : 0,
    filters.search.trim() !== "" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, search: val });
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (val: string) => {
    onFilterChange({ ...filters, search: val });
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Search Bar & Quick Filters Bar */}
      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4 shadow-[var(--shadow-near)] flex flex-col gap-3">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--accent)]" />
            <Input
              type="text"
              value={filters.search}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหาชื่องานวิ่ง, ระยะทาง, หรือสถานที่จัดงาน..."
              className="pl-10 pr-9 bg-[var(--surface-2)] border-[var(--line)] text-xs sm:text-sm h-11"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface)] cursor-pointer"
                aria-label="ล้างการค้นหา"
              >
                <X className="size-3.5" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showSuggestions && matchedSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="text-[10px] font-mono text-[var(--ink-3)] px-2 py-1 uppercase">
                  คำแนะนำค้นหา (Suggestions)
                </div>
                {matchedSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--ink)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Search className="size-3 text-[var(--accent)] shrink-0" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Selects (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Distance Select */}
            <div className="relative">
              <select
                value={filters.distance}
                onChange={(e) =>
                  onFilterChange({ ...filters, distance: e.target.value })
                }
                className="h-11 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 pr-8 text-xs font-[var(--font-text)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none cursor-pointer appearance-none"
              >
                {DISTANCES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
            </div>

            {/* Location Select */}
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) =>
                  onFilterChange({ ...filters, location: e.target.value })
                }
                className="h-11 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 pr-8 text-xs font-[var(--font-text)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none cursor-pointer appearance-none max-w-[200px]"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
            </div>
          </div>

          {/* Mobile Filter Trigger Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 h-11 text-xs font-semibold"
          >
            <SlidersHorizontal className="size-4 text-[var(--accent)]" />
            <span>ตัวกรองทั้งหมด</span>
            {activeCount > 0 && (
              <Badge variant="accent" size="sm" className="size-5 p-0 justify-center">
                {activeCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-x touch-pan-x w-full">
          <div className="flex items-center gap-1.5 shrink-0 py-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({ ...filters, category: cat.id })
                  }
                  className={cn(
                    "flex h-9 sm:h-8 items-center gap-1.5 rounded-[var(--radius)] border px-3.5 sm:px-3 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow-sm"
                      : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:border-[var(--ink-3)] hover:text-[var(--ink)] active:scale-95"
                  )}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters button if active */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-[var(--ink-3)] hover:text-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer shrink-0 ml-auto pl-2"
            >
              <RotateCcw className="size-3" />
              <span>ล้างตัวกรอง ({activeCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header: Count & Sort & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs text-[var(--ink-2)] font-[var(--font-mono)]">
          <span>
            พบ <strong className="text-[var(--accent)]">{filteredCount}</strong> จาก{" "}
            {totalCount} งานวิ่ง
          </span>
          {activeCount > 0 && (
            <span className="hidden sm:inline-block text-[var(--ink-3)]">
              (ใช้ {activeCount} ตัวกรอง)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) =>
                onFilterChange({ ...filters, sort: e.target.value })
              }
              className="h-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-2.5 pr-7 text-xs font-[var(--font-text)] text-[var(--ink-2)] focus:border-[var(--accent)] focus:outline-none cursor-pointer appearance-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-[var(--ink-3)]" />
          </div>

          {/* View Mode Switcher (Grid / List) */}
          <div className="hidden sm:flex items-center rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "flex size-7 items-center justify-center rounded-[calc(var(--radius)-2px)] transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--ink-3)] hover:text-[var(--ink)]"
              )}
              aria-label="มุมมองตาราง"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "flex size-7 items-center justify-center rounded-[calc(var(--radius)-2px)] transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--ink-3)] hover:text-[var(--ink)]"
              )}
              aria-label="มุมมองรายการ"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over Modal / Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-[var(--surface)] border-l border-[var(--line)] p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[var(--accent)]" />
                  <h3 className="font-[var(--font-display)] text-base font-bold text-[var(--ink)]">
                    ตัวกรองงานวิ่ง
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="size-7 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Filter: Categories */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--ink)] font-[var(--font-mono)] uppercase">
                  หมวดหมู่กีฬา
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({ ...filters, category: cat.id })
                      }
                      className={cn(
                        "h-9 rounded-[var(--radius)] border px-3 text-xs font-semibold transition-all text-left flex items-center justify-between",
                        filters.category === cat.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold"
                          : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]"
                      )}
                    >
                      <span>{cat.label}</span>
                      {filters.category === cat.id && (
                        <Check className="size-3 text-[var(--accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter: Distances */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--ink)] font-[var(--font-mono)] uppercase">
                  ระยะทาง
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {DISTANCES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({ ...filters, distance: d.id })
                      }
                      className={cn(
                        "h-9 rounded-[var(--radius)] border px-3 text-xs font-semibold transition-all text-left flex items-center justify-between",
                        filters.distance === d.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-bold"
                          : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]"
                      )}
                    >
                      <span>{d.label}</span>
                      {filters.distance === d.id && (
                        <Check className="size-3 text-[var(--accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter: Locations */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--ink)] font-[var(--font-mono)] uppercase">
                  สถานที่ / อำเภอ
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    onFilterChange({ ...filters, location: e.target.value })
                  }
                  className="h-10 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Month */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--ink)] font-[var(--font-mono)] uppercase">
                  ช่วงเวลา
                </label>
                <select
                  value={filters.month}
                  onChange={(e) =>
                    onFilterChange({ ...filters, month: e.target.value })
                  }
                  className="h-10 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {MONTHS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="mt-8 flex flex-col gap-2 border-t border-[var(--line)] pt-4">
              <Button
                onClick={() => setMobileFilterOpen(false)}
                className="h-11 w-full font-bold text-xs"
              >
                ดู {filteredCount} งานวิ่งที่ตรงกัน
              </Button>
              {activeCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onReset();
                    setMobileFilterOpen(false);
                  }}
                  className="h-10 w-full text-xs text-[var(--ink-2)]"
                >
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
