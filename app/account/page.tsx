import * as React from "react";
import { Navbar } from "@/components/navbar";
import { AccountProfileView } from "@/components/account/account-profile-view";
import { Footprints } from "lucide-react";

export const metadata = {
  title: "ข้อมูลบัญชีนักวิ่ง | IT RUNWAY",
  description: "จัดการข้อมูลส่วนตัว สังกัดชมรม ขนาดเสื้อ และความปลอดภัยของบัญชีนักวิ่ง IT Runway นครปฐม",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Account Content */}
      <main className="flex-1 w-full max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <AccountProfileView />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-6 mt-12 bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 font-[var(--font-mono)] text-xs text-[var(--ink-3)]">
          <span>© 2026 IT RUNWAY — Athlete Profile & Timing System.</span>
          <span className="flex items-center gap-2 text-[var(--accent)] font-bold">
            <Footprints className="size-3.5" />
            <span>NAKHON PATHOM ATHLETE CAPITAL</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
