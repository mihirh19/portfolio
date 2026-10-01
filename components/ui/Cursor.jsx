"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const sizes = { default: 32, link: 48, magnetic: 64, view: 96 };

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState("default");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e) => {
      const target = e.target.closest?.("[data-cursor]");
      const interactive = e.target.closest?.("a, button, [role='button'], input, textarea, select, label");
      setVariant(target ? target.dataset.cursor : interactive ? "link" : "default");
    };
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = sizes[variant] ?? sizes.default;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{ width: size, height: size, backgroundColor: variant === "view" ? "#ffffff" : "rgba(255,255,255,0)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white"
        >
          {variant === "view" && <span className="font-mono text-xs font-bold text-black">View</span>}
        </motion.div>
      </motion.div>
      <motion.div style={{ x, y }} className="absolute top-0 left-0">
        <div className={`size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${variant === "view" ? "opacity-0" : ""}`} />
      </motion.div>
    </div>
  );
}
