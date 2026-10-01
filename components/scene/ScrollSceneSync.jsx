"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sceneStore } from "@/lib/scene-store";
import { computeSceneProgress } from "./progress";

export default function ScrollSceneSync() {
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const els = Array.from(document.querySelectorAll("[data-scene]"));
      if (!els.length) return;
      sceneStore.set({
        sequence: els.map((el) => el.dataset.scene),
        progress: computeSceneProgress(
          els.map((el) => el.getBoundingClientRect()),
          window.innerHeight,
        ),
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
