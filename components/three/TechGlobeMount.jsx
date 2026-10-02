"use client";

import dynamic from "next/dynamic";

const TechGlobe = dynamic(() => import("./TechGlobe"), {
  ssr: false,
  loading: () => <div className="h-[360px] md:h-[460px]" />,
});

export default function TechGlobeMount({ items }) {
  return <TechGlobe items={items} />;
}
