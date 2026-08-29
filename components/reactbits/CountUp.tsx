"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type CountUpProps = {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  separator?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  onComplete?: () => void;
};

export default function CountUp({
  from = 0,
  to,
  duration = 1.2,
  delay = 0,
  separator = "",
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  onComplete,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion — show final value immediately, no tween
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(to);
      onComplete?.();
      return;
    }

    const obj = { val: from };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: to,
        duration,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          setDisplay(obj.val);
        },
        onComplete,
      });
    }, el);

    return () => ctx.revert();
  }, [from, to, duration, delay, onComplete]);

  const formatted = (() => {
    const fixed = display.toFixed(decimals);
    const [intPart, decPart] = fixed.split(".");
    const withSep = separator ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : intPart;
    return decPart !== undefined ? `${withSep}.${decPart}` : withSep;
  })();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
