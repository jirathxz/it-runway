"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/seed";
import { Icon } from "./icons";

const KEY_HREFS: Record<string, string> = {
  home: "/",
  calendar: "/#",
  results: "/#",
  organizer: "/organizer",
};

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [isThai, setIsThai] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (key: string) => {
    if (key === "home") return pathname === "/";
    if (key === "organizer") return pathname.startsWith("/organizer");
    if (key === "calendar" || key === "results") return false;
    return false;
  };

  const links = navItems.map((n) => (
    <Link
      key={n.key}
      href={KEY_HREFS[n.key] ?? n.href}
      aria-current={isActive(n.key) ? "page" : undefined}
    >
      {n.label}
    </Link>
  ));

  return (
    <header className="nav">
      <div className="wrap nav-wrap">
        <Link className="brand" href="/">
          IT-Runway<span className="brand-dot" aria-hidden="true" />
        </Link>
        <nav className="nav-links" aria-label="เมนูหลัก">
          {links}
        </nav>
        <form
          className="search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <Icon name="search" className="search-icon" />
          <input
            type="search"
            placeholder="ค้นหางานวิ่ง…"
            aria-label="ค้นหางานวิ่ง"
          />
        </form>
        <button
          className="lang-btn"
          id="langBtn"
          type="button"
          aria-label={isThai ? "เปลี่ยนเป็นภาษาอังกฤษ" : "เปลี่ยนเป็นภาษาไทย"}
          onClick={() => setIsThai((t) => !t)}
        >
          {isThai ? "ภาษาไทย" : "English"}
        </button>
        <button
          className="icon-btn burger"
          id="burgerBtn"
          type="button"
          aria-expanded={open}
          aria-controls="mmenu"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="burger" />
        </button>
      </div>
      {open && (
        <div className="mmenu" id="mmenu">
          <div className="wrap mmenu-inner">
            <nav
              className="mmenu-links"
              aria-label="เมนูมือถือ"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              {links}
            </nav>
            <form
              className="search mmenu-search"
              role="search"
              onSubmit={(e) => e.preventDefault()}
            >
              <Icon name="search" className="search-icon" />
              <input
                type="search"
                placeholder="ค้นหางานวิ่ง…"
                aria-label="ค้นหางานวิ่ง"
              />
            </form>
            <div className="mmenu-auth">
              <a className="btn btn-ghost" href="#">
                เข้าสู่ระบบ
              </a>
              <a className="btn btn-primary" href="#">
                สมัครสมาชิก
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}