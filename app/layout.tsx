import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "IT-Runway — ปฏิทินงานวิ่ง สมัครงานวิ่ง มาราธอน เทรล",
    template: "%s | IT-Runway",
  },
  description:
    "รวมปฏิทินงานวิ่งทั่วไทย สมัครงานวิ่ง มาราธอน เทรล ฟันรัน ผ่านระบบไอที-รันเวย์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- CDN fonts mirror the static site; next/font build-time fetch rejected to keep builds offline-safe */}
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono+Thai+Looped:wght@400;500;600&family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}