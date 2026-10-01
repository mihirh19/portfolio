"use client";

import { useEffect } from "react";
import { sceneStore } from "@/lib/scene-store";

export default function SceneOverride({ shape, dimmed = false }) {
  useEffect(() => {
    sceneStore.set({ override: shape, dimmed });
    return () => sceneStore.set({ override: null, dimmed: false });
  }, [shape, dimmed]);
  return null;
}
