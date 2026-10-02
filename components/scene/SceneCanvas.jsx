"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import Particles from "./Particles";
import GlassCore from "./GlassCore";
import { getPalette } from "./palettes";
import { sceneStore } from "@/lib/scene-store";
import { scrollState } from "@/lib/scroll-state";

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const getDimmed = () => sceneStore.get().dimmed;

// Colour fringing that grows with scroll speed.
function VelocityAberration({ effect }) {
  const amount = useRef(0);
  useFrame((_, delta) => {
    const target = Math.max(-0.012, Math.min(0.012, scrollState.velocity * 0.0005));
    amount.current += (target - amount.current) * (1 - Math.exp(-delta * 8));
    effect.current?.offset.set(amount.current, amount.current * 0.4);
  });
  return null;
}

export default function SceneCanvas() {
  const { resolvedTheme } = useTheme();
  const reducedMotion = !!useReducedMotion();
  const dimmed = useSyncExternalStore(sceneStore.subscribe, getDimmed, () => false);
  const [supported, setSupported] = useState(null);
  const [count, setCount] = useState(8000);
  const [hidden, setHidden] = useState(false);
  const aberration = useRef(null);
  const aberrationOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useEffect(() => {
    setSupported(hasWebGL());
    setCount(window.innerWidth < 768 ? 3000 : 8000);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (supported === null) return null;
  const palette = getPalette(resolvedTheme);
  const desktop = count >= 8000;

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
          <Particles count={count} palette={palette} reducedMotion={reducedMotion}>
            {desktop && <GlassCore background={palette.coreBackground} edgeColor={palette.coreEdge} />}
          </Particles>
          {palette.bloom && (
            <>
              <EffectComposer>
                <Bloom intensity={0.6} luminanceThreshold={0.25} mipmapBlur />
                <ChromaticAberration ref={aberration} offset={aberrationOffset} radialModulation={false} modulationOffset={0} />
              </EffectComposer>
              {!reducedMotion && <VelocityAberration effect={aberration} />}
            </>
          )}
        </Canvas>
      ) : (
        <div className="scene-fallback absolute inset-0" />
      )}
    </div>
  );
}
