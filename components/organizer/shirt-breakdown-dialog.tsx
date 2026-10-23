"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shirt,
  Download,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

interface ShirtBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  participants: any[];
}

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export function ShirtBreakdownDialog({
  open,
  onOpenChange,
  eventTitle,
  participants = [],
}: ShirtBreakdownDialogProps) {
  const [copied, setCopied] = useState(false);

  // Normalize size strings (e.g. "xl" -> "XL", " 2xl " -> "2XL")
  const normalizeSize = (rawSize: any): string => {
    if (!rawSize || typeof rawSize !== "string") return "L";
    const cleaned = rawSize.trim().toUpperCase();
    return cleaned || "L";
  };

  // Aggregate shirt sizes overall and per distance
  const breakdown = useMemo(() => {
    const sizeCounts: Record<string, number> = {};
    const distanceSizeMap: Record<string, Record<string, number>> = {};
    const distanceTotals: Record<string, number> = {};
    const dynamicSizesSet = new Set<string>(STANDARD_SIZES);

    // Discover any non-standard sizes in participant data (e.g. "4XL", "KIDS-S")
    participants.forEach((p) => {
      const raw = p.tshirtSize || p.shirtSize || p.size || p.tshirt_size;
      if (raw) {
        dynamicSizesSet.add(normalizeSize(raw));
      }
    });

    // Build ordered list: standard sizes first, then extra sizes alphabetically
    const allSizesList = [
      ...STANDARD_SIZES,
      ...Array.from(dynamicSizesSet).filter((s) => !STANDARD_SIZES.includes(s)).sort(),
    ];

    allSizesList.forEach((s) => (sizeCounts[s] = 0));

    participants.forEach((p) => {
      const rawSize = p.tshirtSize || p.shirtSize || p.size || p.tshirt_size;
      const size = normalizeSize(rawSize);
      const distance = p.distance?.trim() || "ไม่ระบุระยะทาง";

      sizeCounts[size] = (sizeCounts[size] || 0) + 1;
      distanceTotals[distance] = (distanceTotals[distance] || 0) + 1;

      if (!distanceSizeMap[distance]) {
        distanceSizeMap[distance] = {};
        allSizesList.forEach((s) => (distanceSizeMap[distance][s] = 0));
      }
      distanceSizeMap[distance][size] = (distanceSizeMap[distance][size] || 0) + 1;
    });

    // Find top size
    let topSize = "L";
    let maxCount = -1;
    allSizesList.forEach((sz) => {
      if ((sizeCounts[sz] || 0) > maxCount) {
        maxCount = sizeCounts[sz] || 0;
        topSize = sz;
      }
    });

    return {
      totalShirts: participants.length,
      allSizes: allSizesList,
      sizeCounts,
      distanceSizeMap,
      distanceTotals,
      distances: Object.keys(distanceSizeMap),
      topSize: maxCount > 0 ? topSize : null,
      topCount: maxCount > 0 ? maxCount : 0,
    };
  }, [participants]);

  // Export CSV for Factory
  const handleExportCSV = () => {
    if (breakdown.totalShirts === 0) return;

    const headers = ["ระยะทาง (Distance)", ...breakdown.allSizes, "รวมทั้งสิ้น (Total)"];
    const rows = breakdown.distances.map((dist) => {
      const sizeRow = breakdown.allSizes.map((sz) => breakdown.distanceSizeMap[dist]?.[sz] || 0);
      const total = breakdown.distanceTotals[dist] || 0;
      return [dist, ...sizeRow, total].join(",");
    });

    // Overall Total Row
    const grandTotals = [
      "รวมทุกระยะทาง (Grand Total)",
      ...breakdown.allSizes.map((sz) => breakdown.sizeCounts[sz] || 0),
      breakdown.totalShirts,
    ].join(",");

    const csvContent =
      "\uFEFF" +
      `รายงานสรุปยอดสั่งผลิตเสื้อวิ่ง,งาน: "${eventTitle}"\n` +
      `วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH")},จำนวนเสื้อทั้งหมด: ${breakdown.totalShirts} ตัว\n\n` +
      headers.join(",") +
      "\n" +
      rows.join("\n") +
      "\n" +
      grandTotals;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `shirt-production-order-${eventTitle.replace(/[^a-zA-Z0-9ก-๙_-]/g, "_")}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Copy Text Summary for LINE / Chat
  const handleCopySummary = async () => {
    if (breakdown.totalShirts === 0) return;

    const sizeSummaryLines = breakdown.allSizes
      .map((sz) => {
        const count = breakdown.sizeCounts[sz] || 0;
        const pct = breakdown.totalShirts > 0 ? ((count / breakdown.totalShirts) * 100).toFixed(1) : "0";
        return `• Size ${sz}: ${count} ตัว (${pct}%)`;
      })
      .join("\n");

    const text = `[รายงานสรุปยอดสั่งผลิตเสื้อวิ่ง]\nงาน: ${eventTitle}\nยอดรวมทั้งหมด: ${breakdown.totalShirts} ตัว\n\nรายละเอียดแยกตามไซส์:\n${sizeSummaryLines}\n\n(อัปเดต ณ ${new Date().toLocaleString("th-TH")})`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const isEmpty = breakdown.totalShirts === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-24px)] sm:w-full bg-[var(--surface)] border-[var(--line)] p-0 text-[var(--ink)] shadow-[var(--shadow-far)] max-h-[85dvh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--line)] shrink-0 pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 flex items-center justify-center shrink-0 shadow-xs">
                <Shirt className="size-4 sm:size-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold font-[var(--font-display)] flex items-center gap-2 truncate">
                  <span>สรุปยอดสั่งผลิตเสื้อวิ่ง</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)] truncate max-w-full sm:max-w-md">
                  สรุปจำนวนสั่งตัดเย็บ •{" "}
                  <span className="font-semibold text-[var(--ink)]">{eventTitle}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Badge
                variant={isEmpty ? "outline" : "accent"}
                className="font-mono text-xs font-bold px-2.5 py-0.5"
              >
                ยอดรวม {breakdown.totalShirts} ตัว
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 py-4 space-y-4">
          {isEmpty ? (
            /* Empty State View */
            <div className="my-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-2)]/30 p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="size-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--ink-3)]">
                <Shirt className="size-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="font-[var(--font-display)] font-bold text-sm sm:text-base text-[var(--ink)]">
                  ยังไม่พบข้อมูลนักวิ่งที่ลงทะเบียนในงานนี้
                </h4>
                <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                  เมื่อมีนักวิ่งสมัครเข้าร่วมงานวิ่ง ระบบจะแจกแจงสัดส่วนไซส์เสื้อ (XS - 3XL)
                  ตามแต่ละระยะทางให้อัตโนมัติ เพื่อส่งออกใบสั่งตัดเย็บให้โรงงาน
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg border border-[var(--accent)]/20 mt-1">
                <Layers className="size-3.5 shrink-0" />
                <span>เคล็ดลับ: สลับเลือกงานวิ่งอื่นที่มีผู้สมัครจากเมนูด้านบน</span>
              </div>
            </div>
          ) : (
            /* Populated Breakdown View */
            <div className="space-y-4">
              {/* Quick Size Metrics — Horizontal Touch Scroll on Mobile, 7-col Grid on Desktop */}
              <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 scroll-x touch-pan-x w-full sm:grid sm:grid-cols-7">
                {breakdown.allSizes.map((sz) => {
                  const count = breakdown.sizeCounts[sz] || 0;
                  const hasCount = count > 0;
                  const pct = breakdown.totalShirts > 0 ? (count / breakdown.totalShirts) * 100 : 0;
                  const isTop = sz === breakdown.topSize && count > 0;

                  return (
                    <div
                      key={sz}
                      className={`relative overflow-hidden p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all min-w-[84px] shrink-0 sm:min-w-0 sm:shrink ${
                        isTop
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-xs"
                          : hasCount
                          ? "border-[var(--line)] bg-[var(--surface-2)]/80 hover:border-[var(--ink-3)]"
                          : "border-[var(--line)] bg-[var(--surface-2)]/30 opacity-60"
                      }`}
                    >
                      {isTop && (
                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                      )}

                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[11px] font-mono font-bold text-[var(--ink-2)]">
                          Size {sz}
                        </span>
                        {hasCount && (
                          <span className="text-[9.5px] font-mono font-semibold text-[var(--ink-3)]">
                            {pct.toFixed(0)}%
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-lg sm:text-xl font-black font-[var(--font-bib)] tracking-tight ${
                          isTop ? "text-[var(--accent)]" : hasCount ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
                        }`}
                      >
                        {count}
                      </span>

                      <span className="text-[9.5px] font-mono text-[var(--ink-3)]">ตัว</span>

                      {/* Mini Proportion Bar */}
                      <div className="w-full h-1 bg-[var(--surface)] rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%`, opacity: hasCount ? (isTop ? 1 : 0.6) : 0 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insight Banner */}
              {breakdown.topSize && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/50 text-xs text-[var(--ink-2)] font-mono">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-3.5 text-[var(--accent)] shrink-0" />
                    <span>
                      ไซส์ยอดนิยมสูงสุด: <strong className="text-[var(--accent)]">Size {breakdown.topSize}</strong>{" "}
                      ({breakdown.topCount} ตัว,{" "}
                      {((breakdown.topCount / breakdown.totalShirts) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[var(--ink-3)]">
                    ครอบคลุม {breakdown.distances.length} ระยะทาง
                  </span>
                </div>
              )}

              {/* Table Breakdown by Distance */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/30 overflow-hidden w-full">
                <div className="overflow-x-auto w-full scroll-x">
                  <table className="w-full text-xs text-left min-w-[460px]">
                    <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] font-mono border-b border-[var(--line)]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">ระยะทาง (Distance)</th>
                        {breakdown.allSizes.map((sz) => (
                          <th key={sz} className="py-2.5 px-2 text-center font-bold">
                            {sz}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-right font-bold text-[var(--accent)]">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {breakdown.distances.map((dist) => (
                        <tr key={dist} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                          <td className="py-2.5 px-3 font-bold font-mono text-[var(--ink)]">{dist}</td>
                          {breakdown.allSizes.map((sz) => (
                            <td
                              key={sz}
                              className="py-2.5 px-2 text-center font-mono text-[var(--ink-2)] tabular-nums"
                            >
                              {breakdown.distanceSizeMap[dist]?.[sz] || 0}
                            </td>
                          ))}
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-[var(--accent)] tabular-nums">
                            {breakdown.distanceTotals[dist] || 0}
                          </td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="bg-[var(--accent)]/10 font-bold border-t-2 border-[var(--accent)]/30">
                        <td className="py-2.5 px-3 font-bold text-[var(--ink)]">รวมทั้งหมด</td>
                        {breakdown.allSizes.map((sz) => (
                          <td
                            key={sz}
                            className="py-2.5 px-2 text-center font-mono font-bold text-[var(--ink)] tabular-nums"
                          >
                            {breakdown.sizeCounts[sz] || 0}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-[var(--accent)] text-sm tabular-nums">
                          {breakdown.totalShirts}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--line)] bg-[var(--surface)] shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] w-full sm:w-auto justify-center"
          >
            ปิดหน้าต่าง
          </Button>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {!isEmpty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="h-9 text-xs font-semibold gap-1.5 border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--ink-3)] w-full sm:w-auto justify-center"
                title="คัดลอกสรุปข้อความสำหรับส่งใน LINE หรือแชท"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-[var(--ink-3)]" />
                    <span>คัดลอกสรุปข้อความ</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              onClick={handleExportCSV}
              disabled={isEmpty}
              size="sm"
              className="h-9 text-xs font-bold gap-2 bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <Download className="size-4" />
              <span>ดาวน์โหลดใบสั่งผลิตเสื้อ (CSV)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
