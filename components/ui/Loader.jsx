"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { sceneStore } from "@/lib/scene-store";
import { site } from "@/content/site";

export default function Loader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.introSeen) {
      setDone(true);
      sceneStore.set({ assemble: 1 });
      return;
    }
    sceneStore.set({ assemble: 0 });
    const controls = animate(0, 100, {
      duration: 1.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {}
        setDone(true);
        sceneStore.set({ assemble: 1 });
      },
    });
    return () => controls.stop();
  }, []);

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.dataset.introSeen = "1")}>
      {!done && (
        <motion.div
          data-testid="intro-loader"
          className="intro-loader fixed inset-0 z-[150] flex flex-col items-center justify-center gap-6 bg-bg"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <svg viewBox="0 0 600 120" className="w-[min(80vw,600px)]" aria-label={site.name} role="img">
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="84"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="intro-stroke font-display"
            >
              {site.name}
            </text>
          </svg>
          <span className="font-mono text-sm text-muted tabular-nums">{String(count).padStart(3, "0")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
