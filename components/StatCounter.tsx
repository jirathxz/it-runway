"use client";

import { useEffect, useRef, useState } from "react";

const fmt = new Intl.NumberFormat("en-US");

export default function StatCounter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("0+");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (reduced) {
        setText(fmt.format(value) + "+");
        return;
      }
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setText(fmt.format(Math.round(value * (1 - Math.pow(1 - p, 3)))) + "+");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    let counted = false;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting) && !counted) {
            counted = true;
            run();
            io.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    }
    run();
  }, [value]);

  return (
    <div className="stat" ref={ref}>
      <dt className="stat-num">{text}</dt>
      <dd className="stat-label">{label}</dd>
    </div>
  );
}