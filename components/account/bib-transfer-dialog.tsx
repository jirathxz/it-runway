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
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Phone,
  HeartPulse,
  Sparkles,
} from "lucide-react";

interface BibTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bib: {
    id: string;
    bibNumber: string;
    eventTitle: string;
    distance: string;
    tshirtSize: string;
    chipCode?: string;
  } | null;
  onTransferSuccess: () => void;
}

export function BibTransferDialog({
  open,
  onOpenChange,
  bib,
  onTransferSuccess,
}: BibTransferDialogProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientGender, setRecipientGender] = useState("male");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("ไม่มีโรคประจำตัว");
  const [transferReason, setTransferReason] = useState("ติดภารกิจส่วนตัว");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 1-Click Demo Fill for easy testing
  const handleFillDemoRecipient = (type: "female" | "male") => {
    if (type === "female") {
      setRecipientName("กานดา สุวรรณภูมิ (Kanda Runway)");
      setRecipientPhone("082-998-1122");
      setRecipientEmail("kanda.runway@example.com");
      setRecipientGender("female");
      setEmergencyName("คุณวิชาญ สุวรรณภูมิ (บิดา)");
      setEmergencyPhone("086-554-3321");
      setMedicalConditions("ไม่มีโรคประจำตัว");
      setTransferReason("ติดภารกิจเดินทางต่างจังหวัด");
    } else {
      setRecipientName("สมชาย รักสงบ (Somchai Runner)");
      setRecipientPhone("085-333-7788");
      setRecipientEmail("somchai.runner@example.com");
      setRecipientGender("male");
      setEmergencyName("คุณสุภาพร รักสงบ (ภรรยา)");
      setEmergencyPhone("084-222-9900");
      setMedicalConditions("ไม่มีโรคประจำตัว");
      setTransferReason("มีอาการบาดเจ็บกล้ามเนื้อ");
    }
  };

  const handleTransfer = async () => {
    if (!bib) return;
    setError(null);

    if (!recipientName.trim() || !recipientPhone.trim() || !emergencyName.trim() || !emergencyPhone.trim()) {
      setError("กรุณากรอกข้อมูลผู้รับโอนสิทธิ์และข้อมูลติดต่อฉุกเฉินให้ครบถ้วน");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/events/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: bib.id,
          newRunnerName: recipientName,
          newRunnerPhone: recipientPhone,
          newRunnerEmail: recipientEmail,
          newGender: recipientGender,
          newEmergencyName: emergencyName,
          newEmergencyPhone: emergencyPhone,
          newMedicalConditions: medicalConditions,
          transferReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการโอนสิทธิ์");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onTransferSuccess();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถดำเนินการโอนสิทธิ์ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!bib) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] border-[var(--line)] p-6 text-[var(--ink)]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
              <UserCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-[var(--font-display)]">
                โอนสิทธิ์ BIB ให้เพื่อน (BIB Transfer)
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--ink-2)]">
                โอนสิทธิ์เบอร์วิ่งและสถิติให้แก่นักวิ่งท่านอื่นอย่างปลอดภัย
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in">
            <div className="size-14 rounded-full bg-[var(--positive)]/20 border border-[var(--positive)]/40 flex items-center justify-center text-[var(--positive)]">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-base font-bold text-[var(--ink)]">โอนสิทธิ์ BIB เรียบร้อยแล้ว!</h3>
            <p className="text-xs text-[var(--ink-2)] max-w-sm">
              ระบบได้ส่งต่อ BIB หมายเลข <span className="font-bold text-[var(--accent)]">{bib.bibNumber}</span> ให้แก่คุณ {recipientName} เรียบร้อยแล้ว
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* BIB Summary Card */}
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-[var(--ink-3)] uppercase">รายการที่จะโอนสิทธิ์</span>
                <span className="text-xs font-bold text-[var(--ink)] line-clamp-1">{bib.eventTitle}</span>
                <div className="flex items-center gap-2 text-[11px] text-[var(--ink-2)] font-mono">
                  <span>ระยะ: <strong className="text-[var(--accent)]">{bib.distance}</strong></span>
                  <span>•</span>
                  <span>ไซส์เสื้อ: <strong>{bib.tshirtSize}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="accent" className="font-mono text-sm px-3 py-1 font-bold">
                  BIB {bib.bibNumber}
                </Badge>
              </div>
            </div>

            {/* Quick 1-Click Demo Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <span className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[var(--accent)]" />
                <span>กรอก Demo ผู้รับสิทธิ์ทันที:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleFillDemoRecipient("female")}
                  className="h-7 text-[11px] gap-1 cursor-pointer bg-[var(--surface)]"
                >
                  <Zap className="size-2.5 text-[var(--accent)]" />
                  <span>Demo กานดา (หญิง)</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleFillDemoRecipient("male")}
                  className="h-7 text-[11px] gap-1 cursor-pointer bg-[var(--surface)]"
                >
                  <Zap className="size-2.5 text-[var(--accent)]" />
                  <span>Demo สมชาย (ชาย)</span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Recipient Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recipient Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                    <span>ชื่อ - นามสกุล ผู้รับสิทธิ์</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="เช่น กานดา สุวรรณภูมิ"
                    className="h-9 text-xs"
                  />
                </div>

                {/* Recipient Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                    <span>เบอร์โทรศัพท์</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="เช่น 082-998-1122"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recipient Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)]">
                    อีเมล (สำหรับเชื่อมบัญชี IT Runway)
                  </label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                {/* Recipient Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)]">เพศ</label>
                  <select
                    value={recipientGender}
                    onChange={(e) => setRecipientGender(e.target.value)}
                    className="w-full h-9 rounded-lg border border-[var(--line)] bg-[var(--base)] px-2.5 text-xs text-[var(--ink)]"
                  >
                    <option value="male">ชาย (Male)</option>
                    <option value="female">หญิง (Female)</option>
                    <option value="other">อื่นๆ (Other)</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[var(--line)]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                    <span>ผู้ติดต่อฉุกเฉินของผู้รับ</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="เช่น คุณวิชาญ สุวรรณภูมิ"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                    <span>เบอร์ติดต่อฉุกเฉิน</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="เช่น 086-554-3321"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Medical & Reason */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ink-2)]">โรคประจำตัว / ข้อควรระวัง</label>
                <Input
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="เช่น ไม่มีโรคประจำตัว หรือ ภูมิแพ้"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Transfer Policy Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>นโยบายการโอนสิทธิ์:</strong> ไม่มีค่าธรรมเนียมโอนสิทธิ์ รหัสชิป RFID จะถูกอัปเดตใหม่อัตโนมัติ เมื่อยืนยันแล้ว BIB นี้จะถูกโอนไปให้ผู้รับสิทธิ์คนใหม่ทันที
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleTransfer}
                disabled={loading}
                className="text-xs font-bold gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>กำลังดำเนินการโอนสิทธิ์...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="size-3.5" />
                    <span>ยืนยันการโอนสิทธิ์ BIB</span>
                    <ArrowRight className="size-3" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
