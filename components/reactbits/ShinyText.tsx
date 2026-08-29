"use client";

import React from "react";

type ShinyTextProps = {
  text: string;
  className?: string;
  speed?: number; // seconds
  color?: string;
  shineColor?: string;
  disabled?: boolean;
};

export default function ShinyText({
  text,
  className = "",
  speed = 3,
  color = "#71717A",
  shineColor = "#FACC15",
  disabled = false,
}: ShinyTextProps) {
  return (
    <span
      className={`relative inline-block overflow-hidden ${className}`}
      style={
        {
          color: disabled ? color : "transparent",
          backgroundImage: disabled
            ? undefined
            : `linear-gradient(110deg, ${color} 40%, ${shineColor} 50%, ${color} 60%)`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          animation: disabled ? undefined : `shiny-slide ${speed}s linear infinite`,
        } as React.CSSProperties
      }
    >
      {text}
      <style>{`
        @keyframes shiny-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
}
