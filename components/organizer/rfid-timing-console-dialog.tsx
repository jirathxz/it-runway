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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]">
        <DialogHeader className="border-b border-[var(--line)] pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Radio className="size-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black font-[var(--font-display)] flex items-center gap-2">
                  <span>ระบบควบคุมการจับเวลา RFID (Live Timing Mat Console)</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    LIVE TELEMETRY
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)]">
                  {eventName} • เชื่อมต่อเครื่องอ่าน RFID UHF และคำนวณสถิติเวลา/อันดับอัตโนมัติ
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Active Timing Mats Grid */}
          <div>
            <div className="text-xs font-mono font-bold text-[var(--ink-2)] mb-2 flex items-center gap-1.5">
              <Layers className="size-3.5 text-[var(--accent)]" />
              <span>สถานะพรมจับเวลา (Active RFID Timing Mats)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {timingMats.map((mat) => {
                const isSelected = selectedReader === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedReader(mat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]"
                        : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--ink-3)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-[var(--ink)]">{mat.id.replace("READER-", "")}</span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {mat.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[var(--ink)] truncate">{mat.name}</div>
                    <div className="text-[10px] font-mono text-[var(--ink-3)] mt-1 flex items-center gap-1">
                      <Wifi className="size-3 text-amber-400" />
                      <span>{mat.freq}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Section */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-400" />
                <span className="text-xs font-bold font-mono">จำลองสัญญาณนักวิ่งเหยียบพรม (Simulate Detection Event)</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--ink-2)]">
                Mat ปลายทาง: <strong className="text-[var(--accent)]">{selectedReader}</strong>
              </span>
            </div>

            {/* 1-Click Quick Triggers */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[var(--ink-3)]">นักวิ่งทดสอบ:</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setCustomBib("1088");
                  handleSimulateCrossing("1088");
                }}
                className="h-8 text-xs font-mono font-bold cursor-pointer hover:border-[var(--accent)]"
              >
                <Sparkles className="size-3 mr-1 text-amber-400" />
                BIB 1088 (ธนภัทร - 21K)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setCustomBib("2101");
                  handleSimulateCrossing("2101");
                }}
                className="h-8 text-xs font-mono font-bold cursor-pointer hover:border-[var(--accent)]"
              >
                <Sparkles className="size-3 mr-1 text-amber-400" />
                BIB 2101 (กานดา - 10K)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setCustomBib("0512");
                  handleSimulateCrossing("0512");
                }}
                className="h-8 text-xs font-mono font-bold cursor-pointer hover:border-[var(--accent)]"
              >
                <Sparkles className="size-3 mr-1 text-amber-400" />
                BIB 0512 (สมชาย - 5K)
              </Button>
            </div>

            {/* Custom BIB Input */}
            <div className="flex gap-2">
              <Input
                placeholder="กรอกหมายเลข BIB (เช่น 1088)"
                value={customBib}
                onChange={(e) => setCustomBib(e.target.value)}
                className="h-9 text-xs font-mono max-w-[200px] bg-[var(--surface)] border-[var(--line)]"
              />
              <Button
                type="button"
                size="sm"
                disabled={loading || !customBib}
                onClick={() => handleSimulateCrossing(customBib)}
                className="h-9 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm"
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

          {/* Last Processed Result Card */}
          {lastProcessed && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ประมวลผลสถิติเวลาและอันดับสำเร็จ (TIMING COMPUTATION SUCCESS)
                  </span>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs">
                  BIB {lastProcessed.bibNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">นักวิ่ง</div>
                  <div className="text-xs font-bold text-[var(--ink)] truncate mt-0.5">
                    {lastProcessed.runnerName}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">เวลา Chip Time</div>
                  <div className="text-xs font-black font-mono text-emerald-400 mt-0.5">
                    {lastProcessed.chipTime}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="text-[10px] font-mono text-[var(--ink-3)]">เวลา Gun Time</div>
                  <div className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">
                    {lastProcessed.gunTime}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
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
                บันทึกสัญญาณเครื่องอ่าน (RFID_READ Telemetry Stream)
              </span>
              <span className="text-[10px] text-[var(--ink-3)]">
                {rfidLogs.length} detection events
              </span>
            </div>

            <div className="rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--surface-2)]">
              <div className="max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-[var(--surface)] border-b border-[var(--line)] text-[10px] text-[var(--ink-3)] uppercase">
                    <tr>
                      <th className="py-2 px-3">เวลาที่ตรวจจับ</th>
                      <th className="py-2 px-3">เครื่องอ่าน (Reader ID)</th>
                      <th className="py-2 px-3">หมายเลข BIB</th>
                      <th className="py-2 px-3">รหัสชิป (Chip EPC)</th>
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
                            {log.readerId}
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
      </DialogContent>
    </Dialog>
  );
}
