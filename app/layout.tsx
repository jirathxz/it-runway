import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Runway — ศูนย์รวมงานวิ่งและกีฬานครปฐม",
  description:
    "ค้นหาและสมัครงานวิ่ง ปั่นจักรยาน ไตรกีฬา และกีฬาทุกประเภทในจังหวัดนครปฐมและทั่วไทย จบในที่เดียวที่ IT Runway",
  keywords: ["งานวิ่ง", "วิ่งนครปฐม", "สมัครวิ่ง", "IT Runway", "วิ่งเทรล", "ปั่นจักรยาน"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Chakra+Petch:wght@600;700&family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Kanit:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--base)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--accent-ink)]">
        {/* Skip-to-main: first focusable element — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:inline-flex focus:items-center focus:gap-2 focus:rounded-[var(--radius)] focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--accent-ink)] focus:shadow-[var(--shadow-far)] focus:outline-none"
        >
          ข้ามไปเนื้อหาหลัก
        </a>
        {children}
      </body>
    </html>
  );
}
