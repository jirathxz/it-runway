"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { AccountNav } from "./account-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  HeartPulse,
  Shirt,
  Flame,
  CheckCircle2,
  Lock,
  LogOut,
  Sparkles,
  Award,
  IdCard,
  Save,
  Shield,
  ExternalLink,
  Loader2,
  LogIn,
  Camera,
  Upload,
  RefreshCw,
  X,
  ImageIcon,
  Zap,
  Footprints,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  checkProfileCompleteness,
  DEMO_RUNNER_PRESETS,
  DEMO_FIELD_DEFAULTS,
} from "@/lib/demo-runner-data";

interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  image?: string;
  isGoogleUser?: boolean;
  googleImage?: string;
  phone: string;
  gender: string;
  birthdate: string;
  bloodType: string;
  emergencyName: string;
  emergencyPhone: string;
  medicalConditions: string;
  tshirtSize: string;
  preferredDistance: string;
  runningClub: string;
  targetPace: string;
  chipCode: string;
}

export function AccountProfileView() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [profile, setProfile] = useState<UserProfileData>({
    name: "",
    email: "",
    image: "",
    isGoogleUser: false,
    googleImage: "",
    phone: "",
    gender: "male",
    birthdate: "",
    bloodType: "O+",
    emergencyName: "",
    emergencyPhone: "",
    medicalConditions: "",
    tshirtSize: "L",
    preferredDistance: "21K",
    runningClub: "",
    targetPace: "",
    chipCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [bibCount, setBibCount] = useState(0);

  // Avatar Edit Modal State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real data from DB
  useEffect(() => {
    async function loadData() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileRes, bibsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/bibs"),
        ]);

        if (profileRes.ok) {
          const p = await profileRes.json();
          setProfile({
            id: p.id,
            name: p.name || session.user.name || "",
            email: p.email || session.user.email || "",
            image: p.image || session.user.image || "",
            isGoogleUser: Boolean(p.isGoogleUser),
            googleImage: p.googleImage || session.user.image || "",
            phone: p.phone || "",
            gender: p.gender || "male",
            birthdate: p.birthdate || "",
            bloodType: p.bloodType || "O+",
            emergencyName: p.emergencyName || "",
            emergencyPhone: p.emergencyPhone || "",
            medicalConditions: p.medicalConditions || "",
            tshirtSize: p.tshirtSize || "L",
            preferredDistance: p.preferredDistance || "21K",
            runningClub: p.runningClub || "",
            targetPace: p.targetPace || "",
            chipCode: p.chipCode || `RFID-TH-73000-${p.id?.slice(-4).toUpperCase() || "RUN"}`,
          });
        }

        if (bibsRes.ok) {
          const b = await bibsRes.json();
          setBibCount(b.bibs?.length || 0);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setSaveMessage("บันทึกข้อมูลบัญชีนักวิ่งลงฐานข้อมูลสำเร็จเรียบร้อยแล้ว");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  // Handle File Selection (Upload custom photo)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Selected Custom Image to DB
  const handleSaveAvatar = async (newImageUrl?: string) => {
    const targetImage = newImageUrl || avatarPreview;
    if (!targetImage) return;

    setAvatarUploading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: targetImage }),
      });

      if (res.ok) {
        setProfile((prev) => ({ ...prev, image: targetImage }));
        setAvatarPreview(null);
        setAvatarModalOpen(false);
        setSaveSuccess(true);
        setSaveMessage("อัปเดตรูปภาพโปรไฟล์นักวิ่งลงฐานข้อมูลสำเร็จแล้ว");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert("ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Avatar save error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Reset to Google Account Profile Picture
  const handleResetToGoogleAvatar = async () => {
    const googlePhoto = profile.googleImage || session?.user?.image;
    if (!googlePhoto) {
      alert("ไม่พบรูปภาพเริ่มต้นจากบัญชี Google");
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: googlePhoto }),
      });

      if (res.ok) {
        setProfile((prev) => ({ ...prev, image: googlePhoto }));
        setAvatarPreview(null);
        setAvatarModalOpen(false);
        setSaveSuccess(true);
        setSaveMessage("รีเซ็ตรูปโปรไฟล์เป็นค่าเริ่มต้นจากบัญชี Google เรียบร้อยแล้ว");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert("ไม่สามารถเปลี่ยนรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Google avatar reset error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--accent)]" />
        <span className="text-xs font-mono text-[var(--ink-3)]">
          กำลังโหลดข้อมูลนักวิ่งจากฐานข้อมูล...
        </span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-full max-w-lg mx-auto py-12">
        <Card className="p-8 text-center border-[var(--line)] bg-[var(--surface)] shadow-lg">
          <User className="size-12 mx-auto text-[var(--accent)] mb-3" />
          <CardTitle className="text-xl mb-2">เข้าสู่ระบบเพื่อดูข้อมูลนักวิ่ง</CardTitle>
          <CardDescription className="mb-6">
            กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว ขนาดเสื้อ และบัตรประจำตัวนักวิ่ง (BIB)
          </CardDescription>
          <Button asChild className="w-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold cursor-pointer">
            <Link href="/auth/sign-in">
              <LogIn className="size-4 mr-2" />
              เข้าสู่ระบบ / สมัครสมาชิก
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "user";
  const isAdmin = userRole === "admin";
  const currentAvatarSrc = profile.image || session?.user?.image || undefined;
  const userInitials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "RN";

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Account Sub-navigation Bar */}
      <AccountNav bibCount={bibCount} />

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Runner ID Card & Quick Summary (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="relative overflow-hidden border-[var(--line)] bg-gradient-to-b from-[var(--surface)] to-[var(--surface-2)] shadow-[var(--shadow-far)]">
            <div className="h-2 w-full bg-[var(--accent)]" />

            <CardHeader className="flex flex-col items-center text-center pb-3">
              {/* Profile Avatar with Edit Camera Button */}
              <div className="relative mb-3 group">
                <Avatar className="size-20 sm:size-24 border-2 border-[var(--accent)] shadow-lg">
                  <AvatarImage
                    src={currentAvatarSrc}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-xl font-bold bg-[var(--surface-2)] text-[var(--accent)] font-mono">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Camera Overlay Icon */}
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute bottom-0 right-0 size-7 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] border-2 border-[var(--surface)] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="แก้ไขรูปภาพโปรไฟล์"
                >
                  <Camera className="size-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Edit Avatar Trigger Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAvatarModalOpen(true)}
                className="h-7 px-3 text-[11px] font-semibold mb-2 border-[var(--line)] hover:border-[var(--accent)] text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
              >
                <Camera className="size-3 mr-1 text-[var(--accent)]" />
                <span>แก้ไขรูปภาพโปรไฟล์</span>
              </Button>

              <CardTitle className="text-lg sm:text-xl font-bold text-[var(--ink)]">
                {profile.name || "นักวิ่ง IT Runway"}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-[var(--ink-2)] truncate max-w-full">
                {profile.email}
              </CardDescription>

              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1"
                >
                  {isAdmin ? (
                    <>
                      <Shield className="size-3 text-amber-300" />
                      <span>ADMIN</span>
                    </>
                  ) : (
                    <>
                      <Footprints className="size-3 text-[var(--accent)]" />
                      <span>ATHLETE</span>
                    </>
                  )}
                </Badge>
                <Badge
                  variant="surface"
                  className="font-mono text-[10px] tracking-wider uppercase border-[var(--line)] text-[var(--ink-2)]"
                >
                  NAKHON PATHOM
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <Separator className="bg-[var(--line)]" />

              {/* RFID Timing Chip ID Card Box */}
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--base)]/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-3)] mb-1">
                  <span className="flex items-center gap-1.5">
                    <IdCard className="size-3.5 text-[var(--accent)]" />
                    RUNNER CHIP CODE
                  </span>
                  <span className="text-[var(--positive)] font-bold">ACTIVE</span>
                </div>
                <div className="font-mono text-sm font-bold text-[var(--ink)] tracking-wider">
                  {profile.chipCode || "RFID-TH-73000-READY"}
                </div>
                <p className="text-[10px] text-[var(--ink-3)] mt-1">
                  ชิปจับเวลาสำหรับการบันทึกผลการแข่งขันระบบ Runway Timing Gate
                </p>
              </div>

              {/* Club & Running Stats Summary */}
              <div className="space-y-2.5 text-xs font-[var(--font-text)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-3)] flex items-center gap-1.5">
                    <Award className="size-3.5 text-[var(--accent)]" />
                    สังกัดชมรม / ทีม
                  </span>
                  <span className="font-semibold text-[var(--ink)] truncate max-w-[150px]">
                    {profile.runningClub || "นักวิ่งอิสระ"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-3)] flex items-center gap-1.5">
                    <Flame className="size-3.5 text-amber-500" />
                    ระยะที่ชอบ
                  </span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {profile.preferredDistance}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-3)] flex items-center gap-1.5">
                    <Shirt className="size-3.5 text-blue-400" />
                    ขนาดเสื้อแข่ง
                  </span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    Size {profile.tshirtSize}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold border-[var(--line)] cursor-pointer"
              >
                <Link href="/account/bibs">
                  <IdCard className="size-3.5 mr-1.5 text-[var(--accent)]" />
                  <span>ดู BIB & บัตรวิ่งของฉัน ({bibCount})</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="w-full text-[11px] font-medium text-[var(--ink-2)] hover:text-red-400 cursor-pointer"
              >
                <Link href="/account/bibs?tab=upcoming">
                  <span>จัดการการสมัคร / ขอยกเลิกงานวิ่ง</span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Account Security Info */}
          <Card className="p-4 border-[var(--line)] bg-[var(--surface)] text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
              <Shield className="size-4 text-[var(--positive)]" />
              <span>ความปลอดภัยของบัญชี</span>
            </div>
            <p className="text-[var(--ink-2)] text-[11px]">
              ข้อมูลส่วนบุคคลและข้อมูลสุขภาพของคุณถูกจัดเก็บในฐานข้อมูลอย่างปลอดภัย
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                window.location.href = "/auth/sign-in";
              }}
              className="w-full text-xs font-semibold text-rose-400 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="size-3.5 mr-1.5" />
              <span>ออกจากระบบ</span>
            </Button>
          </Card>
        </div>

        {/* Right Column: Detailed Profile Forms (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* PROFILE COMPLETENESS & DEMO PRESETS WIDGET */}
          {(() => {
            const completeness = checkProfileCompleteness(profile);
            return (
              <Card className="border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[var(--accent)]" />
                      <h3 className="text-sm font-bold font-[var(--font-display)]">
                        สถานะความสมบูรณ์ของข้อมูลนักวิ่ง
                      </h3>
                      <Badge
                        variant={completeness.isComplete ? "default" : "secondary"}
                        className={`font-mono text-[10px] ${
                          completeness.isComplete
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {completeness.isComplete ? "พร้อมสมัครงานวิ่ง" : "ข้อมูลยังไม่ครบ"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--ink-2)] mt-0.5">
                      {completeness.isComplete
                        ? "ข้อมูลครบถ้วนสำหรับการลงทะเบียนและออก BIB ทุกระยะ"
                        : `ยังขาดข้อมูลจำเป็น ${completeness.missing.length} รายการ (ต้องกรอกครบจึงจะสมัครงานวิ่งได้)`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-[var(--ink)]">
                      {completeness.completedCount}/{completeness.totalRequired}
                    </span>
                    <span className="text-[var(--accent)] font-black">
                      ({completeness.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completeness.isComplete
                        ? "bg-emerald-500"
                        : completeness.percentage > 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>

                {/* Missing Fields Tags */}
                {!completeness.isComplete && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Zap className="size-3.5" />
                      <span>รายการที่ยังไม่ได้ระบุ:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {completeness.missing.map((m) => (
                        <span
                          key={m.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-mono border border-amber-500/30"
                        >
                          <XCircle className="size-2.5 text-amber-300 shrink-0" />
                          <span>{m.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click Demo Presets Bar */}
                <div className="pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-[var(--ink-3)]">
                    <span className="flex items-center gap-1 font-semibold text-[var(--ink-2)]">
                      <Zap className="size-3 text-[var(--accent)]" />
                      <span>เติมข้อมูล Demo อัตโนมัติ (1-Click Fill All Demo):</span>
                    </span>
                    <span className="text-[10px]">คลิกเลือกชุดข้อมูลทดสอบ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DEMO_RUNNER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProfile((prev) => ({
                            ...prev,
                            ...preset.data,
                          }));
                          setSaveMessage(`โหลดข้อมูล Demo ชุด "${preset.label}" สำเร็จ (อย่าลืมกดบันทึก)`);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3500);
                        }}
                        className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 text-left transition-all cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--accent)] flex items-center justify-between">
                          <span>{preset.label}</span>
                          <Sparkles className="size-3 opacity-0 group-hover:opacity-100 text-[var(--accent)] transition-opacity" />
                        </div>
                        <p className="text-[10px] text-[var(--ink-3)] mt-0.5 line-clamp-1">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })()}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: ข้อมูลส่วนตัวพื้นฐาน */}
            <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)] overflow-hidden">
              <CardHeader className="bg-[var(--surface-2)]/50 border-b border-[var(--line)] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="size-5 text-[var(--accent)]" />
                    <CardTitle className="text-base font-bold">ข้อมูลส่วนตัวนักวิ่ง</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    PERSONAL INFO
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  ข้อมูลสำหรับการออกบัตรประจำตัวนักวิ่ง (BIB) และติดต่อประสานงาน
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>ชื่อ - นามสกุล (สำหรับพิมพ์บน BIB)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            name: DEMO_FIELD_DEFAULTS.name,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo ชื่อ</span>
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="เช่น สมชาย ใจดี"
                      required
                      className="bg-[var(--base)]/60 h-11 text-xs"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--ink-2)]">
                      อีเมล (สำหรับรับใบเสร็จและ e-Certificate)
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      readOnly
                      disabled
                      className="bg-[var(--surface-2)] h-11 text-xs text-[var(--ink-3)] font-mono cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>เบอร์โทรศัพท์ติดต่อ</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            phone: DEMO_FIELD_DEFAULTS.phone,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo เบอร์โทร</span>
                      </button>
                    </div>
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="เช่น 0812345678"
                      className="bg-[var(--base)]/60 h-11 text-xs font-mono"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>เพศ</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            gender: prev.gender === "male" ? "female" : "male",
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo เพศ</span>
                      </button>
                    </div>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--base)]/60 px-3.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition-all"
                    >
                      <option value="male">ชาย (Male)</option>
                      <option value="female">หญิง (Female)</option>
                      <option value="other">อื่นๆ (Other)</option>
                    </select>
                  </div>

                  {/* Birthdate */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>วัน/เดือน/ปีเกิด (สำหรับแบ่งรุ่นอายุ)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            birthdate: DEMO_FIELD_DEFAULTS.birthdate,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo วันเกิด</span>
                      </button>
                    </div>
                    <Input
                      type="date"
                      value={profile.birthdate}
                      onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                      className="bg-[var(--base)]/60 h-11 text-xs font-mono cursor-pointer"
                    />
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>กรุ๊ปเลือด (สำหรับการแพทย์ฉุกเฉิน)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            bloodType: DEMO_FIELD_DEFAULTS.bloodType,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo กรุ๊ปเลือด</span>
                      </button>
                    </div>
                    <select
                      value={profile.bloodType}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      className="w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--base)]/60 px-3.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer font-mono transition-all"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: ข้อมูลติดต่อฉุกเฉินและสุขภาพ */}
            <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)] overflow-hidden">
              <CardHeader className="bg-[var(--surface-2)]/50 border-b border-[var(--line)] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="size-5 text-rose-400" />
                    <CardTitle className="text-base font-bold">
                      ข้อมูลสุขภาพและการแพทย์ฉุกเฉิน
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-rose-400 border-rose-400/30">
                    MEDICAL
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  ทีมแพทย์สนามจะใช้ข้อมูลนี้ในการดูแลความปลอดภัยของคุณขณะแข่งขัน
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Emergency Contact Name */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>ชื่อผู้ติดต่อกรณีฉุกเฉิน</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            emergencyName: DEMO_FIELD_DEFAULTS.emergencyName,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo ผู้ติดต่อ</span>
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={profile.emergencyName}
                      onChange={(e) =>
                        setProfile({ ...profile, emergencyName: e.target.value })
                      }
                      placeholder="เช่น คุณสมศรี ใจดี (มารดา)"
                      className="bg-[var(--base)]/60 h-11 text-xs"
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>เบอร์โทรติดต่อกรณีฉุกเฉิน</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            emergencyPhone: DEMO_FIELD_DEFAULTS.emergencyPhone,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo เบอร์ฉุกเฉิน</span>
                      </button>
                    </div>
                    <Input
                      type="tel"
                      value={profile.emergencyPhone}
                      onChange={(e) =>
                        setProfile({ ...profile, emergencyPhone: e.target.value })
                      }
                      placeholder="เช่น 0898765432"
                      className="bg-[var(--base)]/60 h-11 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--ink-2)]">
                      ประวัติแพ้ยา หรือโรคประจำตัว (ถ้ามี)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          medicalConditions: DEMO_FIELD_DEFAULTS.medicalConditions,
                        }))
                      }
                      className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Zap className="size-2.5" />
                      <span>Demo ข้อมูลสุขภาพ</span>
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={profile.medicalConditions}
                    onChange={(e) =>
                      setProfile({ ...profile, medicalConditions: e.target.value })
                    }
                    placeholder="เช่น แพ้ยา Penicillin, โรคหอบหืด, ความดันโลหิต (หากไม่มีเว้นว่างได้)"
                    className="bg-[var(--base)]/60 h-11 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: ข้อมูลอุปกรณ์และสถิติวิ่ง */}
            <Card className="border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-far)] overflow-hidden">
              <CardHeader className="bg-[var(--surface-2)]/50 border-b border-[var(--line)] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shirt className="size-5 text-[var(--accent)]" />
                    <CardTitle className="text-base font-bold">ข้อมูลการแข่งขัน & เสื้อวิ่ง</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    GEAR & PACE
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  ขนาดเสื้อและข้อมูลการวิ่งสำหรับการจัดสรร Wave ปล่อยตัว
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* T-Shirt Size */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)] flex items-center gap-1">
                        <span>ขนาดเสื้อวิ่ง (Race T-Shirt)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            tshirtSize: DEMO_FIELD_DEFAULTS.tshirtSize,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo ไซส์ L</span>
                      </button>
                    </div>
                    <select
                      value={profile.tshirtSize}
                      onChange={(e) => setProfile({ ...profile, tshirtSize: e.target.value })}
                      className="w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--base)]/60 px-3.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono font-bold cursor-pointer transition-all"
                    >
                      <option value="XS">XS (รอบอก 34 นิ้ว)</option>
                      <option value="S">S (รอบอก 36 นิ้ว)</option>
                      <option value="M">M (รอบอก 38 นิ้ว)</option>
                      <option value="L">L (รอบอก 40 นิ้ว)</option>
                      <option value="XL">XL (รอบอก 42 นิ้ว)</option>
                      <option value="2XL">2XL (รอบอก 44 นิ้ว)</option>
                      <option value="3XL">3XL (รอบอก 46 นิ้ว)</option>
                    </select>
                  </div>

                  {/* Preferred Distance */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--ink-2)]">
                      ระยะทางที่ถนัด
                    </label>
                    <select
                      value={profile.preferredDistance}
                      onChange={(e) =>
                        setProfile({ ...profile, preferredDistance: e.target.value })
                      }
                      className="w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--base)]/60 px-3.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono cursor-pointer transition-all"
                    >
                      <option value="5K">5 KM (Fun Run)</option>
                      <option value="10K">10 KM (Mini Marathon)</option>
                      <option value="21K">21.1 KM (Half Marathon)</option>
                      <option value="42K">42.195 KM (Marathon)</option>
                      <option value="Trail">Trail Challenge</option>
                    </select>
                  </div>

                  {/* Target Pace */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)]">
                        Pace เฉลี่ย (min/km)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            targetPace: DEMO_FIELD_DEFAULTS.targetPace,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo Pace</span>
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={profile.targetPace}
                      onChange={(e) =>
                        setProfile({ ...profile, targetPace: e.target.value })
                      }
                      placeholder="เช่น 5:15"
                      className="bg-[var(--base)]/60 h-11 text-xs font-mono"
                    />
                  </div>

                  {/* Running Club */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--ink-2)]">
                        สังกัดชมรม / สโมสรวิ่ง
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            runningClub: DEMO_FIELD_DEFAULTS.runningClub,
                          }))
                        }
                        className="text-[10px] font-mono text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Zap className="size-2.5" />
                        <span>Demo ชมรม</span>
                      </button>
                    </div>
                    <Input
                      type="text"
                      value={profile.runningClub}
                      onChange={(e) =>
                        setProfile({ ...profile, runningClub: e.target.value })
                      }
                      placeholder="เช่น Nakhon Pathom Runner Club"
                      className="bg-[var(--base)]/60 h-11 text-xs"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-[var(--surface-2)]/30 border-t border-[var(--line)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[var(--ink-3)] font-mono text-center sm:text-left">
                  ข้อมูลจะถูกบันทึกและเชื่อมโยงกับฐานข้อมูลนักวิ่งโดยตรง
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 font-bold px-8 shadow-md cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      <span>กำลังบันทึกข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      <span>บันทึกข้อมูลโปรไฟล์</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AVATAR EDIT MODAL DIALOG */}
      {/* ========================================================================= */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setAvatarModalOpen(false);
                setAvatarPreview(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="size-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
                <Camera className="size-6" />
              </div>
              <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-[var(--ink)]">
                แก้ไขรูปภาพโปรไฟล์นักวิ่ง
              </h3>
              <p className="text-xs text-[var(--ink-2)] mt-1">
                เลือกรูปภาพใหม่จากอุปกรณ์ของคุณ หรือเลือกใช้รูปภาพเริ่มต้นจาก Google
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar className="size-28 border-4 border-[var(--accent)] shadow-xl mb-3">
                <AvatarImage src={avatarPreview || currentAvatarSrc} alt={profile.name} />
                <AvatarFallback className="text-2xl font-bold bg-[var(--surface-2)] text-[var(--accent)] font-mono">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-mono text-[var(--ink-3)]">
                {avatarPreview ? "ตัวอย่างรูปภาพที่เลือกใหม่" : "รูปภาพโปรไฟล์ปัจจุบัน"}
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Option 1: Choose File from Device */}
              <Button
                type="button"
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 font-bold text-xs shadow cursor-pointer h-11"
              >
                <Upload className="size-4 mr-2" />
                <span>เลือกรูปภาพจากอุปกรณ์ (JPG, PNG, WebP)</span>
              </Button>

              {/* If preview is selected, show confirm button */}
              {avatarPreview && (
                <Button
                  type="button"
                  variant="default"
                  disabled={avatarUploading}
                  onClick={() => handleSaveAvatar()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer h-11"
                >
                  {avatarUploading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      <span>กำลังบันทึกรูปภาพ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 mr-2" />
                      <span>ยืนยันและบันทึกรูปภาพนี้</span>
                    </>
                  )}
                </Button>
              )}

              {/* Option 2: Reset to Google Default (Only shown if user signed up with Google) */}
              {profile.isGoogleUser && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={avatarUploading}
                  onClick={handleResetToGoogleAvatar}
                  className="w-full border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold cursor-pointer h-11 flex items-center justify-center gap-2"
                >
                  {/* Google G Logo SVG */}
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เลือกค่าเริ่มต้น Google (ใช้รูปจาก Google)</span>
                </Button>
              )}

              {/* Cancel Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAvatarModalOpen(false);
                  setAvatarPreview(null);
                }}
                className="w-full text-xs text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer h-9"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
