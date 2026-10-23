"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Footprints,
  RotateCcw,
  Check,
  X,
  QrCode,
  ExternalLink,
  Search,
  Filter,
  Users,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditFormData {
  id: string;
  title: string;
  location: string;
  date: string;
  distance: string;
  price: number;
  eventStatus: string;
  approvalStatus: string;
  image: string;
  organizerName: string;
  organizerContact: string;
}

export default function AdminEventsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "pending";

  const [activeFilter, setActiveFilter] = React.useState<"pending" | "approved" | "rejected" | "all">(
    ["pending", "approved", "rejected", "all"].includes(initialTab) ? initialTab : "pending"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [eventsList, setEventsList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EditFormData | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);

  // Delete Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingEvent, setDeletingEvent] = React.useState<any | null>(null);
  const [deleteSaving, setDeleteSaving] = React.useState(false);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (data.requests) {
        setEventsList(data.requests);
      }
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Quick Approve / Reject
  const handleAction = async (eventId: string, action: "approve" | "reject", reason?: string) => {
    setActionLoading(eventId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "ดำเนินการไม่สำเร็จ");
      }
      setActionMessage(data.data?.message || data.message || "บันทึกการดำเนินการเรียบร้อยแล้ว");
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Dialog
  const openEditModal = (event: any) => {
    const rawDate = event.date ? new Date(event.date) : new Date();
    const formattedDate = rawDate.toISOString().slice(0, 10);

    setEditingEvent({
      id: event.id,
      title: event.title || "",
      location: event.location || "",
      date: formattedDate,
      distance: event.distance || "5 / 10 / 21 KM",
      price: event.price || 650,
      eventStatus: event.eventStatus || "REGISTRATION_OPEN",
      approvalStatus: event.approvalStatus || "APPROVED",
      image: event.image || "",
      organizerName: event.organizerName || event.organizer?.name || "",
      organizerContact: event.organizerContact || event.organizer?.email || "",
    });
    setEditDialogOpen(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "ไม่สามารถบันทึกการแก้ไขได้");
      }
      setActionMessage(data.data?.message || data.message || "แก้ไขข้อมูลงานวิ่งเรียบร้อยแล้ว");
      setEditDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setEditSaving(false);
    }
  };

  // Open Delete Confirmation Dialog
  const openDeleteModal = (event: any) => {
    setDeletingEvent(event);
    setDeleteDialogOpen(true);
  };

  // Submit Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;

    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${deletingEvent.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "ไม่สามารถลบงานวิ่งได้");
      }
      setActionMessage(data.data?.message || data.message || "ลบงานวิ่งออกจากระบบสำเร็จแล้ว");
      setDeleteDialogOpen(false);
      setDeletingEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบงานวิ่ง");
    } finally {
      setDeleteSaving(false);
    }
  };

  const pendingCount = eventsList.filter(
    (e) => e.approvalStatus === "pending" || e.approvalStatus === "PENDING"
  ).length;
  const approvedCount = eventsList.filter(
    (e) => e.approvalStatus === "approved" || e.approvalStatus === "APPROVED"
  ).length;
  const rejectedCount = eventsList.filter(
    (e) => e.approvalStatus === "rejected" || e.approvalStatus === "REJECTED"
  ).length;

  const filteredEvents = eventsList.filter((e) => {
    const status = (e.approvalStatus || "").toLowerCase();
    if (activeFilter === "pending" && status !== "pending") return false;
    if (activeFilter === "approved" && status !== "approved") return false;
    if (activeFilter === "rejected" && status !== "rejected") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = e.title?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      const matchOrg = (e.organizerName || e.organizer?.name)?.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchOrg) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="size-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] text-[var(--ink)]">
              จัดการงานวิ่งทั้งหมด (Event Management Portal)
            </h1>
          </div>
          <p className="text-xs text-[var(--ink-2)] mt-1">
            พิจารณาอนุมัติคำขอ แก้ไขรายละเอียด วันที่จัดงาน ราคา และลบงานวิ่งออกจากระบบ
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchEvents}
          className="h-9 text-xs font-mono self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="size-3.5 mr-1.5 text-amber-400" />
          <span>รีเฟรชรายการ</span>
        </Button>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-mono cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeFilter === "pending"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <Clock className="size-3.5" />
            <span>รออนุมัติ</span>
            <span
              className={cn(
                "px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold",
                activeFilter === "pending"
                  ? "bg-slate-950 text-amber-300"
                  : "bg-amber-500/20 text-amber-400"
              )}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("approved")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeFilter === "approved"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <CheckCircle2 className="size-3.5" />
            <span>อนุมัติแล้ว</span>
            <span
              className={cn(
                "px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold",
                activeFilter === "approved"
                  ? "bg-black/30 text-white"
                  : "bg-emerald-500/20 text-emerald-400"
              )}
            >
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("rejected")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeFilter === "rejected"
                ? "bg-red-600 text-white font-bold shadow-sm"
                : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            <AlertCircle className="size-3.5" />
            <span>ปฏิเสธ</span>
            <span
              className={cn(
                "px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold",
                activeFilter === "rejected"
                  ? "bg-black/30 text-white"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {rejectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeFilter === "all"
                ? "bg-[var(--surface-2)] text-[var(--ink)] font-bold"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            <span>ทั้งหมด ({eventsList.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-3)]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่องาน, สถานที่, ผู้จัด..."
            className="pl-9 h-9 text-xs bg-[var(--surface-2)] font-mono"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <Card className="p-16 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-3">
          <Footprints className="size-10 animate-pulse text-amber-500" />
          <span>กำลังโหลดข้อมูลงานวิ่งจากฐานข้อมูล...</span>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center text-xs font-mono text-[var(--ink-3)] flex flex-col items-center gap-2">
          <Calendar className="size-10 text-[var(--ink-3)]/40 mb-1" />
          <p className="text-sm font-bold text-[var(--ink)] font-[var(--font-display)]">
            ไม่พบรายการงานวิ่งตามเงื่อนไข
          </p>
          <p className="text-[11px] text-[var(--ink-2)]">
            ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => {
            const isPending = (event.approvalStatus || "").toLowerCase() === "pending";
            const isApproved = (event.approvalStatus || "").toLowerCase() === "approved";
            const isRejected = (event.approvalStatus || "").toLowerCase() === "rejected";

            return (
              <Card
                key={event.id}
                className={cn(
                  "border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col gap-4 shadow-sm transition-all relative overflow-hidden",
                  isPending && "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-[var(--surface)]"
                )}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--ink)] leading-snug line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs font-mono text-[var(--ink-3)] flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPending && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-[10px]"
                      >
                        <Clock className="size-3 mr-1" />
                        รออนุมัติ
                      </Badge>
                    )}
                    {isApproved && (
                      <Badge
                        variant="default"
                        size="sm"
                        className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono text-[10px]"
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        อนุมัติแล้ว
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge
                        variant="destructive"
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        <AlertCircle className="size-3 mr-1" />
                        ปฏิเสธ
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Event Meta Specifications */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[var(--ink-3)] block">วันแข่งขัน</span>
                    <span className="font-bold text-[var(--ink)]">
                      {new Date(event.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--ink-3)] block">ระยะทาง</span>
                    <span className="font-bold text-[var(--ink)]">{event.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--ink-3)] block">ค่าสมัคร</span>
                    <span className="font-bold text-amber-400">
                      ฿{event.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Organizer Contact Card */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 border border-[var(--line)]">
                      <AvatarImage src={event.organizer?.image || undefined} />
                      <AvatarFallback className="font-mono text-xs">
                        {event.organizerName?.slice(0, 2) || "RN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[var(--ink)] truncate">
                          {event.organizerName || event.organizer?.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400">ผู้ขอจัด</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--ink-3)] truncate">
                        {event.organizerContact || event.organizer?.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--ink-3)] hidden sm:inline">
                    {new Date(event.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>

                {/* Primary Action Footer */}
                <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-2">
                  {/* Approve/Reject Bar for Pending */}
                  {isPending && (
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        size="sm"
                        disabled={actionLoading === event.id}
                        onClick={() => handleAction(event.id, "approve")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 cursor-pointer shadow-xs"
                      >
                        <Check className="size-4 mr-1 stroke-[3]" />
                        <span>อนุมัติคำขอจัดงาน</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === event.id}
                        onClick={() => handleAction(event.id, "reject")}
                        className="h-9 text-xs cursor-pointer"
                      >
                        <X className="size-4 mr-1" />
                        <span>ปฏิเสธ</span>
                      </Button>
                    </div>
                  )}

                  {/* Admin Tools: Edit, Delete, Checkin, View */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(event)}
                        className="h-8 text-xs font-semibold border-[var(--line)] hover:border-amber-500/50 hover:text-amber-300 cursor-pointer"
                      >
                        <Pencil className="size-3.5 mr-1 text-amber-400" />
                        <span>แก้ไขงานวิ่ง</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(event)}
                        className="h-8 text-xs font-semibold border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        <span>ลบ</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isApproved && (
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          <Link href={`/organizer/checkin?eventId=${event.id}`}>
                            <QrCode className="size-3.5 mr-1" />
                            <span>ตรวจ BIB</span>
                          </Link>
                        </Button>
                      )}

                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-mono text-[var(--ink-2)] hover:text-[var(--ink)]"
                      >
                        <Link href={`/events/${event.id}`} target="_blank">
                          <Eye className="size-3.5 mr-1" />
                          <span>ดูหน้าเว็บ</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EDIT EVENT DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-400">
              <Pencil className="size-5" />
              <DialogTitle>แก้ไขข้อมูลงานวิ่ง (Admin Edit Event)</DialogTitle>
            </div>
            <DialogDescription>
              ปรับปรุงรายละเอียดงานวิ่ง วันที่ ค่าสมัคร หรือสถานะการเปิดรับสมัคร
            </DialogDescription>
          </DialogHeader>

          {editingEvent && (
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">ชื่องานวิ่ง *</label>
                <Input
                  required
                  value={editingEvent.title}
                  onChange={(e) =>
                    setEditingEvent((prev) => prev ? { ...prev, title: e.target.value } : null)
                  }
                  className="h-9 text-xs bg-[var(--surface-2)]"
                  placeholder="เช่น นครปฐม มินิมาราธอน 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">สถานที่จัดงาน *</label>
                  <Input
                    required
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, location: e.target.value } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)]"
                    placeholder="เช่น พระปฐมเจดีย์"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">วันที่จัดงาน (YYYY-MM-DD) *</label>
                  <Input
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, date: e.target.value } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">ระยะทางแข่งขัน *</label>
                  <Input
                    required
                    value={editingEvent.distance}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, distance: e.target.value } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)] font-mono"
                    placeholder="5 / 10 / 21 KM"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">ค่าสมัครเริ่มต้น (บาท) *</label>
                  <Input
                    type="number"
                    required
                    value={editingEvent.price}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, price: Number(e.target.value) } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)] font-mono"
                    placeholder="650"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">สถานะการรับสมัคร</label>
                  <select
                    value={editingEvent.eventStatus}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, eventStatus: e.target.value } : null)
                    }
                    className="w-full h-9 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-mono text-[var(--ink)] cursor-pointer"
                  >
                    <option value="REGISTRATION_OPEN">REGISTRATION_OPEN (เปิดรับสมัคร)</option>
                    <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED (ปิดรับสมัคร)</option>
                    <option value="RACE_DAY">RACE_DAY (วันแข่งขัน)</option>
                    <option value="COMPLETED">COMPLETED (จบการแข่งขัน)</option>
                    <option value="DRAFT">DRAFT (ฉบับร่าง)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">สถานะการอนุมัติ (Approval)</label>
                  <select
                    value={editingEvent.approvalStatus}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, approvalStatus: e.target.value } : null)
                    }
                    className="w-full h-9 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-mono text-[var(--ink)] cursor-pointer"
                  >
                    <option value="APPROVED">APPROVED (อนุมัติ)</option>
                    <option value="PENDING">PENDING (รออนุมัติ)</option>
                    <option value="REJECTED">REJECTED (ปฏิเสธ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">ชื่อผู้จัดงาน</label>
                  <Input
                    value={editingEvent.organizerName}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, organizerName: e.target.value } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">ช่องทางติดต่อผู้จัด (อีเมล/เบอร์)</label>
                  <Input
                    value={editingEvent.organizerContact}
                    onChange={(e) =>
                      setEditingEvent((prev) => prev ? { ...prev, organizerContact: e.target.value } : null)
                    }
                    className="h-9 text-xs bg-[var(--surface-2)] font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">URL รูปภาพหน้าปกงานวิ่ง</label>
                <Input
                  value={editingEvent.image}
                  onChange={(e) =>
                    setEditingEvent((prev) => prev ? { ...prev, image: e.target.value } : null)
                  }
                  className="h-9 text-xs bg-[var(--surface-2)] font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <DialogFooter className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(false)}
                  className="h-9 text-xs cursor-pointer"
                >
                  ยกเลิก
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={editSaving}
                  className="h-9 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-sm"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกการแก้ไข</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. DELETE EVENT CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="size-5" />
              <DialogTitle>ยืนยันการลบงานวิ่ง (Delete Event)</DialogTitle>
            </div>
            <DialogDescription>
              การลบงานวิ่งจะเป็นการลบข้อมูลออกจากระบบฐานข้อมูลอย่างถาวร
            </DialogDescription>
          </DialogHeader>

          {deletingEvent && (
            <div className="flex flex-col gap-3 py-2">
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col gap-1.5 text-xs">
                <div className="font-bold text-[var(--ink)] text-sm">{deletingEvent.title}</div>
                <div className="text-[var(--ink-2)] font-mono flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-rose-400" />
                  <span>{deletingEvent.location}</span>
                  <span>•</span>
                  <span>
                    {new Date(deletingEvent.date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-[11px] text-rose-400 mt-1">
                  ⚠️ หากมีนักวิ่งลงทะเบียน ข้อมูลบัตร BIB และการสมัครทั้งหมดของงานนี้จะถูกลบไปด้วย
                </div>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="h-9 text-xs cursor-pointer"
                >
                  ยกเลิก
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteSaving}
                  onClick={handleConfirmDelete}
                  className="h-9 text-xs font-bold cursor-pointer"
                >
                  {deleteSaving ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      <span>กำลังลบ...</span>
                    </>
                  ) : (
                    <span>ยืนยันลบงานวิ่ง</span>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
