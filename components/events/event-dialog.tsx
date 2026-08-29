"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EventItem } from "@/components/events/event-card";
import {
  Calendar,
  MapPin,
  Clock,
  Shirt,
  Award,
  Timer,
  ShieldCheck,
  ChevronRight,
  Share2,
  ExternalLink,
} from "lucide-react";

interface EventDialogProps {
  event: EventItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDialog({ event, open, onOpenChange }: EventDialogProps) {
  if (!event) return null;

  const defaultImage =
    event.image ||
    "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto p-0 border-[var(--line)] bg-[var(--surface)]">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={defaultImage}
            alt={event.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-black/40" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge
              variant="default"
              size="sm"
              className="bg-black/70 border border-[var(--line)] text-white backdrop-blur-md"
            >
              {event.status === "open" ? "เปิดรับสมัคร" : "ใกล้เต็ม"}
            </Badge>
            <Badge
              variant="surface"
              size="sm"
              className="bg-[var(--base)]/90 text-[var(--accent)] font-bold border-[var(--line)]"
            >
              {event.distance}
            </Badge>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2 flex flex-col gap-5">
          <DialogHeader className="text-left gap-1">
            <div className="flex items-center gap-2 text-xs font-[var(--font-mono)] text-[var(--accent)] font-bold">
              <Calendar className="size-3.5" />
              <span>{event.date} {event.time ? `• ปล่อยตัว ${event.time}` : ""}</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              {event.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5 text-xs text-[var(--ink-2)] mt-0.5">
              <MapPin className="size-3.5 shrink-0 text-[var(--ink-3)]" />
              <span>{event.location}</span>
            </DialogDescription>
          </DialogHeader>

          <Separator />

          {/* Race Entitlements */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold font-[var(--font-mono)] text-[var(--ink-3)] uppercase tracking-wider">
              สิ่งที่นักวิ่งจะได้รับ (Race Entitlements)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs">
                <Shirt className="size-4 text-[var(--accent)] shrink-0" />
                <span className="text-[var(--ink-2)] font-medium">เสื้อวิ่งที่ระลึก</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs">
                <Award className="size-4 text-[var(--accent)] shrink-0" />
                <span className="text-[var(--ink-2)] font-medium">เหรียญรางวัล</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs">
                <Timer className="size-4 text-[var(--positive)] shrink-0" />
                <span className="text-[var(--ink-2)] font-medium">ชิป RFID จับเวลา</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-2.5 text-xs">
                <ShieldCheck className="size-4 text-[var(--accent)] shrink-0" />
                <span className="text-[var(--ink-2)] font-medium">ประกันอุบัติเหตุ</span>
              </div>
            </div>
          </div>

          {/* Distances & Prices breakdown */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold font-[var(--font-mono)] text-[var(--ink-3)] uppercase tracking-wider">
              ระยะทางและค่าสมัคร
            </h4>
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)]/60 overflow-hidden divide-y divide-[var(--line)]">
              <div className="flex items-center justify-between p-3 text-xs font-[var(--font-mono)]">
                <div>
                  <span className="font-bold text-[var(--ink)] block">ระยะทางการแข่งขัน</span>
                  <span className="text-[11px] text-[var(--ink-3)]">{event.distance}</span>
                </div>
                <div className="text-right">
                  <span className="font-[var(--font-bib)] text-lg font-black text-[var(--ink)] block">
                    {event.price}.-
                  </span>
                  <span className="text-[10px] text-[var(--positive)] font-bold">เปิดรับสมัคร</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 mt-2">
            <div>
              <span className="font-[var(--font-mono)] text-[10px] text-[var(--ink-3)] block uppercase">
                ราคาเริ่มต้น
              </span>
              <span className="font-[var(--font-bib)] text-2xl font-black text-[var(--ink)]">
                {event.price}{" "}
                <span className="text-xs font-normal text-[var(--ink-3)]">บาท</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                ปิด
              </Button>
              <Link href={`/events/${event.id}`}>
                <Button
                  size="default"
                  className="font-bold text-xs"
                >
                  <span>ดูรายละเอียด & สมัคร</span>
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
