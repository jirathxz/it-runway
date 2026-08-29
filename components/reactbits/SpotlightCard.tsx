"use client";

import { useRef, useState } from "react";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
};

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(250, 204, 21, 0.15)",
  spotlightSize = 300,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden border bg-zinc-900 ${className}`}
      style={
        {
          "--spot-x": `${pos.x}px`,
          "--spot-y": `${pos.y}px`,
          "--spot-color": spotlightColor,
          "--spot-size": `${spotlightSize}px`,
          "--spot-opacity": opacity,
          borderRadius: "var(--radius)",
          borderColor: "var(--line)",
          background: "var(--surface)",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[var(--spot-opacity)] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle var(--spot-size) at var(--spot-x) var(--spot-y), var(--spot-color), transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
