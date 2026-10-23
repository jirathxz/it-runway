"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Timer,
  Share2,
  Bookmark,
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  location: string;
  date: string;
  time?: string;
  distance: string;
  price: number;
  slots?: string | number;
  remainingSlots?: number;
  isSoldOut?: boolean;
  status: string; // "open" | "near_full" | "closed" | "เปิดรับสมัคร" | "ใกล้เต็ม"
  category?: string; // "road" | "trail" | "cycling" | "triathlon"
  image?: string;
  organizer?: string;
  highlights?: string[];
}

interface EventCardProps {
  event: EventItem;
  viewMode?: "grid" | "list";
  onSelect?: (event: EventItem) => void;
}

export function EventCard({
  event,
  viewMode = "grid",
  onSelect,
}: EventCardProps) {
  const isOpen =
    event.status === "open" ||
    event.status === "เปิดรับสมัคร" ||
    event.status === "OPEN";
  const isNearFull =
    event.status === "near_full" ||
    event.status === "ใกล้เต็ม" ||
    event.status === "FILLING_FAST";

  const statusLabel = isOpen
    ? "เปิดรับสมัคร"
    : isNearFull
    ? "ใกล้เต็ม"
    : "ปิดรับสมัคร";

  const defaultImage =
    event.image ||
    "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=600";

  if (viewMode === "list") {
    return (
      <Card className="group relative flex flex-col md:flex-row overflow-hidden border-[var(--line)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--ink-3)] hover:shadow-[var(--shadow-far)] hover:-translate-y-0.5">
        {/* List Image */}
        <div className="relative h-48 md:h-auto md:w-64 md:min-w-[256px] shrink-0 overflow-hidden bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={defaultImage}
            alt={event.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-black/30 bg-black/60 px-2.5 py-1 backdrop-blur-md">
            <span
              className={cn(
                "size-2 rounded-full animate-pulse",
                isOpen
                  ? "bg-[var(--positive)]"
                  : isNearFull
                  ? "bg-[var(--accent)]"
                  : "bg-zinc-500"
              )}
            />
            <span className="font-[var(--font-mono)] text-[10px] font-bold text-white">
              {statusLabel}
            </span>
          </div>

          {/* Distance overlay */}
          <div className="absolute bottom-3 left-3 font-[var(--font-mono)] text-xs font-bold text-[var(--accent)] bg-[var(--base)]/80 px-2.5 py-1 rounded-[var(--radius)] border border-[var(--line)] backdrop-blur-sm">
            {event.distance}
          </div>
        </div>

        {/* List Content */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-4">
          <div className="flex flex-col gap-2">
            {/* Top metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-[var(--font-mono)] text-[var(--ink-3)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[var(--ink-2)] font-semibold">
                  <Calendar className="size-3.5 text-[var(--accent)]" />
                  {event.date} {event.time ? `• ${event.time}` : ""}
                </span>
                <span className="hidden sm:flex items-center gap-1 text-[var(--positive)] font-bold">
                  <Timer className="size-3.5" />
                  RFID CHIP
                </span>
              </div>
              {event.isSoldOut || event.remainingSlots === 0 ? (
                <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded text-xs">
                  เต็มแล้ว (Sold Out)
                </span>
              ) : event.remainingSlots !== undefined ? (
                <span className="text-[var(--accent)] font-bold">
                  เหลือ {event.remainingSlots} ที่
                </span>
              ) : event.slots ? (
                <span className="text-[var(--accent)] font-bold">
                  เหลือ {event.slots} ที่
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h3
              onClick={() => onSelect?.(event)}
              className="font-[var(--font-display)] text-lg sm:text-xl font-bold tracking-tight text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              {event.title}
            </h3>

            {/* Location */}
            <p className="flex items-center gap-1.5 text-xs text-[var(--ink-2)] line-clamp-1">
              <MapPin className="size-3.5 shrink-0 text-[var(--ink-3)]" />
              <span>{event.location}</span>
            </p>
          </div>

          {/* Bottom actions & Price */}
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-auto">
            <div>
              <span className="font-[var(--font-mono)] text-[10px] uppercase text-[var(--ink-3)] block leading-none mb-1">
                ค่าสมัครเริ่มต้น
              </span>
              <span className="font-[var(--font-bib)] text-2xl font-black text-[var(--ink)] tabular-nums leading-none">
                {event.price}
                <span className="text-xs font-normal text-[var(--ink-3)] ml-0.5">
                  บาท
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/events/${event.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                >
                  ดูรายละเอียด
                </Button>
              </Link>
              <Link href={`/events/${event.id}`}>
                <Button
                  size="sm"
                  className={cn(
                    "h-9 font-bold text-xs",
                    (event.isSoldOut || event.remainingSlots === 0) &&
                      "bg-zinc-700/80 text-zinc-300 hover:bg-zinc-750 border border-zinc-600/50"
                  )}
                >
                  <span>{event.isSoldOut || event.remainingSlots === 0 ? "เต็มแล้ว" : "สมัครเลย"}</span>
                  <ChevronRight className="size-3.5 stroke-[2.5]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid Mode Card
  return (
    <Card className="group relative flex flex-col overflow-hidden border-[var(--line)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--ink-3)] hover:shadow-[var(--shadow-far)] hover:-translate-y-1">
      {/* Banner / Poster Image */}
      <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden bg-[var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={defaultImage}
          alt={event.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-black/30" />

        {/* Status Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-black/30 bg-black/70 px-2.5 py-1 backdrop-blur-md">
          <span
            className={cn(
              "size-2 rounded-full animate-pulse",
              isOpen
                ? "bg-[var(--positive)]"
                : isNearFull
                ? "bg-[var(--accent)]"
                : "bg-zinc-500"
            )}
          />
          <span className="font-[var(--font-mono)] text-[10px] font-bold text-white">
            {statusLabel}
          </span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="surface"
            size="sm"
            className="border-[var(--line)] bg-[var(--base)]/90 backdrop-blur-md text-[var(--accent)] font-bold text-[10px]"
          >
            {event.distance}
          </Badge>
        </div>

        {/* Chip Timing tag */}
        <div className="absolute bottom-3 right-3">
          <span className="font-[var(--font-mono)] text-[9px] font-bold tracking-wider uppercase text-[var(--positive)] bg-black/60 px-2 py-0.5 rounded border border-[var(--positive)]/30 backdrop-blur-sm">
            RFID CHIP
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Date & slots */}
        <div className="flex items-center justify-between text-xs font-[var(--font-mono)] text-[var(--ink-3)]">
          <span className="flex items-center gap-1 text-[var(--ink-2)] font-semibold">
            <Calendar className="size-3.5 text-[var(--accent)]" />
            {event.date}
          </span>
          {event.isSoldOut || event.remainingSlots === 0 ? (
            <span className="text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]">
              เต็มแล้ว
            </span>
          ) : event.remainingSlots !== undefined ? (
            <span className="text-[var(--accent)] font-bold text-[11px]">
              เหลือ {event.remainingSlots} ที่
            </span>
          ) : event.slots ? (
            <span className="text-[var(--accent)] font-bold text-[11px]">
              เหลือ {event.slots} ที่
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect?.(event)}
          className="font-[var(--font-display)] text-base sm:text-lg font-bold tracking-tight text-[var(--ink)] line-clamp-2 hover:text-[var(--accent)] transition-colors cursor-pointer"
          title={event.title}
        >
          {event.title}
        </h3>

        {/* Location */}
        <p
          className="flex items-center gap-1.5 text-xs text-[var(--ink-2)] line-clamp-1"
          title={event.location}
        >
          <MapPin className="size-3.5 shrink-0 text-[var(--ink-3)]" />
          <span>{event.location}</span>
        </p>

        {/* Footer info: Price & CTA */}
        <div className="flex items-center justify-between border-t border-[var(--line)] pt-3.5 mt-auto">
          <div>
            <span className="font-[var(--font-mono)] text-[10px] uppercase text-[var(--ink-3)] block leading-none mb-0.5">
              ราคาเริ่มต้น
            </span>
            <span className="font-[var(--font-bib)] text-2xl font-black text-[var(--ink)] tabular-nums leading-none">
              {event.price}
              <span className="text-xs font-normal text-[var(--ink-3)] ml-0.5">
                .-
              </span>
            </span>
          </div>

          <Link href={`/events/${event.id}`}>
            <Button
              size="sm"
              className={cn(
                "h-9 px-3.5 font-bold text-xs",
                (event.isSoldOut || event.remainingSlots === 0) &&
                  "bg-zinc-700/80 text-zinc-300 hover:bg-zinc-750 border border-zinc-600/50"
              )}
            >
              <span>{event.isSoldOut || event.remainingSlots === 0 ? "เต็มแล้ว" : "สมัคร"}</span>
              <ChevronRight className="size-3.5 stroke-[2.5]" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
