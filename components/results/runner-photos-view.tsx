"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Camera,
  Search,
  Download,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  User,
  Zap,
  Maximize2,
  X,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface RunnerPhoto {
  id: string;
  bib: string;
  runnerName: string;
  eventTitle: string;
  checkpoint: "start" | "km5" | "km15" | "finish" | "medal";
  checkpointLabel: string;
  timestamp: string;
  imageUrl: string;
  photographer: string;
}

const SAMPLE_PHOTOS: RunnerPhoto[] = [
  {
    id: "p-1",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "06:45:12 น.",
    imageUrl: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
  },
  {
    id: "p-2",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "km5",
    checkpointLabel: "กม. 5 ถนนราชดำเนิน (ต้นสน)",
    timestamp: "06:18:40 น.",
    imageUrl: "https://images.pexels.com/photos/20487480/pexels-photo-20487480.png?auto=compress&cs=tinysrgb&w=800",
    photographer: "Nakhon Pathom Action Cam",
  },
  {
    id: "p-3",
    bib: "2101",
    runnerName: "กานดา สุวรรณภูมิ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "07:12:05 น.",
    imageUrl: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
  },
  {
    id: "p-4",
    bib: "2101",
    runnerName: "กานดา สุวรรณภูมิ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "start",
    checkpointLabel: "จุดปล่อยตัว ซุ้มประตูชัย",
    timestamp: "05:45:00 น.",
    imageUrl: "https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Runway Pro Studio",
  },
  {
    id: "p-5",
    bib: "0512",
    runnerName: "สมชาย รักสงบ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "km15",
    checkpointLabel: "กม. 15 สวนสัตว์และพระราชวังสนามจันทร์",
    timestamp: "06:55:30 น.",
    imageUrl: "https://images.pexels.com/photos/618612/pexels-photo-618612.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Sanam Chan Lens",
  },
  {
    id: "p-6",
    bib: "0512",
    runnerName: "สมชาย รักสงบ",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "medal",
    checkpointLabel: "ซุ้มรับเหรียญ Finisher พระปฐมเจดีย์",
    timestamp: "07:35:10 น.",
    imageUrl: "https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
  },
  {
    id: "p-7",
    bib: "1088",
    runnerName: "ธนภัทร รุ่งเรือง",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "medal",
    checkpointLabel: "ซุ้มรับเหรียญ Finisher พระปฐมเจดีย์",
    timestamp: "07:05:22 น.",
    imageUrl: "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "Nakhon Pathom Action Cam",
  },
  {
    id: "p-8",
    bib: "3320",
    runnerName: "วิชัย วิ่งไว",
    eventTitle: "Nakhon Pathom Mini Marathon 2026",
    checkpoint: "finish",
    checkpointLabel: "เส้นชัย หน้าองค์พระปฐมเจดีย์",
    timestamp: "06:50:11 น.",
    imageUrl: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800",
    photographer: "IT Runway Shutter Team",
  },
];

