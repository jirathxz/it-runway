import type { Metadata } from "next";
import { Chakra_Petch, Barlow_Condensed, IBM_Plex_Sans_Thai_Looped, JetBrains_Mono, Prompt, Kanit, Sarabun, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["600", "700", "800"],
  variable: "--font-kanit",
  display: "swap",
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["600", "700", "800"],
  variable: "--font-noto-thai",
  display: "swap",
});

const chakra = Chakra_Petch({
  subsets: ["latin", "thai"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bib",
  display: "swap",
});

const ibmSansThai = IBM_Plex_Sans_Thai_Looped({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-text",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IT Runway — ศูนย์รวมงานวิ่งและกีฬานครปฐม",
  description:
    "ค้นหาและสมัครงานวิ่ง ปั่นจักรยาน ไตรกีฬา และกีฬาทุกประเภทในจังหวัดนครปฐมและทั่วไทย จบในที่เดียวที่ IT Runway",
  keywords: ["งานวิ่ง", "วิ่งนครปฐม", "สมัครวิ่ง", "IT Runway", "วิ่งเทรล", "ปั่นจักรยาน"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${kanit.variable} ${sarabun.variable} ${notoThai.variable} ${chakra.variable} ${barlow.variable} ${ibmSansThai.variable} ${jetbrains.variable} h-full antialiased`}
    >
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
