"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  Loader2,
  Sparkles,
  Wifi,
  Cpu,
  Layers,
} from "lucide-react";

interface RfidTimingConsoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  participants: any[];
  onTimingUpdated?: () => void;
}

export function RfidTimingConsoleDialog({
  open,
  onOpenChange,
  eventId,
  eventName,
  participants,
  onTimingUpdated,
}: RfidTimingConsoleDialogProps) {
  const [selectedReader, setSelectedReader] = React.useState("READER-FINISH-MAT-01");
  const [customBib, setCustomBib] = React.useState("1088");
  const [loading, setLoading] = React.useState(false);
  const [lastProcessed, setLastProcessed] = React.useState<any | null>(null);
  const [rfidLogs, setRfidLogs] = React.useState<any[]>([]);

  const timingMats = [
    { id: "READER-START-01", name: "พรมปล่อยตัว (Start Line Mat)", freq: "922.5 MHz", status: "ACTIVE" },
    { id: "READER-KM5-01", name: "กม. 5 ถนนราชดำเนิน (Split Mat)", freq: "923.0 MHz", status: "ACTIVE" },
    { id: "READER-KM15-01", name: "กม. 15 สนามจันทร์ (Split Mat)", freq: "923.5 MHz", status: "ACTIVE" },
    { id: "READER-FINISH-MAT-01", name: "เส้นชัย พระปฐมเจดีย์ (Finish Mat)", freq: "924.0 MHz", status: "ACTIVE" },
  ];

  // Fetch recent RFID read stream
  const loadRfidStream = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/timing/rfid-ingest?eventId=${eventId}`);
      const data = await res.json();
      if (data.success && data.logs) {
        setRfidLogs(data.logs);
      }
    } catch (e) {
      // silent
    }
  }, [eventId]);

  React.useEffect(() => {
    if (open) {
      loadRfidStream();
      const timer = setInterval(loadRfidStream, 4000);
      return () => clearInterval(timer);
    }
  }, [open, loadRfidStream]);

  // Simulate Runner Crossing RFID Timing Mat
  const handleSimulateCrossing = async (bib: string) => {
    try {
      setLoading(true);
      setLastProcessed(null);

      const res = await fetch("/api/timing/rfid-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bibId: bib,
          chipId: `NP-TIMING-${bib}`,
          readerId: selectedReader,
          eventId: eventId,
          rawData: {
            rssi: -58 - Math.floor(Math.random() * 15),
            antennaPort: Math.floor(Math.random() * 4) + 1,
            frequencyMhz: 922.5 + Math.random() * 2,
            epc: `E2801170${bib.padStart(8, "0")}`,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการประมวลผล RFID");
      }

      setLastProcessed(data.data);
      loadRfidStream();
      if (onTimingUpdated) {
        onTimingUpdated();
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการส่งสัญญาณ RFID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100vw-24px)] sm:w-full bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] p-0 max-h-[85dvh] flex flex-col overflow-hidden shadow-[var(--shadow-far)]">
        {/* Fixed Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--line)] shrink-0 pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                <Radio className="size-4 sm:size-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-black font-[var(--font-display)] flex flex-wrap items-center gap-2">
                  <span>ระบบควบคุมการจับเวลา RFID</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    LIVE TELEMETRY
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)] truncate max-w-full sm:max-w-md">
                  {eventName} • เชื่อมต่อเครื่องอ่าน RFID UHF
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 py-4 space-y-5">
          {/* Active Timing Mats Grid (2x2 on mobile, 4-col on desktop) */}
          <div>
            <div className="text-xs font-mono font-bold text-[var(--ink-2)] mb-2.5 flex items-center gap-1.5">
              <Layers className="size-3.5 text-[var(--accent)]" />
              <span>สถานะพรมจับเวลา (Active RFID Timing Mats)</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {timingMats.map((mat) => {
                const isSelected = selectedReader === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedReader(mat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] shadow-xs"
                        : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--ink-3)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-[var(--ink)] truncate">{mat.id.replace("READER-", "")}</span>
                      <span className="flex items-center gap-1 text-[9.5px] text-emerald-400 font-bold shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {mat.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[var(--ink)] leading-snug line-clamp-2">{mat.name}</div>
                    <div className="text-[10px] font-mono text-[var(--ink-3)] mt-1.5 flex items-center gap-1">
                      <Wifi className="size-2.5 text-amber-400" />
                      <span>{mat.freq}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold font-mono text-[var(--ink)]">
                  จำลองสัญญาณนักวิ่งเหยียบพรม (Simulate Detection Event)
                </span>
              </div>
              <div className="text-[11px] font-mono text-[var(--ink-2)] flex items-center gap-1.5 shrink-0">
                <span>Mat ปลายทาง:</span>
                <span className="font-bold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                  {selectedReader}
                </span>
              </div>
            </div>

            {/* 1-Click Quick Runner Preset Cards */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[var(--ink-3)]">เลือกนักวิ่งจำลอง:</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCustomBib("1088");
                    handleSimulateCrossing("1088");
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono font-bold text-xs text-[var(--ink)] shrink-0">BIB 1088</span>
                    <span className="text-xs text-[var(--ink-2)] truncate">• ธนภัทร สุขสมบูรณ์</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400 bg-amber-500/10 shrink-0">
                    21.1 KM (Half)
                  </Badge>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCustomBib("2101");
                    handleSimulateCrossing("2101");
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono font-bold text-xs text-[var(--ink)] shrink-0">BIB 2101</span>
                    <span className="text-xs text-[var(--ink-2)] truncate">• กานดา ชัยชนะ</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-400 bg-blue-500/10 shrink-0">
                    10.5 KM (Mini)
                  </Badge>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCustomBib("0512");
                    handleSimulateCrossing("0512");
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono font-bold text-xs text-[var(--ink)] shrink-0">BIB 0512</span>
                    <span className="text-xs text-[var(--ink-2)] truncate">• สมชาย สายวิ่ง</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0">
                    5.0 KM (Fun Run)
                  </Badge>
                </button>
              </div>
            </div>

            {/* Custom BIB Input & Ingest Trigger */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-mono text-[var(--ink-3)]">หรือกรอกหมายเลข BIB เอง:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="กรอกหมายเลข BIB (เช่น 1088)"
                  value={customBib}
                  onChange={(e) => setCustomBib(e.target.value)}
                  className="h-10 text-xs font-mono w-full sm:max-w-[240px] bg-[var(--surface)] border-[var(--line)]"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={loading || !customBib}
                  onClick={() => handleSimulateCrossing(customBib)}
                  className="h-10 px-5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm w-full sm:w-auto shrink-0 justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      กำลังประมวลผล Timing...
                    </>
                  ) : (
                    <>
                      <Activity className="size-3.5 mr-1.5" />
                      ยิงสัญญาณเข้าพรม RFID Mat
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Last Processed Result Card */}
          {lastProcessed && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ประมวลผลสำเร็จ (TIMING SUCCESS)
                  </span>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs">
                  BIB {lastProcessed.bibNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">นักวิ่ง</div>
                  <div className="text-xs font-bold text-[var(--ink)] truncate mt-0.5">
                    {lastProcessed.runnerName}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">เวลา Chip Time</div>
                  <div className="text-xs font-black font-mono text-emerald-400 mt-0.5">
                    {lastProcessed.chipTime}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">เวลา Gun Time</div>
                  <div className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">
                    {lastProcessed.gunTime}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">อันดับ Overall</div>
                  <div className="text-xs font-black font-mono text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                    <Trophy className="size-3" />
                    อันดับ #{lastProcessed.overallRank || 1}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telemetry Stream Log Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[var(--ink-2)] flex items-center gap-1.5">
                <Cpu className="size-3.5 text-blue-400" />
                บันทึกสัญญาณเครื่องอ่าน (RFID_READ Stream)
              </span>
              <span className="text-[10px] text-[var(--ink-3)]">
                {rfidLogs.length} events
              </span>
            </div>

            <div className="rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--surface-2)]">
              <div className="max-h-[200px] overflow-y-auto overflow-x-auto scroll-x">
                <table className="w-full text-left text-xs font-mono min-w-[480px]">
                  <thead className="sticky top-0 bg-[var(--surface)] border-b border-[var(--line)] text-[10px] text-[var(--ink-3)] uppercase">
                    <tr>
                      <th className="py-2 px-3">เวลาที่ตรวจจับ</th>
                      <th className="py-2 px-3">เครื่องอ่าน</th>
                      <th className="py-2 px-3">หมายเลข BIB</th>
                      <th className="py-2 px-3">รหัสชิป</th>
                      <th className="py-2 px-3 text-right">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {rfidLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-[var(--ink-3)]">
                          ยังไม่มีข้อมูลสัญญาณ RFID ล่าสุด (กดปุ่มยิงสัญญาณเพื่อทดสอบ)
                        </td>
                      </tr>
                    ) : (
                      rfidLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--surface)]">
                          <td className="py-2 px-3 text-[11px] text-[var(--ink-2)]">
                            {new Date(log.detectedAt).toLocaleTimeString("th-TH")}
                          </td>
                          <td className="py-2 px-3 font-bold text-blue-400 text-[11px]">
                            {log.readerId.replace("READER-", "")}
                          </td>
                          <td className="py-2 px-3 font-black text-amber-400">
                            {log.bibId}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-[var(--ink-3)]">
                            {log.chipId}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                              RECORDED
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--line)] bg-[var(--surface)] shrink-0 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] w-full sm:w-auto justify-center"
          >
            ปิดหน้าต่าง
          </Button>

          <span className="text-[11px] font-mono text-[var(--ink-3)] hidden sm:inline">
            Telemetry Stream Live (อัปเดตอัตโนมัติทุก 4 วิ)
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
