"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Calendar,
  MapPin,
  Footprints,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  History,
  X,
  Compass,
  ArrowRight,
  Filter,
  Check,
  Tag,
  Loader2,
  Camera,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QrScannerDialog } from "@/components/organizer/qr-scanner-dialog";

export interface SearchResultItem {
  id: string;
  title: string;
  location: string;
  date: string;
  time?: string;
  distance: string;
  price: number;
  image?: string;
  status: string;
  category?: string;
}

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_SUGGESTIONS = [
  "NPRU Campus Fun Run",
  "พระปฐมเจดีย์ มินิมาราธอน",
  "พระราชวังสนามจันทร์",
  "10K",
  "21K",
  "กำแพงแสน",
  "พุทธมณฑล",
  "สามพราน",
  "ดอนตูม",
  "นครชัยศรี",
  "วิ่งเทรล",
];

const CATEGORY_TAGS = [
  { label: "ทั้งหมด", value: "" },
  { label: "5K Fun Run", value: "5" },
  { label: "10K Mini", value: "10" },
  { label: "21K Half", value: "21" },
  { label: "42K Marathon", value: "42" },
  { label: "เมืองนครปฐม", value: "เมือง" },
  { label: "ศาลายา", value: "ศาลายา" },
];

export function SearchCommandDialog({
  open,
  onOpenChange,
}: SearchCommandDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [events, setEvents] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [activeCategory, setActiveCategory] = React.useState("");
  const [scannerOpen, setScannerOpen] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load Recent Searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("it_runway_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch events once when dialog opens
  React.useEffect(() => {
    if (!open) return;

    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          const rawEvents = data.events || [];
          const items: SearchResultItem[] = rawEvents
            .filter((ev: any) => {
              const t = (ev.title || "").trim().toLowerCase();
              return t && !["ควย", "test", "asdf", "xxx"].includes(t);
            })
            .map((ev: any) => {
              const dt = new Date(ev.date);
              const thaiDate = dt.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              });
              const hours = dt.getUTCHours().toString().padStart(2, "0");
              const minutes = dt.getUTCMinutes().toString().padStart(2, "0");
              const timeStr = `${hours}:${minutes} น.`;

              return {
                id: ev.id,
                title: ev.title,
                location: ev.location,
                date: thaiDate,
                time: timeStr !== "00:00 น." ? timeStr : "05:30 น.",
                distance: ev.distance,
                price: ev.price,
                image: ev.image,
                status: ev.status || "open",
              };
            });
          setEvents(items);
        }
      } catch (err) {
        console.error("Failed to load events for search:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [open]);

  // Focus input on open
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveCategory("");
    }
  }, [open]);

  // Save query to recent searches
  const saveRecentSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("it_runway_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (e: React.MouseEvent, target: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== target);
      setRecentSearches(updated);
      localStorage.setItem("it_runway_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("it_runway_recent_searches");
    } catch {}
  };

  // Autocomplete Suggestions matching query
  const autocompleteSuggestions = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return POPULAR_SUGGESTIONS.filter(
      (item) => item.toLowerCase().includes(q) && item.toLowerCase() !== q
    ).slice(0, 4);
  }, [query]);

  // Filtered Events Results
  const filteredResults = React.useMemo(() => {
    let list = events;

    // Filter by category tag
    if (activeCategory) {
      const cat = activeCategory.toLowerCase();
      list = list.filter(
        (ev) =>
          ev.distance.toLowerCase().includes(cat) ||
          ev.location.toLowerCase().includes(cat) ||
          ev.title.toLowerCase().includes(cat)
      );
    }

    // Filter by text search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          ev.location.toLowerCase().includes(q) ||
          ev.distance.toLowerCase().includes(q)
      );
    }

    return list;
  }, [events, query, activeCategory]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectEvent(filteredResults[selectedIndex]);
      } else if (query.trim()) {
        handleSearchFull(query);
      }
    }
  };

  const handleSelectEvent = (event: SearchResultItem) => {
    saveRecentSearch(event.title);
    onOpenChange(false);
    router.push(`/events/${event.id}`);
  };

  const handleSearchFull = (text: string) => {
    saveRecentSearch(text);
    onOpenChange(false);
    router.push(`/events?q=${encodeURIComponent(text)}`);
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  // Helper function to highlight matching text
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-[var(--accent)]/30 text-[var(--accent)] font-bold rounded-sm px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88dvh] overflow-hidden p-0 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl flex flex-col">
        {/* Accessible Dialog Title for screen readers */}
        <DialogTitle className="sr-only">ค้นหางานวิ่งและกิจกรรมในนครปฐม</DialogTitle>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--surface-2)]/60 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาชื่องานวิ่ง, ระยะทาง (10K, 21K), หรือสถานที่..."
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              className="w-full bg-transparent text-sm sm:text-base font-[var(--font-text)] text-[var(--ink)] placeholder:text-[var(--ink-3)] !outline-none !ring-0 !border-none !shadow-none"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="size-7 rounded-lg text-[var(--ink-3)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--base)] font-mono text-[10px] text-[var(--ink-3)]">
              ESC
            </kbd>
          </div>
        </div>

        {/* Quick Filter Category Tags & QR Scanner Button */}
        <div className="px-3 sm:px-4 py-2 border-b border-[var(--line)] bg-[var(--surface)] flex items-center gap-1.5 overflow-x-auto scroll-x touch-pan-x w-full">
          <span className="text-[11px] font-mono text-[var(--ink-3)] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="size-3 text-[var(--accent)]" />
            ตัวกรอง:
          </span>
          {CATEGORY_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setActiveCategory(tag.value === activeCategory ? "" : tag.value);
                setSelectedIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0",
                activeCategory === tag.value
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-xs"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
              )}
            >
              {tag.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 shrink-0 ml-auto"
            title="สแกน QR Code"
          >
            <Camera className="size-3 text-emerald-400" />
            <span>สแกน QR</span>
          </button>
        </div>

        {/* Scrollable Results & Autocomplete Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5">
          {/* Autocomplete Suggestions Box */}
          {autocompleteSuggestions.length > 0 && (
            <div className="flex flex-col gap-2 animate-in fade-in">
              <span className="text-[11px] font-mono text-[var(--ink-3)] flex items-center gap-1.5">
                <Sparkles className="size-3 text-[var(--accent)]" />
                คำแนะนำค้นหาอัตโนมัติ (Autocomplete):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {autocompleteSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-xs font-medium text-[var(--ink)] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Search className="size-3 text-[var(--accent)]" />
                    <span>{highlightMatch(sug, query)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Section */}
          {filteredResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)]">
                <span className="flex items-center gap-1.5">
                  <Compass className="size-3.5 text-[var(--accent)]" />
                  พบ {filteredResults.length} งานวิ่งที่ตรงกัน
                </span>
                {query && (
                  <button
                    type="button"
                    onClick={() => handleSearchFull(query)}
                    className="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span>ดูผลทั้งหมดในหน้ารวมงานวิ่ง</span>
                    <ArrowRight className="size-3" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {filteredResults.map((ev, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => handleSelectEvent(ev)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group",
                        isSelected
                          ? "bg-[var(--surface-2)] border-[var(--accent)] shadow-md"
                          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink-3)]"
                      )}
                    >
                      {/* Left thumbnail & title */}
                      <div className="flex items-center gap-3 min-w-0">
                        {ev.image ? (
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="size-12 rounded-lg object-cover border border-[var(--line)] shrink-0"
                          />
                        ) : (
                          <div className="size-12 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                            <Footprints className="size-5" />
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {highlightMatch(ev.title, query)}
                          </span>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--ink-2)] font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-[var(--accent)]" />
                              {ev.date}
                            </span>
                            <span>•</span>
                            <span className="text-[var(--accent)] font-bold">
                              {ev.distance}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">
                              {highlightMatch(ev.location, query)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right price & action badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-[var(--font-bib)] text-base font-bold text-[var(--accent)]">
                          ฿{ev.price.toLocaleString()}
                        </span>
                        <ChevronRight className="size-4 text-[var(--ink-3)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State when no results match */}
          {filteredResults.length === 0 && !loading && (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="size-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-3)]">
                <Search className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">
                ไม่พบงานวิ่งที่ตรงกับคำว่า &quot;{query}&quot;
              </h4>
              <p className="text-xs text-[var(--ink-2)] max-w-sm">
                ลองค้นหาด้วยคำอื่น เช่น &quot;10K&quot;, &quot;21K&quot;, &quot;NPRU&quot;, หรือ &quot;นครปฐม&quot;
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("");
                  inputRef.current?.focus();
                }}
                className="mt-2 text-xs"
              >
                ล้างคำค้นหา
              </Button>
            </div>
          )}

          {/* Popular & Recent Searches section when query is empty */}
          {!query.trim() && (
            <div className="flex flex-col gap-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)]">
                    <span className="flex items-center gap-1.5">
                      <History className="size-3.5 text-[var(--accent)]" />
                      ประวัติการค้นหาล่าสุด:
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="hover:underline text-[10px] text-[var(--ink-3)] hover:text-red-400 cursor-pointer"
                    >
                      ล้างประวัติ
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s) => (
                      <div
                        key={s}
                        onClick={() => handleSelectSuggestion(s)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--ink)] transition-all cursor-pointer"
                      >
                        <History className="size-3 text-[var(--ink-3)] group-hover:text-[var(--accent)]" />
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, s)}
                          className="size-4 rounded-full flex items-center justify-center text-[var(--ink-3)] hover:text-red-400 ml-0.5 cursor-pointer"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-[var(--ink-3)] flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-[var(--accent)]" />
                  คำค้นหายอดนิยมในนครปฐม:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUGGESTIONS.map((pop) => (
                    <button
                      key={pop}
                      type="button"
                      onClick={() => handleSelectSuggestion(pop)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Tag className="size-3 text-[var(--accent)]" />
                      <span>{pop}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & keyboard shortcuts */}
        <div className="p-3 sm:p-3.5 border-t border-[var(--line)] bg-[var(--surface-2)]/60 flex items-center justify-between gap-2 text-[11px] font-mono text-[var(--ink-3)] shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--base)] text-[9px]">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--base)] text-[9px]">
                ↓
              </kbd>{" "}
              เลื่อนเลือก
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--base)] text-[9px]">
                ENTER
              </kbd>{" "}
              เปิดดู
            </span>
          </div>

          <div className="sm:hidden flex items-center gap-1 text-[var(--ink-2)] text-[11px]">
            <span>แตะรายการเพื่อเปิดดูรายละเอียด</span>
          </div>

          <div className="flex items-center gap-1 text-[var(--accent)] font-bold ml-auto">
            <Footprints className="size-3" />
            <span>IT RUNWAY SYSTEM</span>
          </div>
        </div>

        {/* QR Scanner Modal for Search Dialog */}
        <QrScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={(code) => {
            setQuery(code);
            setScannerOpen(false);
          }}
          participants={events.map((e) => ({
            id: e.id,
            bibNumber: e.title,
            distance: e.distance,
            chipCode: e.id,
          }))}
          eventName="ค้นหางานวิ่งด้วย QR Code"
        />
      </DialogContent>
    </Dialog>
  );
}
