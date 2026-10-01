"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import Particles from "./Particles";
import { getPalette } from "./palettes";
import { sceneStore } from "@/lib/scene-store";

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const getDimmed = () => sceneStore.get().dimmed;

export default function SceneCanvas() {
  const { resolvedTheme } = useTheme();
  const reducedMotion = !!useReducedMotion();
  const dimmed = useSyncExternalStore(sceneStore.subscribe, getDimmed, () => false);
  const [supported, setSupported] = useState(null);
  const [count, setCount] = useState(8000);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());
    setCount(window.innerWidth < 768 ? 3000 : 8000);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (supported === null) return null;
  const palette = getPalette(resolvedTheme);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-[opacity,filter] duration-700"
      style={{ opacity: dimmed ? 0.35 : 1, filter: dimmed ? "blur(6px)" : "none" }}
    >
      {supported ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={hidden ? "never" : reducedMotion ? "demand" : "always"}
          eventSource={document.body}
          eventPrefix="client"
        >
          <Particles count={count} palette={palette} reducedMotion={reducedMotion} />
          {palette.bloom && (
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.25} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      ) : (
        <div className="scene-fallback absolute inset-0" />
      )}
    </div>
  );
}
