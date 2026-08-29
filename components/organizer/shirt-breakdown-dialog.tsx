"use client";

import * as React from "react";
import { useMemo } from "react";
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
import { Shirt, Download, Layers, Sparkles } from "lucide-react";

interface ShirtBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  participants: any[];
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export function ShirtBreakdownDialog({
  open,
  onOpenChange,
  eventTitle,
  participants,
}: ShirtBreakdownDialogProps) {
  // Aggregate shirt sizes overall and per distance
  const breakdown = useMemo(() => {
    const sizeCounts: Record<string, number> = {};
    const distanceSizeMap: Record<string, Record<string, number>> = {};
    const distanceTotals: Record<string, number> = {};

    ALL_SIZES.forEach((s) => (sizeCounts[s] = 0));

    participants.forEach((p) => {
      const size = p.tshirtSize || "L";
      const distance = p.distance || "10K";

      sizeCounts[size] = (sizeCounts[size] || 0) + 1;
      distanceTotals[distance] = (distanceTotals[distance] || 0) + 1;

      if (!distanceSizeMap[distance]) {
        distanceSizeMap[distance] = {};
        ALL_SIZES.forEach((s) => (distanceSizeMap[distance][s] = 0));
      }
      distanceSizeMap[distance][size] = (distanceSizeMap[distance][size] || 0) + 1;
    });

    return {
      totalShirts: participants.length,
      sizeCounts,
      distanceSizeMap,
      distanceTotals,
      distances: Object.keys(distanceSizeMap),
    };
  }, [participants]);

  // Export CSV for Factory
  const handleExportCSV = () => {
    const headers = ["ระยะทาง (Distance)", ...ALL_SIZES, "รวมทั้งสิ้น (Total)"];
    const rows = breakdown.distances.map((dist) => {
      const sizeRow = ALL_SIZES.map((sz) => breakdown.distanceSizeMap[dist]?.[sz] || 0);
      const total = breakdown.distanceTotals[dist] || 0;
      return [dist, ...sizeRow, total].join(",");
    });

    // Overall Total Row
    const grandTotals = [
      "รวมทุกระยะทาง (Grand Total)",
      ...ALL_SIZES.map((sz) => breakdown.sizeCounts[sz] || 0),
      breakdown.totalShirts,
    ].join(",");

    const csvContent =
      "\uFEFF" +
      `รายงานสรุปยอดสั่งผลิตเสื้อวิ่ง,งาน: ${eventTitle}\n\n` +
      headers.join(",") +
      "\n" +
      rows.join("\n") +
      "\n" +
      grandTotals;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shirt-production-order-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[var(--surface)] border-[var(--line)] p-6 text-[var(--ink)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                <Shirt className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-[var(--font-display)]">
                  สรุปยอดสั่งผลิตเสื้อวิ่ง (T-Shirt Size Breakdown)
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)]">
                  สรุปจำนวนเสื้อที่ต้องสั่งตัดเย็บสำหรับโรงงานผลิต ({eventTitle})
                </DialogDescription>
              </div>
            </div>
            <Badge variant="accent" className="font-mono text-xs font-bold">
              ยอดรวม {breakdown.totalShirts} ตัว
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Quick Size Metrics Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {ALL_SIZES.map((sz) => (
              <div
                key={sz}
                className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col items-center gap-1 shadow-sm"
              >
                <span className="text-xs font-mono font-bold text-[var(--ink-2)]">Size {sz}</span>
                <span className="text-lg font-black font-[var(--font-bib)] text-[var(--accent)]">
                  {breakdown.sizeCounts[sz] || 0}
                </span>
                <span className="text-[10px] text-[var(--ink-3)]">ตัว</span>
              </div>
            ))}
          </div>

          {/* Table Breakdown by Distance */}
          <div className="rounded-xl border border-[var(--line)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] font-mono border-b border-[var(--line)]">
                  <tr>
                    <th className="p-2.5">ระยะทาง</th>
                    {ALL_SIZES.map((sz) => (
                      <th key={sz} className="p-2.5 text-center font-bold">
                        {sz}
                      </th>
                    ))}
                    <th className="p-2.5 text-right font-bold text-[var(--accent)]">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {breakdown.distances.map((dist) => (
                    <tr key={dist} className="hover:bg-[var(--surface-2)]/50">
                      <td className="p-2.5 font-bold font-mono text-[var(--ink)]">{dist}</td>
                      {ALL_SIZES.map((sz) => (
                        <td key={sz} className="p-2.5 text-center font-mono">
                          {breakdown.distanceSizeMap[dist]?.[sz] || 0}
                        </td>
                      ))}
                      <td className="p-2.5 text-right font-mono font-bold text-[var(--accent)]">
                        {breakdown.distanceTotals[dist] || 0}
                      </td>
                    </tr>
                  ))}
                  {/* Grand Total Row */}
                  <tr className="bg-[var(--surface-2)]/80 font-bold">
                    <td className="p-2.5 text-[var(--ink)]">รวมทั้งหมด</td>
                    {ALL_SIZES.map((sz) => (
                      <td key={sz} className="p-2.5 text-center font-mono text-[var(--ink)]">
                        {breakdown.sizeCounts[sz] || 0}
                      </td>
                    ))}
                    <td className="p-2.5 text-right font-mono font-black text-sm text-[var(--accent)]">
                      {breakdown.totalShirts}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            ปิดหน้าต่าง
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold gap-1.5 cursor-pointer bg-[var(--accent)] text-[var(--accent-ink)]"
          >
            <Download className="size-3.5" />
            <span>ดาวน์โหลดใบสั่งผลิตเสื้อ (CSV สำหรับโรงงาน)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
