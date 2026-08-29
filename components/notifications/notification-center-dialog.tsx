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
  Bell,
  Mail,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Calendar,
  Truck,
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";

interface NotificationCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  REGISTRATION_CONFIRMED: {
    label: "ยืนยันการลงทะเบียน",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  PAYMENT_SUCCESSFUL: {
    label: "ชำระเงินสำเร็จ",
    icon: CreditCard,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  BIB_ISSUED: {
    label: "ออกหมายเลข BIB",
    icon: QrCode,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  RACE_REMINDER: {
    label: "เตือนวันแข่งขัน",
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  SHIPPING_UPDATED: {
    label: "อัปเดตเลขพัสดุ",
    icon: Truck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  EVENT_CANCELLED: {
    label: "ยกเลิก / คืนเงิน",
    icon: AlertCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
  },
  TRANSFER_COMPLETED: {
    label: "โอนสิทธิ์เสร็จสิ้น",
    icon: RotateCcw,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/30",
  },
  RESULTS_PUBLISHED: {
    label: "ประกาศผลสถิติ",
    icon: Trophy,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  CERTIFICATE_AVAILABLE: {
    label: "เกียรติบัตร e-Certificate",
    icon: Award,
    color: "text-amber-300",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
};

export function NotificationCenterDialog({
  open,
  onOpenChange,
  onUnreadCountChange,
}: NotificationCenterDialogProps) {
  const [notificationsList, setNotificationsList] = React.useState<any[]>([]);
  const [counts, setCounts] = React.useState({
    total: 0,
    unread: 0,
    email: 0,
    sms: 0,
    push: 0,
    inApp: 0,
  });
  const [activeTab, setActiveTab] = React.useState<"all" | "in_app" | "email" | "sms" | "push">("all");
  const [loading, setLoading] = React.useState(false);
  const [selectedTestEvent, setSelectedTestEvent] = React.useState<string>("REGISTRATION_CONFIRMED");
  const [triggering, setTriggering] = React.useState(false);
  const [triggerSuccess, setTriggerSuccess] = React.useState<string | null>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      const payload = json.data || json;

      if (res.ok) {
        setNotificationsList(payload.notifications || []);
        if (payload.counts) {
          setCounts(payload.counts);
          if (onUnreadCountChange) {
            onUnreadCountChange(payload.counts.unread);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  React.useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerTest = async () => {
    try {
      setTriggering(true);
      setTriggerSuccess(null);
      const res = await fetch("/api/notifications/test-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: selectedTestEvent,
          eventTitle: "Nakhon Pathom Half Marathon 2026",
        }),
      });

      const json = await res.json();
      const payload = json.data || json;

      if (res.ok) {
        setTriggerSuccess(`ส่งการแจ้งเตือน "${EVENT_TYPE_CONFIG[selectedTestEvent]?.label || selectedTestEvent}" สำเร็จ (4 ช่องทาง)`);
        await fetchNotifications();
      }
    } catch (err: any) {
      alert("Error triggering notification: " + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const filteredNotifs = notificationsList.filter((n) => {
    if (activeTab === "all") return true;
    return n.channel === activeTab;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[var(--surface)] border-[var(--line)]">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-[var(--line)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold font-[var(--font-display)] flex items-center gap-2">
                  <span>ศูนย์แจ้งเตือนมัลติแชนแนล (Notification Center)</span>
                  {counts.unread > 0 && (
                    <Badge variant="destructive" size="sm" className="font-mono text-[10px]">
                      {counts.unread} ใหม่
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--ink-2)]">
                  รองรับ Email, SMS, Web Push และ In-App ผ่าน 9 Event หลักของระบบ
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={loading}
                className="h-8 text-xs font-mono cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
              {counts.unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-8 text-xs text-[var(--accent)] font-semibold cursor-pointer"
                >
                  <Check className="size-3.5 mr-1" />
                  อ่านทั้งหมด
                </Button>
              )}
            </div>
          </div>

          {/* Test Trigger Simulator Box */}
          <div className="p-3.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                <Zap className="size-4 text-[var(--accent)] shrink-0" />
                <span>จำลองการส่งการแจ้งเตือน (9 Event Simulator)</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-[var(--accent)] border-[var(--accent)]/30">
                4 ช่องทางพร้อมกัน
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={selectedTestEvent}
                onChange={(e) => setSelectedTestEvent(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
              >
                {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label} ({key})
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={handleTriggerTest}
                disabled={triggering}
                className="h-9 px-4 text-xs font-bold gap-1.5 cursor-pointer bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110 shrink-0"
              >
                <Send className={`size-3.5 ${triggering ? "animate-spin" : ""}`} />
                <span>{triggering ? "กำลังส่ง..." : "⚡ ยิงทดสอบ"}</span>
              </Button>
            </div>
          </div>

          {triggerSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{triggerSuccess}</span>
            </div>
          )}

          {/* Channel Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-[var(--line)] scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-xs"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              ทั้งหมด ({counts.total})
            </button>
            <button
              onClick={() => setActiveTab("in_app")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === "in_app"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-xs"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              <Bell className="size-3.5" />
              <span>In-App ({counts.inApp})</span>
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === "email"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-xs"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              <Mail className="size-3.5" />
              <span>Email ({counts.email})</span>
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === "sms"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-xs"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>SMS ({counts.sms})</span>
            </button>
            <button
              onClick={() => setActiveTab("push")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === "push"
                  ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-xs"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              <Zap className="size-3.5" />
              <span>Web Push ({counts.push})</span>
            </button>
          </div>
        </DialogHeader>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-[var(--ink-3)] space-y-2">
              <Bell className="size-10 mx-auto opacity-30" />
              <p className="text-sm font-bold">ไม่มีการแจ้งเตือนในหมวดหมู่นี้</p>
              <p className="text-xs">กดปุ่ม "⚡ ยิงทดสอบ" ด้านบนเพื่อจำลองการส่งการแจ้งเตือน</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const cfg = EVENT_TYPE_CONFIG[n.type] || {
                label: n.type,
                icon: Bell,
                color: "text-[var(--accent)]",
                bg: "bg-[var(--accent)]/10 border-[var(--accent)]/30",
              };
              const IconComp = cfg.icon;

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !n.isRead && n.channel === "in_app"
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                      : "border-[var(--line)] bg-[var(--surface-2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}
                      >
                        <IconComp className="size-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] font-mono font-bold ${cfg.color} border-current/30`}>
                            {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)]">
                            {n.channel}
                          </Badge>
                          {n.recipient && (
                            <span className="text-[11px] font-mono text-[var(--ink-3)]">
                              To: {n.recipient}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">
                          {n.title}
                        </h4>
                        <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-[var(--ink-3)] block">
                        {n.sentAt ? new Date(n.sentAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ink-3)] block">
                        {n.sentAt ? new Date(n.sentAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