export function RunnerPhotosView() {
  const [searchBib, setSearchBib] = useState("");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<RunnerPhoto | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredPhotos = useMemo(() => {
    return SAMPLE_PHOTOS.filter((photo) => {
      const matchBib =
        !searchBib.trim() ||
        photo.bib.includes(searchBib.trim()) ||
        photo.runnerName.toLowerCase().includes(searchBib.trim().toLowerCase());

      const matchCheckpoint =
        selectedCheckpoint === "all" || photo.checkpoint === selectedCheckpoint;

      return matchBib && matchCheckpoint;
    });
  }, [searchBib, selectedCheckpoint]);

  const handleDownload = (photo: RunnerPhoto) => {
    // Open high-res image or download directly
    window.open(photo.imageUrl, "_blank");
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Card */}
      <Card className="border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Camera className="size-5 text-[var(--accent)]" />
              <h3 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--ink)]">
                ค้นหาภาพถ่ายนักวิ่ง (Runner Photo Search)
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-2)]">
              กรอกหมายเลข BIB หรือชื่อนักวิ่งเพื่อค้นหาภาพถ่ายความคมชัดสูงจากทีมช่างภาพในสนาม
            </p>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[var(--ink-3)]">ลองค้นหา:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchBib("1088")}
              className="h-7 text-xs font-mono gap-1 cursor-pointer bg-[var(--surface-2)]"
            >
              <Zap className="size-2.5 text-[var(--accent)]" />
              <span>BIB 1088</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchBib("2101")}
              className="h-7 text-xs font-mono gap-1 cursor-pointer bg-[var(--surface-2)]"
            >
              <Zap className="size-2.5 text-[var(--accent)]" />
              <span>BIB 2101</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchBib("0512")}
              className="h-7 text-xs font-mono gap-1 cursor-pointer bg-[var(--surface-2)]"
            >
              <Zap className="size-2.5 text-[var(--accent)]" />
              <span>BIB 0512</span>
            </Button>
            {searchBib && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchBib("")}
                className="h-7 text-xs text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
              >
                ล้างคำค้น
              </Button>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--line)]">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-3)]" />
            <Input
              value={searchBib}
              onChange={(e) => setSearchBib(e.target.value)}
              placeholder="พิมพ์เลข BIB เช่น 1088 หรือชื่อนักวิ่ง..."
              className="pl-10 h-11 text-xs font-mono bg-[var(--base)]/70"
            />
          </div>

          <div>
            <select
              value={selectedCheckpoint}
              onChange={(e) => setSelectedCheckpoint(e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--line)] bg-[var(--base)]/70 px-3 text-xs text-[var(--ink)] cursor-pointer"
            >
              <option value="all">ทุกจุดเช็คพอยต์ (All Locations)</option>
              <option value="start">จุดปล่อยตัว (Start Line)</option>
              <option value="km5">กม. 5 ถนนราชดำเนิน</option>
              <option value="km15">กม. 15 พระราชวังสนามจันทร์</option>
              <option value="finish">เส้นชัย พระปฐมเจดีย์ (Finish)</option>
              <option value="medal">ซุ้มรับเหรียญรางวัล (Medal Photo)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <Card
            key={photo.id}
            className="group overflow-hidden border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]/50 transition-all shadow-sm flex flex-col"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] w-full bg-[var(--surface-2)] overflow-hidden">
              <Image
                src={photo.imageUrl}
                alt={`Photo BIB ${photo.bib}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />

              {/* BIB Overlay Tag */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <Badge variant="accent" className="font-mono text-xs font-bold shadow-md">
                  BIB {photo.bib}
                </Badge>
              </div>

              {/* Quick Preview Icon Overlay */}
              <button
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm">
                  <Maximize2 className="size-5" />
                </div>
              </button>
            </div>

            {/* Info Box */}
            <CardContent className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                    {photo.runnerName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--ink-3)]">
                    {photo.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[var(--ink-2)]">
                  <MapPin className="size-3 text-[var(--accent)] shrink-0" />
                  <span className="line-clamp-1">{photo.checkpointLabel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--ink-3)] font-mono truncate max-w-[120px]">
                  📷 {photo.photographer}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(photo)}
                  className="h-7 text-[11px] gap-1 cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                >
                  <Download className="size-3" />
                  <span>ดาวน์โหลด</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <Card className="p-12 text-center border-[var(--line)] bg-[var(--surface)]">
          <Camera className="size-12 mx-auto text-[var(--ink-3)] mb-4" />
          <h4 className="font-bold text-base text-[var(--ink)] mb-1">
            ไม่พบภาพถ่ายที่ตรงกับคำค้นหา
          </h4>
          <p className="text-xs text-[var(--ink-2)] max-w-sm mx-auto mb-4">
            ลองค้นหาด้วยหมายเลข BIB อื่น เช่น 1088, 2101 หรือ 0512
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchBib("");
              setSelectedCheckpoint("all");
            }}
            className="text-xs cursor-pointer"
          >
            แสดงภาพถ่ายทั้งหมด
          </Button>
        </Card>
      )}

      {/* High-Res Photo Modal Lightbox */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl bg-[var(--surface)] border-[var(--line)] p-6 text-[var(--ink)]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" className="font-mono text-sm font-bold">
                    BIB {selectedPhoto.bib}
                  </Badge>
                  <DialogTitle className="text-base font-bold">
                    {selectedPhoto.runnerName} — {selectedPhoto.checkpointLabel}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="relative aspect-[16/10] w-full bg-black rounded-xl overflow-hidden my-2">
              <Image
                src={selectedPhoto.imageUrl}
                alt={`Photo BIB ${selectedPhoto.bib}`}
                fill
                className="object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>IT RUNWAY OFFICIAL TIMING PHOTO</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col text-xs text-[var(--ink-2)]">
                <span>เวลาบันทึก: {selectedPhoto.timestamp}</span>
                <span>ช่างภาพ: {selectedPhoto.photographer}</span>
              </div>
              <Button
                type="button"
                onClick={() => handleDownload(selectedPhoto)}
                className="text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Download className="size-4" />
                <span>ดาวน์โหลดภาพต้นฉบับความคมชัดสูง</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
