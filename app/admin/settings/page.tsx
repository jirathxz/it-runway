"use client";

import * as React from "react";
import {
  Settings,
  Shield,
  Database,
  Lock,
  FileText,
  Mail,
  Activity,
  CheckCircle2,
  Server,
  Key,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  const auditMockLogs = [
    {
      id: "LOG-01",
      action: "ADMIN_APPROVE_EVENT",
      user: session?.user?.name || "Admin",
      detail: "อนุมัติคำขอจัดงานวิ่ง นครปฐม มินิมาราธอน 2026",
      ip: "127.0.0.1",
      time: "2 นาทีที่แล้ว",
      status: "SUCCESS",
    },
    {
      id: "LOG-02",
      action: "RFID_CHECKIN_SYNC",
      user: "System Daemon",
      detail: "ซิงค์ข้อมูลสแกนบัตร BIB เข้าฐานข้อมูล Neon DB",
      ip: "10.0.4.12",
      time: "15 นาทีที่แล้ว",
      status: "SUCCESS",
    },
    {
      id: "LOG-03",
      action: "ADMIN_ROLE_PROMOTION",
      user: "Superuser",
      detail: "ปรับระดับสิทธิ์สมาชิก (RBAC Policy Enforcement)",
      ip: "127.0.0.1",
      time: "1 ชั่วโมงที่แล้ว",
      status: "SUCCESS",
    },
    {
      id: "LOG-04",
      action: "PDPA_CONSENT_VERIFY",
      user: "Security Guard",
      detail: "ตรวจสอบความยินยอมข้อมูลส่วนบุคคล (PDPA-TH-2026-V1)",
      ip: "127.0.0.1",
      time: "3 ชั่วโมงที่แล้ว",
      status: "SUCCESS",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              ตั้งค่าระบบและบันทึกความปลอดภัย (Settings & Audit Logs)
            </h1>
          </div>
          <p className="text-xs text-[var(--ink-2)] mt-1">
            การกำหนดค่าเซิร์ฟเวอร์ ความยินยอม PDPA และบันทึกประวัติการกระทำของแอดมิน (Audit Trail)
          </p>
        </div>

        <Badge variant="default" size="sm" className="bg-amber-500 text-slate-950 font-bold font-mono text-[10px] self-start sm:self-auto">
          PROD ENVIRONMENT
        </Badge>
      </div>

      {/* System Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Infrastructure & DB */}
        <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Database className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--ink)]">โครงสร้างฐานข้อมูล & คลาวด์</h3>
              <p className="text-[11px] text-[var(--ink-3)] font-mono">Neon Serverless PostgreSQL</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">PostgreSQL Engine:</span>
              <span className="font-bold text-emerald-400">v16 (Serverless Autoscaling)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">ORM Framework:</span>
              <span className="font-bold text-[var(--ink)]">Drizzle ORM 0.45</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">Connection Pooler:</span>
              <span className="font-bold text-emerald-400">Pooled (Transaction Mode)</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Security & PDPA */}
        <Card className="p-5 border-[var(--line)] bg-[var(--surface)] flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Shield className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--ink)]">ความปลอดภัย & มาตรฐาน PDPA</h3>
              <p className="text-[11px] text-[var(--ink-3)] font-mono">Data Protection Policy 2026</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">PDPA Version:</span>
              <span className="font-bold text-[var(--ink)]">PDPA-TH-2026-V1 (Active)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">Session Policy:</span>
              <span className="font-bold text-[var(--ink)]">Better Auth Session Tokens</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)]">
              <span className="text-[var(--ink-3)]">RBAC Enforcement:</span>
              <span className="font-bold text-emerald-400">Admin, Organizer, Athlete</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Trail Log Table */}
      <Card className="border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-amber-400" />
            <h3 className="font-bold font-[var(--font-display)] text-sm text-[var(--ink)]">
              บันทึกกิจกรรมแอดมิน (Admin Audit Trail Logs)
            </h3>
          </div>
          <Badge variant="outline" size="sm" className="font-mono text-[9px] text-[var(--ink-3)]">
            IMMUTABLE LOGS
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--line)] text-[10px] font-mono text-[var(--ink-3)] uppercase">
              <tr>
                <th className="py-2 px-3">Log ID</th>
                <th className="py-2 px-3">การกระทำ (Action)</th>
                <th className="py-2 px-3">ผู้ดำเนินการ</th>
                <th className="py-2 px-3">รายละเอียด</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">เวลา</th>
                <th className="py-2 px-3 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono text-xs">
              {auditMockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{log.id}</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--ink)]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[var(--ink-2)]">{log.user}</td>
                  <td className="py-2.5 px-3 font-sans text-[var(--ink)] max-w-xs truncate">{log.detail}</td>
                  <td className="py-2.5 px-3 text-[var(--ink-3)]">{log.ip}</td>
                  <td className="py-2.5 px-3 text-[var(--ink-3)]">{log.time}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant="default" size="sm" className="bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
