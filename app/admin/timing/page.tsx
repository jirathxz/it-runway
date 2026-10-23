"use client";

import * as React from "react";
import Link from "next/link";
import {
  Timer,
  Radio,
  QrCode,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Footprints,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminTimingPage() {
  const [simulating, setSimulating] = React.useState(false);
  const [simResult, setSimResult] = React.useState<string | null>(null);
  const [testBib, setTestBib] = React.useState("HM-1024");
  const [testCheckpoint, setTestCheckpoint] = React.useState("CP-FINISH");

  const stations = [
    {
      id: "ST-01",
      name: "จุดปล่อยตัว (Start Mat Gate)",
      location: "หน้าองค์พระปฐมเจดีย์ (ฝั่งทิศเหนือ)",
      frequency: "UHF RFID 920-925 MHz",
      status: "ONLINE",
      accuracy: "99.98%",
      lastPing: "1 วินาทีที่แล้ว",
      latency: "12ms",
    },
    {
      id: "ST-02",
      name: "จุดตรวจเวลา กม. 5 (5K Split Mat)",
      location: "ถนนราชดำเนิน (ต้นสนตัดใหม่)",
      frequency: "UHF RFID 920-925 MHz",
      status: "ONLINE",
      accuracy: "99.95%",
      lastPing: "2 วินาทีที่แล้ว",
      latency: "18ms",
    },
    {
      id: "ST-03",
      name: "จุดกลับตัว กม. 10 (10K Turn Mat)",
      location: "สะพานเจริญศรัทธา",
      frequency: "UHF RFID 920-925 MHz",
      status: "ONLINE",
      accuracy: "99.92%",
      lastPing: "3 วินาทีที่แล้ว",
      latency: "24ms",
    },
    {
      id: "ST-04",
      name: "เส้นชัย (Finish Line Gate)",
      location: "ลานองค์พระปฐมเจดีย์",
      frequency: "Dual Mat Array 920-925 MHz",
      status: "ONLINE",
      accuracy: "100.0%",
      lastPing: "Real-time",
      latency: "8ms",
    },
  ];

  const handleSimulateScan = () => {
    setSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      const now = new Date();
      const timeString = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
      setSimResult(`[RFID SCAN SUCCESS] BIB: ${testBib} | Checkpoint: ${testCheckpoint} | Gun Time: 01:28:44 | Chip Net Time: 01:28:32.415 | Mat Accuracy: 100% (Signal: -48dBm)`);
      setSimulating(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="size-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              ระบบจับเวลาและสถานีชิป RFID (Race Timing Engine)
            </h1>
          </div>
          <p className="text-xs text-[var(--ink-2)] mt-1">
            มอนิเตอร์สถานะเสาสัญญาณ พรมจับเวลา (Timing Mats) และเชื่อมต่อผลการแข่งขันแบบ Real-Time
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white self-start sm:self-auto shadow-sm"
        >
          <Link href="/organizer/checkin">
            <QrCode className="size-3.5 mr-1.5" />
            <span>เปิดแถบตรวจ BIB นักวิ่ง (Gate Check-in)</span>
          </Link>
        </Button>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-emerald-500/30 bg-[var(--surface)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)]">
            <span>TIMING MATS STATUS</span>
            <Radio className="size-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-[var(--font-display)] text-emerald-400">
            4 / 4 ONLINE
          </div>
          <p className="text-[11px] text-[var(--ink-3)] font-mono">
            ทุกพรมตรวจจับสัญญาณอยู่ในสถานะพร้อมบันทึกสถิติ
          </p>
        </Card>

        <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)]">
            <span>CHIP DETECTION LATENCY</span>
            <Activity className="size-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-[var(--font-display)] text-[var(--ink)]">
            ~15 ms
          </div>
          <p className="text-[11px] text-[var(--ink-3)] font-mono">
            Ultra-low latency real-time chip processing
          </p>
        </Card>

        <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-3)]">
            <span>RFID PROTOCOL</span>
            <ShieldCheck className="size-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-[var(--font-display)] text-blue-400">
            EPC Gen2 (ISO 18000-6C)
          </div>
          <p className="text-[11px] text-[var(--ink-3)] font-mono">
            มาตรฐานสากล World Athletics Approved
          </p>
        </Card>
      </div>

      {/* Timing Stations Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold font-[var(--font-display)] text-[var(--ink)] flex items-center gap-2">
          <Radio className="size-4 text-amber-400" />
          <span>สถานีพรมรับสัญญาณประจำสนาม (Timing Station Mats)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map((st) => (
            <Card key={st.id} className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-400">{st.id}</span>
                    <h3 className="font-bold text-sm text-[var(--ink)]">{st.name}</h3>
                  </div>
                  <p className="text-xs text-[var(--ink-2)] font-mono">{st.location}</p>
                </div>

                <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-[9px] font-bold">
                  {st.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--surface-2)] text-[11px] font-mono">
                <div>
                  <span className="text-[10px] text-[var(--ink-3)] block">Accuracy</span>
                  <span className="font-bold text-emerald-400">{st.accuracy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--ink-3)] block">Latency</span>
                  <span className="font-bold text-[var(--ink)]">{st.latency}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--ink-3)] block">Last Ping</span>
                  <span className="font-bold text-[var(--ink-2)]">{st.lastPing}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* RFID Simulation & Diagnostic Box */}
      <Card className="p-5 sm:p-6 border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-[var(--surface)] to-[var(--surface)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-purple-400" />
            <h3 className="text-sm font-bold font-[var(--font-display)] text-[var(--ink)]">
              เครื่องมือจำลองการสแกนชิป (RFID Simulation & Diagnostic Tool)
            </h3>
          </div>
          <Badge variant="secondary" size="sm" className="font-mono text-[9px] text-purple-300 bg-purple-500/20">
            TESTBENCH
          </Badge>
        </div>

        <p className="text-xs text-[var(--ink-2)] leading-relaxed">
          ทดสอบความพร้อมของระบบประมวลผลเวลาสุทธิ (Net Chip Time) และการบันทึกฐานข้อมูลแบบเสมือน
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-[var(--ink-3)] block mb-1">เลข BIB นักวิ่ง</label>
            <Input
              value={testBib}
              onChange={(e) => setTestBib(e.target.value)}
              className="h-9 text-xs font-mono bg-[var(--surface-2)]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[var(--ink-3)] block mb-1">จุดตรวจ (Checkpoint)</label>
            <select
              value={testCheckpoint}
              onChange={(e) => setTestCheckpoint(e.target.value)}
              className="w-full h-9 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-mono text-[var(--ink)] cursor-pointer"
            >
              <option value="CP-START">CP-START (จุดปล่อยตัว)</option>
              <option value="CP-KM5">CP-KM5 (กม. 5 ราชดำเนิน)</option>
              <option value="CP-KM10">CP-KM10 (กม. 10 จุดกลับตัว)</option>
              <option value="CP-FINISH">CP-FINISH (เส้นชัย พระปฐมเจดีย์)</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleSimulateScan}
              disabled={simulating}
              className="w-full h-9 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
            >
              {simulating ? (
                <span>กำลังจำลองสัญญาณ...</span>
              ) : (
                <>
                  <Play className="size-3.5 mr-1" />
                  <span>ยิงสัญญาณจำลอง RFID</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {simResult && (
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 text-purple-300 font-mono text-xs animate-in fade-in">
            {simResult}
          </div>
        )}
      </Card>
    </div>
  );
}
