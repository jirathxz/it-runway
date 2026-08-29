"use client";

import { motion } from "framer-motion";
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
