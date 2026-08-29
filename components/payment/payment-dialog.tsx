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
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Timer,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Ticket,
  Zap,
  XCircle,
  Sparkles,
  User,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkProfileCompleteness,
  DEMO_RUNNER_PRESETS,
  DEMO_FIELD_DEFAULTS,
} from "@/lib/demo-runner-data";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    location: string;
    date: string | Date;
  };
  distance: string;
  tshirtSize: string;
  shippingStatus: "pickup" | "delivered";
  totalPrice: number;
  onPaymentSuccess: (bibNumber: string, registration: any) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  event,
  distance,
  tshirtSize,
  shippingStatus,
  totalPrice,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<"promptpay" | "card" | "banking" | "wallet">("promptpay");
  const [processing, setProcessing] = React.useState(false);
  const [processStep, setProcessStep] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);
  const [countdown, setCountdown] = React.useState(600); // 10 minutes
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Runner Profile & Validation State
  const [profile, setProfile] = React.useState<any>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = React.useState(false);

  // Load Profile on Open
  React.useEffect(() => {
    if (!open) return;
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load user profile in payment dialog:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [open]);

  // Handle Save Profile
  const handleSaveProfile = async (updatedData?: any) => {
    const target = updatedData || profile;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, ...target }));
        setErrorMsg(null);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFillAllDemoAndSave = async () => {
    const demoData = DEMO_RUNNER_PRESETS[0].data;
    const merged = { ...profile, ...demoData };
    setProfile(merged);
    await handleSaveProfile(merged);
  };

  // Card form state
  const [cardNumber, setCardNumber] = React.useState("4111 2222 3333 4444");
  const [cardHolder, setCardHolder] = React.useState("TEST RUNNER");
  const [cardExp, setCardExp] = React.useState("12/28");
  const [cardCvc, setCardCvc] = React.useState("123");

  const [selectedBank, setSelectedBank] = React.useState<string>("kbank");
  const [walletPhone, setWalletPhone] = React.useState("081-234-5678");

  const refCode = React.useMemo(() => `REF-NP${Math.floor(100000 + Math.random() * 900000)}`, [open]);

  // Countdown timer
  React.useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSimulatePayment = async () => {
    setErrorMsg(null);
    setProcessing(true);

    try {
      setProcessStep("กำลังส่งข้อมูลไปยังระบบธนาคาร / Payment Gateway...");
      await new Promise((r) => setTimeout(r, 800));

      setProcessStep("ยืนยันยอดเงินและอนุมัติการชำระเงินสำเร็จ...");
      await new Promise((r) => setTimeout(r, 800));

      setProcessStep("กำลังสร้างหมายเลข BIB และ RFID Chip Code ในระบบ...");
      
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          distance,
          tshirtSize,
          shippingStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการลงทะเบียน");
      }

      await new Promise((r) => setTimeout(r, 500));
      setProcessing(false);
      onPaymentSuccess(data.registration.bibNumber, data.registration);
      onOpenChange(false);
    } catch (err: any) {
      setProcessing(false);
      setErrorMsg(err?.message || "การชำระเงินล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92dvh] overflow-y-auto p-0 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--line)] bg-[var(--surface-2)]/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Badge variant="surface" className="text-[10px] font-mono border-amber-500/30 text-amber-300">
              SIMULATED CHECKOUT GATEWAY
            </Badge>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] font-bold">
              <Timer className="size-3.5" />
              <span>{formatTimer(countdown)}</span>
            </div>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold font-[var(--font-display)] text-[var(--ink)]">
            ชำระเงินค่าสมัครการแข่งขัน
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--ink-2)]">
            {event.title} • ระยะ {distance} • ไซส์ {tshirtSize}
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* RUNNER PROFILE COMPLETENESS CHECK & DEMO FILL */}
          {(() => {
            const completeness = profile
              ? checkProfileCompleteness(profile)
              : { isComplete: false, missing: [], completedCount: 0, totalRequired: 7, percentage: 0 };

            if (!completeness.isComplete) {
              return (
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-amber-300 font-[var(--font-display)]">
                          ข้อมูลส่วนตัวนักวิ่งยังไม่ครบถ้วน ({completeness.completedCount}/{completeness.totalRequired})
                        </h4>
                        <p className="text-[11px] text-[var(--ink-2)]">
                          ระบบจะไม่อนุญาตให้สมัครจนกว่าจะระบุข้อมูลจำเป็นครบเพื่อความปลอดภัย
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Missing Fields Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {completeness.missing.map((m) => (
                      <span
                        key={m.key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-mono border border-amber-500/30"
                      >
                        <XCircle className="size-2.5 text-amber-300 shrink-0" />
                        <span>ขาด: {m.label}</span>
                      </span>
                    ))}
                  </div>

                  {/* 1-Click Fill All Demo Data Button */}
                  <div className="pt-2.5 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-amber-200/90">
                      เติมข้อมูลทดสอบเพื่อปลดล็อกทันที:
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleFillAllDemoAndSave}
                      disabled={savingProfile}
                      className="h-8 px-3 font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black shadow-sm cursor-pointer"
                    >
                      <Zap className="size-3.5 mr-1" />
                      <span>กรอก Demo ทั้งหมด & ปลดล็อก</span>
                    </Button>
                  </div>

                  {/* Quick Individual Form with Demo Buttons */}
                  <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Name */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">ชื่อ-นามสกุล</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              name: DEMO_FIELD_DEFAULTS.name,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <Input
                        value={profile?.name || ""}
                        onChange={(e) =>
                          setProfile((prev: any) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="เช่น ธนภัทร รุ่งเรือง"
                        className="h-8 text-xs bg-[var(--base)]/60"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">เบอร์โทรศัพท์</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              phone: DEMO_FIELD_DEFAULTS.phone,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <Input
                        value={profile?.phone || ""}
                        onChange={(e) =>
                          setProfile((prev: any) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="เช่น 081-234-5678"
                        className="h-8 text-xs font-mono bg-[var(--base)]/60"
                      />
                    </div>

                    {/* Birthdate */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">วันเกิด</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              birthdate: DEMO_FIELD_DEFAULTS.birthdate,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <Input
                        type="date"
                        value={profile?.birthdate || ""}
                        onChange={(e) =>
                          setProfile((prev: any) => ({ ...prev, birthdate: e.target.value }))
                        }
                        className="h-8 text-xs font-mono bg-[var(--base)]/60"
                      />
                    </div>

                    {/* Blood Type */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">กรุ๊ปเลือด</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              bloodType: DEMO_FIELD_DEFAULTS.bloodType,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <select
                        value={profile?.bloodType || "O+"}
                        onChange={(e) =>
                          setProfile((prev: any) => ({ ...prev, bloodType: e.target.value }))
                        }
                        className="w-full h-8 rounded-lg border border-[var(--line)] bg-[var(--base)]/60 px-2 text-xs text-[var(--ink)] font-mono"
                      >
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                      </select>
                    </div>

                    {/* Emergency Name */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">ผู้ติดต่อฉุกเฉิน</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              emergencyName: DEMO_FIELD_DEFAULTS.emergencyName,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <Input
                        value={profile?.emergencyName || ""}
                        onChange={(e) =>
                          setProfile((prev: any) => ({
                            ...prev,
                            emergencyName: e.target.value,
                          }))
                        }
                        placeholder="เช่น คุณสมศรี ใจดี (มารดา)"
                        className="h-8 text-xs bg-[var(--base)]/60"
                      />
                    </div>

                    {/* Emergency Phone */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ink-2)]">เบอร์ติดต่อฉุกเฉิน</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              emergencyPhone: DEMO_FIELD_DEFAULTS.emergencyPhone,
                            }))
                          }
                          className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="size-2.5" /> Demo
                        </button>
                      </div>
                      <Input
                        value={profile?.emergencyPhone || ""}
                        onChange={(e) =>
                          setProfile((prev: any) => ({
                            ...prev,
                            emergencyPhone: e.target.value,
                          }))
                        }
                        placeholder="เช่น 089-876-5432"
                        className="h-8 text-xs font-mono bg-[var(--base)]/60"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveProfile()}
                      disabled={savingProfile}
                      className="h-8 text-xs font-bold bg-[var(--accent)] text-[var(--accent-ink)] cursor-pointer"
                    >
                      {savingProfile ? "กำลังบันทึก..." : "บันทึกและปลดล็อกการสมัคร"}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="font-bold">
                    ข้อมูลนักวิ่งสมบูรณ์ ({profile?.name} • {profile?.phone})
                  </span>
                </div>
                <Badge variant="default" className="text-[10px] bg-emerald-600 font-mono">
                  VERIFIED
                </Badge>
              </div>
            );
          })()}

          {/* Order Summary Pill */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-[var(--ink-3)]">ยอดชำระสุทธิ</span>
              <span className="font-[var(--font-bib)] text-2xl sm:text-3xl font-black text-[var(--accent)] tabular-nums">
                {totalPrice.toLocaleString()} <span className="text-xs font-sans font-normal text-[var(--ink-2)]">บาท</span>
              </span>
            </div>
            <div className="text-right text-[11px] font-mono text-[var(--ink-3)]">
              <div>Ref: <span className="text-[var(--ink-2)] font-bold">{refCode}</span></div>
              <div>วิธีรับ: {shippingStatus === "delivered" ? "จัดส่งไปรษณีย์ (+60฿)" : "รับหน้างาน (ฟรี)"}</div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold font-mono text-[var(--ink)]">เลือกช่องทางการชำระเงิน:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("promptpay")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === "promptpay"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                )}
              >
                <QrCode className="size-5" />
                <span className="text-[11px]">พร้อมเพย์ QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === "card"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                )}
              >
                <CreditCard className="size-5" />
                <span className="text-[11px]">บัตรเครดิต</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("banking")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === "banking"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                )}
              >
                <Building2 className="size-5" />
                <span className="text-[11px]">Mobile Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={cn(
                  "p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer",
                  paymentMethod === "wallet"
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold border-[var(--accent)] shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--ink-3)]"
                )}
              >
                <Wallet className="size-5" />
                <span className="text-[11px]">TrueMoney</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* METHOD 1: PromptPay QR */}
          {paymentMethod === "promptpay" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
              <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-sky-800 flex flex-col items-center gap-2 max-w-[240px] text-center">
                {/* PromptPay Banner */}
                <div className="w-full bg-[#113566] text-white py-1 px-3 rounded-md text-[11px] font-black tracking-widest uppercase">
                  PROMPTPAY
                </div>

                {/* Simulated QR Pattern */}
                <div className="size-40 bg-zinc-950 p-2 rounded-xl flex items-center justify-center relative">
                  {/* Stylized QR SVG */}
                  <svg className="size-full text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2zm2 2v4h4V4zm8-2h8v8h-8zm2 2v4h4V4zM2 12h8v8H2zm2 2v4h4v-4zm11 1h2v2h-2zm3-3h2v4h-2zm-3 5h4v2h-4zm2-4h2v2h-2zm2 4h2v2h-2z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 rounded-full bg-white flex items-center justify-center shadow-md">
                      <span className="font-mono font-black text-[9px] text-[#113566]">IT</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-zinc-800 font-mono">
                  {totalPrice.toLocaleString()} THB
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-semibold text-[var(--ink)]">
                  สแกน QR Code ด้วยแอปธนาคารทุกแห่งในไทย
                </span>
                <span className="text-[11px] text-[var(--ink-3)] font-mono">
                  ระบบจะตรวจจับการชำระเงินอัตโนมัติแบบเรียลไทม์
                </span>
              </div>
            </div>
          )}

          {/* METHOD 2: Credit / Debit Card */}
          {paymentMethod === "card" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[var(--ink-3)]">หมายเลขบัตรเครดิต / เดบิต</label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[var(--ink-3)]">ชื่อผู้ถือบัตร (Cardholder Name)</label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NAME SURNAME"
                  className="font-mono text-xs uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-[var(--ink-3)]">วันหมดอายุ (MM/YY)</label>
                  <Input
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-[var(--ink-3)]">รหัสความปลอดภัย (CVV)</label>
                  <Input
                    type="password"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[11px] text-[var(--ink-3)]">
                <ShieldCheck className="size-4 text-[var(--positive)] shrink-0" />
                <span>จำลองระบบความปลอดภัยมาตรฐาน PCI-DSS & 3D Secure</span>
              </div>
            </div>
          )}

          {/* METHOD 3: Mobile Banking */}
          {paymentMethod === "banking" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <span className="text-xs text-[var(--ink-2)]">เลือกธนาคารของคุณเพื่อเปิดแอปพลิเคชัน:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBank("kbank")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer",
                    selectedBank === "kbank"
                      ? "bg-emerald-600/15 border-emerald-500 text-emerald-400 font-bold"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)]"
                  )}
                >
                  <div className="size-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black">K</div>
                  <span>K PLUS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBank("scb")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer",
                    selectedBank === "scb"
                      ? "bg-purple-600/15 border-purple-500 text-purple-400 font-bold"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)]"
                  )}
                >
                  <div className="size-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px] font-black">S</div>
                  <span>SCB EASY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBank("ktb")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer",
                    selectedBank === "ktb"
                      ? "bg-sky-600/15 border-sky-500 text-sky-400 font-bold"
                      : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)]"
                  )}
                >
                  <div className="size-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-[10px] font-black">N</div>
                  <span>Krungthai NEXT</span>
                </button>
              </div>
            </div>
          )}

          {/* METHOD 4: TrueMoney */}
          {paymentMethod === "wallet" && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[var(--ink-3)]">เบอร์โทรศัพท์บัญชี TrueMoney</label>
                <Input
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="font-mono text-xs"
                />
              </div>
              <span className="text-[11px] text-[var(--ink-3)] font-mono">
                ระบบจะส่งรหัส OTP หรือคำขอยืนยันไปยังแอป TrueMoney ของคุณ
              </span>
            </div>
          )}

          {/* Processing Status Banner */}
          {processing && (
            <div className="p-4 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 flex items-center gap-3 animate-pulse">
              <Loader2 className="size-5 animate-spin text-[var(--accent)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--ink)]">กำลังดำเนินการชำระเงิน</span>
                <span className="text-[11px] font-mono text-[var(--accent)]">{processStep}</span>
              </div>
            </div>
          )}

          {/* Simulated Action Button */}
          {(() => {
            const isProfileComplete = profile ? checkProfileCompleteness(profile).isComplete : false;
            return (
              <Button
                size="lg"
                onClick={handleSimulatePayment}
                disabled={processing || !isProfileComplete || loadingProfile}
                className={cn(
                  "w-full h-12 text-sm font-bold shadow-md cursor-pointer",
                  !isProfileComplete && "opacity-60 cursor-not-allowed bg-[var(--surface-2)] text-[var(--ink-3)] hover:bg-[var(--surface-2)]"
                )}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    <span>กำลังประมวลผลธุรกรรม...</span>
                  </>
                ) : !isProfileComplete ? (
                  <>
                    <AlertCircle className="size-4 mr-2 text-amber-400" />
                    <span>กรุณากรอกข้อมูลนักวิ่งให้ครบก่อน (ใช้ปุ่ม Demo ด้านบน)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    <span>จำลองการชำระเงิน {totalPrice.toLocaleString()} บาท (สำเร็จทันที)</span>
                  </>
                )}
              </Button>
            );
          })()}

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[var(--ink-3)]">
            <ShieldCheck className="size-3.5 text-[var(--positive)]" />
            <span>Sandbox Mode • ข้อมูลการชำระเงินจำลองเพื่อการทดสอบระบบ</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
