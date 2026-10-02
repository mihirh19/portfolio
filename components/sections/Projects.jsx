"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProjectCard from "./ProjectCard";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Projects() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current.querySelector("[data-pin]"),
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="projects" ref={root} data-section data-scene="grid" data-scene-opacity="0.4" className="relative">
      <div data-pin className="flex min-h-svh flex-col justify-center overflow-hidden py-24">
        <div className="px-6 md:px-12">
          <p className="eyebrow">03 — Selected work</p>
          <h2 className="section-title">Things I&apos;ve built</h2>
        </div>
        <div
          ref={track}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:px-12 md:motion-safe:w-max md:motion-safe:overflow-visible"
        >
          {site.projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
