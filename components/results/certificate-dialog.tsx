"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Trophy,
  Sparkles,
  Timer,
  Footprints,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  CertificateData,
  downloadCertificateImage,
  printCertificate,
} from "@/lib/certificate-canvas";

interface CertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateData | null;
}

export function CertificateDialog({
  open,
  onOpenChange,
  certificate,
}: CertificateDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!certificate) return null;

  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadCertificateImage(certificate);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      console.error("Certificate download error:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    printCertificate(certificate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-[var(--surface)] border-[var(--line)] p-6 text-[var(--ink)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Award className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-[var(--font-display)]">
                  e-Certificate เกียรติบัตรรับรองผลการแข่งขัน
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)]">
                  รับรองสถิติเวลาและอันดับอย่างเป็นทางการโดยระบบจับเวลา IT Runway
                </DialogDescription>
              </div>
            </div>
            <Badge variant="accent" className="font-mono text-xs font-bold">
              BIB {certificate.bib}
            </Badge>
          </div>
        </DialogHeader>

        {/* Certificate Visual Preview Container */}
        <div className="my-2 p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/10 border-2 border-amber-500/30 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Ornate Gold Border inner */}
          <div className="border border-amber-500/40 rounded-xl p-6 sm:p-8 bg-[var(--surface-2)]/80 backdrop-blur flex flex-col items-center text-center gap-4 relative">
            {/* Header Badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold">
                IT RUNWAY TIMING SYSTEM • OFFICIAL TIMING PARTNER
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-[var(--font-display)] tracking-wider text-amber-200">
                FINISHER CERTIFICATE
              </h2>
              <span className="text-xs text-[var(--ink-2)]">
                เกียรติบัตรนี้มอบให้เพื่อแสดงว่า
              </span>
            </div>

            {/* Runner Name */}
            <div className="py-2 border-b-2 border-amber-500/40 px-8 w-full max-w-md">
              <h3 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
                {certificate.name}
              </h3>
              <span className="text-xs font-mono text-[var(--ink-3)]">
                {certificate.club || "นักวิ่งอิสระ (Independent Runner)"}
              </span>
            </div>

            {/* Event Info */}
            <p className="text-xs text-[var(--ink-2)] max-w-md">
              ได้เข้าร่วมและพิชิตการแข่งขัน{" "}
              <strong className="text-[var(--ink)]">{certificate.eventTitle}</strong>
              <br />
              ณ {certificate.location || "จังหวัดนครปฐม"} เมื่อวันที่ {certificate.eventDate}
            </p>

            {/* Key Metrics Stats Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-[var(--ink-3)]">ระยะทาง</span>
                <span className="font-bold text-sm font-mono text-[var(--accent)]">{certificate.distance}</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-[var(--ink-3)]">เวลา CHIP TIME</span>
                <span className="font-bold text-sm font-mono text-[var(--ink)]">{certificate.chipTime}</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-[var(--ink-3)]">ความเร็วเฉลี่ย (PACE)</span>
                <span className="font-bold text-sm font-mono text-[var(--ink)]">{certificate.pace} /km</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-[var(--ink-3)]">อันดับรวม (OVERALL)</span>
                <span className="font-bold text-sm font-mono text-amber-400">#{certificate.rank}</span>
              </div>
            </div>

            {/* Verification Watermark */}
            <div className="flex items-center justify-between w-full pt-4 border-t border-[var(--line)] text-[10px] font-mono text-[var(--ink-3)]">
              <span>BIB: {certificate.bib}</span>
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <Sparkles className="size-3" />
                VERIFIED BY IT RUNWAY
              </span>
              <span>GUN TIME: {certificate.gunTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[var(--ink-3)] font-mono">
            {downloaded ? "✓ ดาวน์โหลดไฟล์สำเร็จแล้ว" : "รองรับไฟล์ภาพความละเอียดสูง (1600x1130 px)"}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5 flex-1 sm:flex-none cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>พิมพ์เกียรติบัตร (Print)</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-black flex-1 sm:flex-none cursor-pointer"
            >
              {downloading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span>ดาวน์โหลด e-Certificate (PNG)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
