"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number; // ms per word
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
};

export default function BlurText({
  text,
  className = "",
  delay = 80,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
}: BlurTextProps) {
  const elements = useMemo(() => {
    if (animateBy === "letters") return text.split("");
    return text.split(" ");
  }, [text, animateBy]);

  const hidden = {
    filter: "blur(10px)",
    opacity: 0,
    y: direction === "top" ? -20 : 20,
  };
  const visible = {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  };

  return (
    <span className={className} aria-label={text}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={hidden}
          whileInView={visible}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.5,
            delay: (i * delay) / 1000,
            ease: "easeOut",
          }}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
          className="inline-block will-change-[filter,transform,opacity]"
          style={{ marginRight: animateBy === "words" ? "0.25em" : "0", display: "inline-block" }}
          aria-hidden
        >
          {el === " " ? "\u00A0" : el}
        </motion.span>
      ))}
    </span>
  );
}
