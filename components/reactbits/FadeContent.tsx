"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

type FadeContentProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blur?: boolean;
  threshold?: number;
};

export default function FadeContent({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  blur = false,
  threshold = 0.1,
}: FadeContentProps) {
  const shouldReduceMotion = useReducedMotion();

  // When reduced-motion is preferred, render children immediately with no animation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration, delay: delay / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
