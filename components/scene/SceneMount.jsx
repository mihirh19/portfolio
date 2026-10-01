"use client";

import dynamic from "next/dynamic";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export default function SceneMount() {
  return <SceneCanvas />;
}
