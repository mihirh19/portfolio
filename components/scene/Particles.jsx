"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildShapes } from "./shapes";
import { vertexShader, fragmentShader } from "./shaders";
import { sceneStore } from "@/lib/scene-store";
import { scrollState } from "@/lib/scroll-state";

const DEFAULT_SEQUENCE = ["brain"];

export default function Particles({ count, palette, reducedMotion, children }) {
  const points = useRef(null);
  const baseOpacity = useRef(palette.opacity);
  const invalidate = useThree((s) => s.invalidate);
  const shapes = useMemo(() => buildShapes(count), [count]);

  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(shapes.brain.slice(), 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(shapes.scatter, 3));
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uAssemble: { value: reducedMotion ? 1 : 0 },
        uSize: { value: 24 },
        uPixelRatio: { value: 1 },
        uBeat: { value: 0 },
        uVelocity: { value: 0 },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uOpacity: { value: 1 },
        uGlowBoost: { value: 0 },
      },
    });
    return { geometry: g, material: m };
  }, [shapes, count, reducedMotion]);

  useEffect(() => {
    const u = material.uniforms;
    u.uColorA.value.set(palette.colorA);
    u.uColorB.value.set(palette.colorB);
    baseOpacity.current = palette.opacity;
    u.uSize.value = palette.size;
    u.uGlowBoost.value = palette.glowBoost;
    material.blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.needsUpdate = true;
    invalidate();
  }, [palette, material, invalidate]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useEffect(() => (reducedMotion ? sceneStore.subscribe(() => invalidate()) : undefined), [reducedMotion, invalidate]);

  const current = useRef({ progress: 0, from: "brain", to: "brain", pulse: 0, beat: 0 });
  const pointerActive = useRef(false);

  useEffect(() => {
    const on = () => (pointerActive.current = true);
    const off = () => (pointerActive.current = false);
    window.addEventListener("pointermove", on);
    document.documentElement.addEventListener("pointerleave", off);
    return () => {
      window.removeEventListener("pointermove", on);
      document.documentElement.removeEventListener("pointerleave", off);
    };
  }, []);

  useFrame((state, delta) => {
    const s = sceneStore.get();
    const u = material.uniforms;
    const c = current.current;
    const seq = s.sequence.length ? s.sequence : DEFAULT_SEQUENCE;

    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    c.progress += (Math.min(s.progress, seq.length - 1) - c.progress) * ease;

    let from;
    let to;
    let morph;
    // Per-section placement: x offset (fraction of viewport width) and brightness.
    let offset = 0;
    let fade = 1;
    if (s.override) {
      from = to = s.override;
      morph = 0;
    } else {
      const f = Math.floor(c.progress);
      const t = Math.min(f + 1, seq.length - 1);
      from = seq[f];
      to = seq[t];
      morph = c.progress - f;
      const k = morph * morph * (3 - 2 * morph);
      offset = (s.offsets[f] ?? 0) + ((s.offsets[t] ?? 0) - (s.offsets[f] ?? 0)) * k;
      fade = (s.opacities[f] ?? 1) + ((s.opacities[t] ?? 1) - (s.opacities[f] ?? 1)) * k;
    }

    // Shift aside only on wide screens; on phones keep it centered but a bit dimmer.
    const wide = state.viewport.width / state.viewport.height > 1.1;
    const targetX = wide ? offset * state.viewport.width : 0;
    points.current.position.x += (targetX - points.current.position.x) * ease;
    u.uOpacity.value = baseOpacity.current * fade * (wide ? 1 : 0.75);

    if (from !== c.from || to !== c.to) {
      geometry.attributes.aFrom.array.set(shapes[from]);
      geometry.attributes.aTo.array.set(shapes[to]);
      geometry.attributes.aFrom.needsUpdate = true;
      geometry.attributes.aTo.needsUpdate = true;
      c.from = from;
      c.to = to;
    }

    if (s.pulse !== c.pulse) {
      c.pulse = s.pulse;
      c.beat = 1;
    }
    c.beat *= Math.exp(-delta * 3);

    u.uMorph.value = morph;
    u.uAssemble.value += (s.assemble - u.uAssemble.value) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 2.5));
    u.uBeat.value = c.beat;
    const vel = Math.max(-1, Math.min(1, scrollState.velocity / 40));
    u.uVelocity.value += (vel - u.uVelocity.value) * (1 - Math.exp(-delta * 6));
    u.uPixelRatio.value = state.gl.getPixelRatio();
    if (pointerActive.current) {
      u.uPointer.value.set((state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0);
    } else {
      u.uPointer.value.set(99, 99, 0);
    }

    if (!reducedMotion) {
      u.uTime.value += delta;
      points.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={points} geometry={geometry} material={material} frustumCulled={false}>
      {children}
    </points>
  );
}
