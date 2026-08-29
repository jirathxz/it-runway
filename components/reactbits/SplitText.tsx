"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number; // ms per char/word
  duration?: number; // seconds
  ease?: string;
  splitType?: "chars" | "words" | "lines";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  tag?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
};

export default function SplitText({
  text,
  className = "",
  delay = 40,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  tag = "p",
  textAlign,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>("[data-split]");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              overwrite: "auto",
              onComplete: onLetterAnimationComplete,
            }
          );
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, ease, from, to, threshold, onLetterAnimationComplete, text]);

  const words = text.split(" ");
  const renderChars = (word: string, wi: number) =>
    word.split("").map((char, ci) => (
      <span
        key={`${wi}-${ci}`}
        data-split
        className="inline-block will-change-transform"
        style={{ display: "inline-block" }}
      >
        {char}
      </span>
    ));

  const renderWords = () =>
    words.map((w, i) => (
      <span key={i} data-split className="inline will-change-transform" style={{ marginRight: "0.22em" }}>
        {w}
      </span>
    ));

  const Tag = tag as any;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        textAlign,
        overflow: "visible",
        // keep line box tight but allow Thai marks to show
        display: "inline-block",
        verticalAlign: "baseline",
      }}
      aria-label={text}
    >
      {splitType === "chars" ? (
        <span aria-hidden>
          {words.map((w, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em]">
              {renderChars(w, wi)}
            </span>
          ))}
        </span>
      ) : (
        renderWords()
      )}
    </Tag>
  );
}
