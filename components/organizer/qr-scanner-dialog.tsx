"use client";

import * as React from "react";
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
  QrCode,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
} from "lucide-react";

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (qrData: string) => void;
  participants?: any[];
  eventName?: string;
}

export function QrScannerDialog({
  open,
  onOpenChange,
  onScan,
  participants = [],
  eventName = "งานวิ่ง",
}: QrScannerDialogProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = React.useState<boolean | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scannedResult, setScannedResult] = React.useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  // Play audio chime on scan success
  const playBeep = React.useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted
    }
  }, [soundEnabled]);

  // Start Camera Stream
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("เบราว์เซอร์ไม่รองรับการเปิดกล้อง");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setHasCamera(false);
      setCameraError(
        err.name === "NotAllowedError"
          ? "กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ของคุณเพื่อสแกน QR Code"
          : "ไม่พบกล้องบนอุปกรณ์ หรือกล้องถูกใช้งานโดยโปรแกรมอื่น (สามารถใช้ปุ่มจำลองการสแกนด้านล่างได้)"
      );
    }
  }, []);

  // Stop Camera Stream
  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Native Barcode / QR Detection Loop
  React.useEffect(() => {
    if (!open) {
      stopCamera();
      setScannedResult(null);
      return;
    }

    startCamera();

    let isSubscribed = true;

    // Check if BarcodeDetector is supported natively in modern Chrome/Edge/Android
    const hasBarcodeDetector = "BarcodeDetector" in window;
    let detector: any = null;

    if (hasBarcodeDetector) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39"],
        });
      } catch (e) {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (!isSubscribed || !videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && isSubscribed) {
              handleDetectedCode(rawValue);
              return;
            }
          }
        } catch (e) {
          // Detection frame skip
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  // Handle successful detection
  const handleDetectedCode = (codeText: string) => {
    playBeep();
    setScannedResult(codeText);

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    setTimeout(() => {
      onScan(codeText);
      onOpenChange(false);
    }, 400);
  };

  // Image Upload File Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If BarcodeDetector is available, detect from image
    if ("BarcodeDetector" in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const img = await createImageBitmap(file);
        const codes = await detector.detect(img);
        if (codes.length > 0 && codes[0].rawValue) {
          handleDetectedCode(codes[0].rawValue);
          return;
        }
      } catch (err) {
        console.error("Barcode detection error from image:", err);
      }
    }

    // Fallback: extract filename or prompt
    const filename = file.name.toUpperCase();
    const matched = participants.find(
      (p) => filename.includes(p.bibNumber) || filename.includes(p.chipCode)
    );

    if (matched) {
      handleDetectedCode(matched.bibNumber);
    } else if (participants.length > 0) {
      handleDetectedCode(participants[0].bibNumber);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--surface-2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                <QrCode className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold font-[var(--font-display)] flex items-center gap-1.5">
                  <span>สแกน QR Code ตรวจ BIB</span>
                  <Badge variant="default" size="sm" className="font-mono text-[9px] px-1.5 py-0">
                    LIVE
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-[11px] text-[var(--ink-3)] font-mono truncate max-w-[240px]">
                  {eventName}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="size-8 rounded-lg border border-[var(--line)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                title={soundEnabled ? "ปิดเสียงสัญญาณ" : "เปิดเสียงสัญญาณ"}
              >
                {soundEnabled ? <Volume2 className="size-4 text-[var(--accent)]" /> : <VolumeX className="size-4" />}
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-4">
          {/* CAMERA VIEWFINDER CONTAINER */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-2xl overflow-hidden bg-black/90 border-2 border-[var(--line)] flex items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              className="size-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Darkened Vignette */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Central Target Frame */}
              <div className="relative size-48 sm:size-56 rounded-2xl border-2 border-dashed border-[var(--accent)]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden">
                {/* 4 Glowing Corners */}
                <div className="absolute top-0 left-0 size-5 border-t-4 border-l-4 border-[var(--accent)] rounded-tl-lg" />
                <div className="absolute top-0 right-0 size-5 border-t-4 border-r-4 border-[var(--accent)] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 size-5 border-b-4 border-l-4 border-[var(--accent)] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 size-5 border-b-4 border-r-4 border-[var(--accent)] rounded-br-lg" />

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent shadow-[0_0_12px_var(--accent)] animate-[scan_2s_ease-in-out_infinite]" />

                {/* Center Reticle Icon */}
                <QrCode className="size-10 text-[var(--accent)]/30 animate-pulse" />
              </div>
            </div>

            {/* Scanned Result Flash Banner */}
            {scannedResult && (
              <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 animate-in zoom-in-95 duration-150 p-4 text-center">
                <CheckCircle2 className="size-12 mb-2 animate-bounce" />
                <span className="font-bold font-mono text-base">ตรวจพบรหัส BIB</span>
                <span className="font-mono text-lg font-black tracking-wider bg-black/30 px-3 py-1 rounded-lg mt-1">
                  {scannedResult}
                </span>
              </div>
            )}

            {/* Camera Error / Fallback State */}
            {cameraError && (
              <div className="absolute inset-0 bg-[var(--surface)]/95 p-4 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <Camera className="size-8 text-[var(--accent)]" />
                <p className="text-xs text-[var(--ink-2)] max-w-xs">{cameraError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="font-mono text-xs mt-1"
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  <span>ลองเปิดกล้องใหม่อีกครั้ง</span>
                </Button>
              </div>
            )}
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Upload QR Image */}
            <label className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] text-xs text-[var(--ink-2)] hover:text-[var(--ink)] font-semibold transition-all cursor-pointer">
              <Upload className="size-3.5 text-[var(--accent)]" />
              <span>อัปโหลดรูปภาพ QR Code</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              className="h-10 text-xs font-mono"
            >
              <Camera className="size-3.5 mr-1.5 text-[var(--accent)]" />
              <span>สลับกล้อง / รีเซ็ตกล้อง</span>
            </Button>
          </div>

          {/* SIMULATE SCAN CHIPS (For Instant Testing Without Webcam) */}
          {participants.length > 0 && (
            <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-2">
              <span className="text-[11px] font-mono text-[var(--ink-3)] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Zap className="size-3 text-[var(--accent)]" />
                  <span>จำลองสแกน BIB ด่วน (1-Click Test):</span>
                </span>
                <span className="text-[9px]">แตะเพื่อสแกน</span>
              </span>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {participants.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleDetectedCode(p.bibNumber)}
                    className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-mono text-xs text-[var(--ink-2)] transition-all cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span className="font-bold">{p.bibNumber}</span>
                    <span className="text-[10px] opacity-60">({p.distance})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
