"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { sceneStore } from "@/lib/scene-store";

// Refractive crystal at the heart of the hero brain. It lives inside the particle
// group, so it inherits the brain's position/offset; it shrinks away after the hero.
export default function GlassCore({ background, edgeColor }) {
  const mesh = useRef(null);
  const shown = useRef(0);
  const bg = useMemo(() => new THREE.Color(background), [background]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.7, 0)), []);

  useFrame((state, delta) => {
    const s = sceneStore.get();
    const target = !s.override && s.progress < 0.5 ? 1 : 0;
    shown.current += (target - shown.current) * (1 - Math.exp(-delta * 4));

    const m = mesh.current;
    const k = shown.current;
    m.visible = k > 0.01;
    m.scale.setScalar(1.05 * k);
    m.rotation.x += delta * 0.25 + state.pointer.y * delta * 0.6;
    m.rotation.z += delta * 0.15 - state.pointer.x * delta * 0.6;
    m.position.x += (state.pointer.x * 0.35 - m.position.x) * (1 - Math.exp(-delta * 3));
    m.position.y += (state.pointer.y * 0.25 - m.position.y) * (1 - Math.exp(-delta * 3));
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.7, 0]} />
      <MeshTransmissionMaterial
        background={bg}
        samples={6}
        resolution={256}
        transmission={1}
        thickness={0.5}
        roughness={0.08}
        ior={1.22}
        chromaticAberration={0.2}
        anisotropy={0.2}
        distortion={0.2}
        distortionScale={0.4}
        temporalDistortion={0.1}
        color="#c7d2fe"
      />
      {/* crisp facet edges so it reads as a cut crystal, not a blob */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.55} />
      </lineSegments>
    </mesh>
  );
}
