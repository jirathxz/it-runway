"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RouteArt from "./RouteArt";
import { Icon } from "./icons";
import type { EventRow, OrgSlide } from "@/lib/types";

type PosterSlide = EventRow;

export default function Carousel({
  slides,
  variant,
}: {
  slides: PosterSlide[] | OrgSlide[];
  variant: "poster" | "org";
}) {
  const hostRef = useRef<HTMLElement | null>(null);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const total = slides.length;

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % total);
    }, 6500);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  const i = ((index % total) + total) % total;
  const count = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const fill = ((i + 1) / total) * 100;

  const go = (dir: number) => setIndex((cur) => (cur + dir + total) % total);

  const navButtons = (
    <div className="hero-nav">
      <button
        className="icon-btn"
        type="button"
        aria-label="งานก่อนหน้า"
        onClick={() => go(-1)}
      >
        <Icon name="chevron-left" />
      </button>
      <div className="hero-track" aria-hidden="true">
        <span style={{ width: `${fill}%` }} />
      </div>
      <span className="hero-count">{count}</span>
      <button
        className="icon-btn"
        type="button"
        aria-label="งานถัดไป"
        onClick={() => go(1)}
      >
        <Icon name="chevron-right" />
      </button>
    </div>
  );

  const hoverHandlers = {
    onMouseEnter: () => {
      pausedRef.current = true;
    },
    onMouseLeave: () => {
      pausedRef.current = false;
    },
    onFocusCapture: () => {
      pausedRef.current = true;
    },
    onBlurCapture: () => {
      pausedRef.current = false;
    },
  };

  if (variant === "poster") {
    const s = slides[i] as PosterSlide;
    if (!s.id || !s.grad) return null;
    return (
      <section
        className="hero"
        ref={hostRef as React.RefObject<HTMLElement>}
        aria-label="งานวิ่งแนะนำ"
        {...hoverHandlers}
      >
        <div className="wrap hero-grid">
          <div className="poster" aria-hidden="true">
            <div className="poster-bg" style={{ background: s.grad }} />
            <RouteArt color={s.route || "#E9EEF3"} />
            <span className="poster-dist" style={{ color: s.ghost }}>
              {s.dist}
            </span>
          </div>
          <div className="hero-col">
            <div className="panel">
              <div className="panel-top">
                <span className="chip chip-night">งานวิ่งแนะนำ</span>
                <span className="card-code">{s.code}</span>
              </div>
              <h1 className="hero-title">{s.title}</h1>
              <p className="hero-sub">{s.sub}</p>
              <dl className="meta-grid">
                <div>
                  <dt>วันที่</dt>
                  <dd>{s.date}</dd>
                </div>
                <div>
                  <dt>เวลาเริ่ม</dt>
                  <dd>{s.start}</dd>
                </div>
                <div>
                  <dt>สถานที่</dt>
                  <dd>{s.place}</dd>
                </div>
                <div>
                  <dt>ระยะทาง</dt>
                  <dd>{s.distLabel}</dd>
                </div>
              </dl>
              <p className="card-org">
                ผู้จัดงาน: <b>{s.org}</b>
              </p>
              <div className="btn-row">
                <Link className="btn btn-primary" href={`/events/${s.id}`}>
                  สมัครเลย!
                </Link>
                <Link className="btn btn-ghost" href={`/events/${s.id}`}>
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
            {navButtons}
          </div>
        </div>
      </section>
    );
  }

  const s = slides[i] as OrgSlide;
  return (
    <section
      className="hero hero-org"
      ref={hostRef as React.RefObject<HTMLElement>}
      aria-label="สำหรับผู้จัดงาน"
      {...hoverHandlers}
    >
      <div className="hero-org-visual" aria-hidden="true">
        <div className="poster-bg" style={{ background: s.grad }} />
        <RouteArt />
      </div>
      <div className="wrap hero-org-inner">
        <div className="hero-org-content">
          <span className="chip chip-dawn">สำหรับผู้จัดงาน</span>
          <h1 className="hero-org-title">{s.title}</h1>
          <p className="hero-org-sub">{s.sub}</p>
          <div className="btn-row">
            <a className="btn btn-primary" href="#promo">
              ประชาสัมพันธ์งานฟรี
            </a>
            <a className="btn btn-ghost" href="#form">
              ปรึกษาทีมงาน
            </a>
          </div>
        </div>
        {navButtons}
      </div>
    </section>
  );
}