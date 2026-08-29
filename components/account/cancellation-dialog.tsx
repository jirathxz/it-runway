"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Ticket,
  Calendar,
  MapPin,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: {
    id: string;
    bibNumber: string;
    eventTitle: string;
    eventDate: string;
    distance: string;
    location: string;
  } | null;
  onCancelSuccess: (registrationId: string, refundRef: string) => void;
}

export function CancellationDialog({
  open,
  onOpenChange,
  registration,
  onCancelSuccess,
}: CancellationDialogProps) {
  const [reason, setReason] = React.useState("บาดเจ็บจากการฝึกซ้อม");
  const [customReason, setCustomReason] = React.useState("");
  const [refundMethod, setRefundMethod] = React.useState<"promptpay" | "bank">("promptpay");
  const [refundAccount, setRefundAccount] = React.useState("");
  const [refundBank, setRefundBank] = React.useState("ธนาคารกสิกรไทย (KBANK)");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!registration) return null;

  const handleConfirmCancel = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const finalReason = reason === "อื่นๆ" ? customReason || "อื่นๆ" : reason;
      const res = await fetch("/api/events/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          reason: finalReason,
          refundAccount: refundAccount || "คืนเข้าบัญชีเดิมที่ชำระเงิน",
          refundBank: refundMethod === "bank" ? refundBank : "PromptPay",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการยกเลิกการสมัคร");
      }

      setLoading(false);
      onCancelSuccess(registration.id, data.refundRef);
      onOpenChange(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || "ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto p-0 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--line)] bg-red-500/10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
            <AlertTriangle className="size-4" />
            <span>EVENT CANCELLATION & REFUND</span>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
            ขอยกเลิกการสมัครและขอคืนเงิน
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--ink-2)]">
            กรุณาตรวจสอบรายละเอียดและระบุเหตุผลในการขอยกเลิกการแข่งขัน
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Target Event Summary Card */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                {registration.eventTitle}
              </span>
              <Badge variant="surface" className="text-[10px] font-mono text-[var(--accent)]">
                BIB {registration.bibNumber}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-3)] font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="size-3 text-[var(--accent)]" />
                {registration.eventDate}
              </span>
              <span>ระยะ {registration.distance}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <XCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Reason Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold font-mono text-[var(--ink)]">
              1. โปรดระบุเหตุผลในการขอยกเลิก:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "บาดเจ็บจากการฝึกซ้อม",
                "ติดภารกิจด่วน / ติดงาน",
                "ปัญหาสุขภาพ / ไม่สะดวกเดินทาง",
                "อื่นๆ",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                    reason === r
                      ? "bg-red-500/10 border-red-500/50 text-red-400 font-bold"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--ink-3)]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason === "อื่นๆ" && (
              <Input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="โปรดระบุรายละเอียดเพิ่มเติม..."
                className="mt-1 text-xs"
              />
            )}
          </div>

          {/* Refund Method */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold font-mono text-[var(--ink)]">
              2. ช่องทางรับเงินคืน (Refund Destination):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRefundMethod("promptpay")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center",
                  refundMethod === "promptpay"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]"
                )}
              >
                พร้อมเพย์ (PromptPay)
              </button>

              <button
                type="button"
                onClick={() => setRefundMethod("bank")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center",
                  refundMethod === "bank"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]"
                )}
              >
                โอนเข้าบัญชีธนาคาร
              </button>
            </div>

            {refundMethod === "promptpay" ? (
              <Input
                value={refundAccount}
                onChange={(e) => setRefundAccount(e.target.value)}
                placeholder="เบอร์โทรศัพท์ / เลขบัตรประชาชนที่ผูกพร้อมเพย์"
                className="text-xs font-mono"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                  placeholder="ชื่อธนาคาร (เช่น กสิกรไทย, ไทยพาณิชย์)"
                  className="text-xs"
                />
                <Input
                  value={refundAccount}
                  onChange={(e) => setRefundAccount(e.target.value)}
                  placeholder="เลขที่บัญชีธนาคาร"
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Refund Policy Terms */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1 text-[11px] text-amber-300">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="size-3.5 shrink-0" />
              <span>นโยบายและข้อกำหนดการยกเลิก:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-200/90">
              <li>การยกเลิกก่อนวันแข่งขัน จะได้รับเงินคืนตามระเบียบสมาคมผู้จัดงานวิ่งนครปฐม</li>
              <li>ระบบจะทำการโอนเงินคืนภายใน 1-3 วันทำการ</li>
              <li>เมื่อยืนยันแล้ว หมายเลข BIB จะถูกยกเลิกและไม่สามารถนำไปใช้วิ่งในวันงานได้</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 text-xs"
            >
              ย้อนกลับ
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={loading}
              className="flex-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <span>ยืนยันการยกเลิกการสมัคร</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
