"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Every word stays mounted and animates to shown/hidden, so no exit animation has
// to finish before the next word can show. Only the active word takes up space.
export default function RotatingWords({ words, className, interval = 2200 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      {words.map((word, n) => (
        <motion.span
          key={word}
          aria-hidden={n !== i}
          initial={false}
          animate={n === i ? { y: "0%", opacity: 1 } : { y: n < i ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`whitespace-nowrap ${n === i ? "relative" : "absolute top-0 left-0"} ${className ?? ""}`}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
