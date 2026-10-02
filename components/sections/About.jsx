"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TiltCard from "@/components/ui/TiltCard";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = root.current.querySelectorAll("[data-word]");
        gsap.set(words, { opacity: 0.12 });
        gsap.to(words, {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: root.current.querySelector("[data-pin]"), start: "top top", end: "+=180%", pin: true, scrub: 0.5 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} data-section data-scene="network" data-scene-x="0.25" data-scene-opacity="0.7" className="relative">
      <div data-pin className="flex min-h-svh items-center px-6 md:px-12">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-[1fr_320px]">
          <div>
            <p className="eyebrow">01 — About</p>
            <p className="mt-6 font-display text-3xl leading-tight md:text-5xl">
              {site.about.headline.split(" ").map((w, i) => (
                <span key={i} data-word className="mr-[0.25em] inline-block">{w}</span>
              ))}
            </p>
          </div>
          <TiltCard className="aspect-[4/5] w-full max-w-xs justify-self-center">
            <Image src={site.avatar} alt={`Portrait of ${site.name}`} width={320} height={400} unoptimized className="size-full object-cover" />
          </TiltCard>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-6 px-6 pb-32 text-lg text-muted md:text-xl">
        {site.about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="pt-10">
          <h3 className="eyebrow">Certifications & achievements</h3>
          <ul className="mt-6 divide-y divide-line border-y border-line text-base">
            {site.certifications.map((c) => (
              <li key={c.title}>
                <a href={c.href} target="_blank" rel="noreferrer" className="flex items-baseline justify-between gap-6 py-4 text-fg hover:text-accent">
                  <span>{c.title} ↗</span>
                  <span className="shrink-0 font-mono text-xs text-muted">{c.date}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
