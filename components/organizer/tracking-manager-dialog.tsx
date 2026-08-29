"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Save,
  Send,
  PackageCheck,
} from "lucide-react";

interface TrackingManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: any[];
  onTrackingUpdated: () => void;
}

export function TrackingManagerDialog({
  open,
  onOpenChange,
  participants,
  onTrackingUpdated,
}: TrackingManagerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingMap, setTrackingMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Initialize tracking map from participants with shippingStatus === 'delivered'
  const postalRunners = React.useMemo(() => {
    return participants.filter(
      (p) => p.shippingStatus === "delivered" || p.trackingNumber
    );
  }, [participants]);

  React.useEffect(() => {
    const initialMap: Record<string, string> = {};
    postalRunners.forEach((p) => {
      if (p.trackingNumber) {
        initialMap[p.id] = p.trackingNumber;
      }
    });
    setTrackingMap(initialMap);
  }, [postalRunners]);

  const filteredPostalRunners = React.useMemo(() => {
    if (!searchTerm.trim()) return postalRunners;
    const term = searchTerm.trim().toLowerCase();
    return postalRunners.filter(
      (p) =>
        p.bibNumber?.toLowerCase().includes(term) ||
        p.userName?.toLowerCase().includes(term) ||
        p.userPhone?.toLowerCase().includes(term) ||
        trackingMap[p.id]?.toLowerCase().includes(term)
    );
  }, [postalRunners, searchTerm, trackingMap]);

  // Save single tracking number
  const handleSaveSingle = async (runner: any) => {
    const trackingNum = trackingMap[runner.id] || "";
    try {
      setSavingId(runner.id);
      const res = await fetch("/api/organizer/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: runner.id,
          trackingNumber: trackingNum,
        }),
      });

      if (res.ok) {
        setSavedSuccessId(runner.id);
        setTimeout(() => setSavedSuccessId(null), 2000);
        onTrackingUpdated();
      }
    } catch (e) {
      console.error("Failed to save tracking number:", e);
    } finally {
      setSavingId(null);
    }
  };

  // 1-Click Auto Assign Demo Tracking Numbers for testing
  const handleAutoAssignDemo = async () => {
    setBulkSaving(true);
    setStatusMsg("กำลังสุ่มเลขพัสดุและบันทึกอัตโนมัติ...");

    try {
      const couriers = ["TH", "KRY", "FLASH", "JNT"];
      for (const p of postalRunners) {
        const randomCourier = couriers[Math.floor(Math.random() * couriers.length)];
        const randomNum = Math.floor(100000000 + Math.random() * 900000000);
        const demoTracking = `${randomCourier}${randomNum}TH`;

        await fetch("/api/organizer/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationId: p.id,
            trackingNumber: demoTracking,
          }),
        });

        setTrackingMap((prev) => ({ ...prev, [p.id]: demoTracking }));
      }

      setStatusMsg("บันทึกเลขพัสดุครบทุกคนแล้ว!");
      setTimeout(() => setStatusMsg(null), 3000);
      onTrackingUpdated();
    } catch (e) {
      console.error("Failed auto assigning tracking:", e);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] border-[var(--line)] p-6 text-[var(--ink)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Truck className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-[var(--font-display)]">
                  จัดการเลขพัสดุจัดส่ง (Shipping & Tracking Manager)
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)]">
                  กรอกเลขพัสดุ (EMS / Flash / Kerry) เพื่อให้นักวิ่งตรวจสอบสถานะบนหน้า Digital BIB
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs font-bold text-blue-400 border-blue-500/30">
              จัดส่งไปรษณีย์ {postalRunners.length} คน
            </Badge>
          </div>
        </DialogHeader>

        {/* Toolbar & Demo Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา BIB, ชื่อนักวิ่ง หรือ เลขพัสดุ..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoAssignDemo}
            disabled={bulkSaving || postalRunners.length === 0}
            className="h-9 text-xs gap-1.5 cursor-pointer border-blue-500/40 text-blue-400 hover:bg-blue-500/10 shrink-0"
          >
            {bulkSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5 text-blue-400" />
            )}
            <span>สุ่มเลขพัสดุ Demo อัตโนมัติ</span>
          </Button>
        </div>

        {statusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Runners List Table */}
        <div className="rounded-xl border border-[var(--line)] overflow-hidden my-2">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--surface-2)] text-[var(--ink-2)] font-mono border-b border-[var(--line)] sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">BIB</th>
                  <th className="p-2.5">นักวิ่ง</th>
                  <th className="p-2.5">ระยะทาง / ไซส์</th>
                  <th className="p-2.5">เบอร์โทรศัพท์</th>
                  <th className="p-2.5 min-w-[200px]">หมายเลขพัสดุ (Tracking Number)</th>
                  <th className="p-2.5 text-right">บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredPostalRunners.map((runner) => {
                  const currentTracking = trackingMap[runner.id] || "";
                  const isSaving = savingId === runner.id;
                  const isSuccess = savedSuccessId === runner.id;

                  return (
                    <tr key={runner.id} className="hover:bg-[var(--surface-2)]/50">
                      <td className="p-2.5 font-bold font-mono text-[var(--accent)]">
                        {runner.bibNumber}
                      </td>
                      <td className="p-2.5 font-medium text-[var(--ink)]">
                        {runner.userName}
                      </td>
                      <td className="p-2.5 font-mono text-[var(--ink-2)]">
                        {runner.distance} • ไซส์ {runner.tshirtSize}
                      </td>
                      <td className="p-2.5 font-mono text-[var(--ink-3)]">
                        {runner.userPhone || "-"}
                      </td>
                      <td className="p-2.5">
                        <Input
                          value={currentTracking}
                          onChange={(e) =>
                            setTrackingMap((prev) => ({
                              ...prev,
                              [runner.id]: e.target.value,
                            }))
                          }
                          placeholder="เช่น TH1234567890B"
                          className="h-8 text-xs font-mono bg-[var(--base)]/60"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveSingle(runner)}
                          disabled={isSaving}
                          className="h-8 px-2.5 text-xs font-semibold cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                        >
                          {isSaving ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="size-3 text-emerald-400" />
                          ) : (
                            <Save className="size-3" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPostalRunners.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--ink-3)] font-mono">
            {postalRunners.length === 0
              ? "ยังไม่มีนักวิ่งที่เลือกการจัดส่งทางไปรษณีย์ในงานนี้"
              : "ไม่พบนักวิ่งตามคำค้นหา"}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
