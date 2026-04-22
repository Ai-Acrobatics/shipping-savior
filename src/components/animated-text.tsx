"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
}

export function AnimatedText({ text, delay = 0 }: AnimatedTextProps) {
  return (
    <span key={text}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${text}-${index}`}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.03,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
