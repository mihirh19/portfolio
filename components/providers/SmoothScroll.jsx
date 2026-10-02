"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { scrollState } from "@/lib/scroll-state";

gsap.registerPlugin(ScrollTrigger, SplitText);

function ScrollTriggerSync() {
  useLenis((lenis) => {
    ScrollTrigger.update();
    scrollState.velocity = lenis.velocity;
  });
  return null;
}

export default function SmoothScroll({ children }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const update = (time) => {
      scrollState.velocity *= 0.9; // decays to rest; Lenis overwrites it while scrolling
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reducedMotion]);

  if (reducedMotion) return children;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, anchors: true }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
