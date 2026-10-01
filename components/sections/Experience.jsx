"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { site } from "@/content/site";

export default function Experience() {
  const list = useRef(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start center", "end center"] });

  return (
    <section id="experience" data-section data-scene="helix" className="relative overflow-x-clip py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <p className="eyebrow">04 — Journey</p>
        <h2 className="section-title">Experience & education</h2>
        <div ref={list} className="relative mt-16">
          <div className="absolute top-0 left-3 h-full w-px bg-line md:left-1/2">
            <motion.div style={{ scaleY: scrollYProgress }} className="size-full origin-top bg-linear-to-b from-accent to-accent-2" />
          </div>
          <ol className="space-y-16">
            {site.experience.map((e, i) => (
              <motion.li
                key={e.title}
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative pl-12 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
              >
                <span
                  className={`absolute top-2 left-[7px] size-3 rounded-full bg-accent ring-4 ring-bg ${i % 2 ? "md:-left-1.5" : "md:right-[-6px] md:left-auto"}`}
                  aria-hidden
                />
                <p className="font-mono text-sm text-accent">{e.year}</p>
                <h3 className="mt-1 font-display text-2xl">{e.title}</h3>
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:underline">{e.org}</a>
                ) : (
                  <p className="text-muted">{e.org}</p>
                )}
                <p className="mt-3 text-muted">{e.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
