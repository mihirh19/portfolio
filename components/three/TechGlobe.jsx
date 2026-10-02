"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import TechIcon from "@/components/ui/TechIcon";
import { scrollState } from "@/lib/scroll-state";

const RADIUS = 2.1;

function fibonacciSphere(n, r) {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    return new THREE.Vector3(Math.cos(theta) * rr * r, y * r, Math.sin(theta) * rr * r);
  });
}

// Icons live in a plain DOM layer over the canvas (not drei <Html>, whose per-item
// React roots race React when the item list changes) and are placed each frame.
function Globe({ count, nodes, drag, reducedMotion }) {
  const group = useRef(null);
  const positions = useMemo(() => fibonacciSphere(count, RADIUS), [count]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }, delta) => {
    const g = group.current;
    const d = drag.current;
    const spin = reducedMotion ? 0 : 0.12 + Math.min(Math.abs(scrollState.velocity) * 0.01, 0.6);
    if (d.active) {
      // Follow the pointer exactly while dragging.
      g.rotation.y += d.pendingX;
      g.rotation.x += d.pendingY;
      d.pendingX = d.pendingY = 0;
    } else {
      // Fling momentum after release, plus the idle spin.
      g.rotation.y += d.vx + spin * delta;
      g.rotation.x += d.vy;
      d.vx *= Math.exp(-delta * 3);
      d.vy *= Math.exp(-delta * 3);
    }
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x, -0.9, 0.9);

    // Depth cue: icons at the back fade and shrink, front ones pop.
    for (let i = 0; i < positions.length; i++) {
      const el = nodes.current[i];
      if (!el) continue;
      tmp.copy(positions[i]).applyEuler(g.rotation);
      const t = (tmp.z + RADIUS) / (2 * RADIUS);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.width;
      const y = (-tmp.y * 0.5 + 0.5) * size.height;
      el.style.opacity = String(0.12 + 0.88 * t * t);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.55 + 0.65 * t})`;
      el.style.zIndex = String(Math.round(t * 40));
      el.style.filter = t < 0.45 ? `blur(${(0.45 - t) * 4}px)` : "none";
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[RADIUS * 0.98, 3]} />
        <meshBasicMaterial color="#8a90a6" wireframe transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

export default function TechGlobe({ items }) {
  const container = useRef(null);
  const nodes = useRef([]);
  const drag = useRef({ active: false, x: 0, y: 0, pendingX: 0, pendingY: 0, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const reducedMotion = !!useReducedMotion();
  const [inView, setInView] = useState(false);

  // Only render while on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" });
    io.observe(container.current);
    return () => io.disconnect();
  }, []);

  const onPointerDown = (e) => {
    const d = drag.current;
    d.active = true;
    d.x = e.clientX;
    d.y = e.clientY;
    d.lastX = d.lastY = d.vx = d.vy = 0;
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = (e.clientX - d.x) * 0.006;
    const dy = (e.clientY - d.y) * 0.006;
    d.pendingX += dx;
    d.pendingY += dy;
    d.lastX = dx;
    d.lastY = dy;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const end = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    d.vx = d.lastX;
    d.vy = d.lastY;
  };

  return (
    <div
      ref={container}
      data-cursor="drag"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      className="relative h-[360px] touch-pan-y select-none md:h-[460px]"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        frameloop={inView ? "always" : "never"}
      >
        <Globe count={items.length} nodes={nodes} drag={drag} reducedMotion={reducedMotion} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {items.map((name, i) => (
          <div
            key={name}
            ref={(el) => (nodes.current[i] = el)}
            style={{ opacity: 0 }}
            className="group/icon pointer-events-auto absolute top-0 left-0 grid place-items-center will-change-transform"
            title={name}
          >
            <span className="grid size-12 place-items-center rounded-2xl border border-line bg-bg/70 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover/icon:scale-125">
              <TechIcon name={name} size={30} />
            </span>
            <span className="pointer-events-none absolute top-full mt-1.5 rounded-full bg-fg px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-bg opacity-0 transition-opacity group-hover/icon:opacity-100">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
