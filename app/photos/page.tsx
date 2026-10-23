import * as React from "react";
import { Navbar } from "@/components/navbar";
import { RunnerPhotosView } from "@/components/results/runner-photos-view";
import { Camera, Sparkles, Image as ImageIcon, Zap, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "ค้นหาภาพถ่ายนักวิ่งด้วยเลข BIB | IT RUNWAY",
  description:
    "ค้นหาภาพถ่ายความคมชัดสูงจากทีมช่างภาพในสนาม ด้วยหมายเลข BIB หรือชื่อนักวิ่ง พร้อมดาวน์โหลดภาพต้นฉบับและแชร์สู่โซเชียล",
};

export default function PhotosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] text-[var(--ink)]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold font-[var(--font-mono)]">
                <Sparkles className="size-3.5" />
                <span>AI-POWERED BIB RECOGNITION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-[var(--font-display)] tracking-tight text-[var(--ink)]">
                ค้นหาภาพถ่ายนักวิ่ง <span className="text-[var(--accent)]">ด้วยเลข BIB</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed">
                ค้นหาจังหวะวิ่งที่น่าจดจำของคุณจากทุก Checkpoint (จุดปล่อยตัว, กม. 5, กม. 15, เส้นชัย และซุ้มรับเหรียญ) จากทีมช่างภาพมืออาชีพทั่วจังหวัดนครปฐม
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[var(--surface-2)] p-4 rounded-[var(--radius)] border border-[var(--line)] shrink-0">
              <div className="size-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                <Camera className="size-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-[var(--ink-3)] font-mono">ความคมชัดสูง</div>
                <div className="text-sm font-bold text-[var(--ink)]">ดาวน์โหลดฟรี ไม่มีลายน้ำ</div>
              </div>
            </div>
          </div>
        </section>

        {/* Runner Photos View Component */}
        <RunnerPhotosView />
      </main>
    </div>
  );
}
