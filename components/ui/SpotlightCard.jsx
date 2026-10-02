"use client";

import { cn } from "@/lib/cn";

export default function SpotlightCard({ className, children, as: Tag = "div", ...props }) {
  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <Tag onPointerMove={onPointerMove} className={cn("spotlight glass relative overflow-hidden", className)} {...props}>
      {children}
    </Tag>
  );
}
