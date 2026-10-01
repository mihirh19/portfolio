"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import ThemeToggle from "./ThemeToggle";
import { scrollToSection } from "@/lib/scroll";
import { openCommandPalette } from "@/lib/command-palette-events";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Journey" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 120);
  });

  useEffect(() => {
    if (!isHome) return setActive(null);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const onNav = (e, id) => {
    if (isHome && scrollToSection(lenis, id)) e.preventDefault();
  };

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav aria-label="Primary" className="glass flex items-center gap-1 rounded-full px-2 py-1.5 shadow-lg shadow-black/5">
        <Link href="/" className="rounded-full px-3 py-1.5 font-display font-semibold">
          {site.name.split(" ")[0]}
          <span className="text-accent">.</span>
        </Link>
        <ul className="hidden items-center md:flex">
          {NAV_SECTIONS.map(({ id, label }) => (
            <li key={id} className="relative">
              <a
                href={isHome ? `#${id}` : `/#${id}`}
                onClick={(e) => onNav(e, id)}
                aria-current={active === id ? "true" : undefined}
                className={cn("relative z-10 block rounded-full px-3 py-1.5 text-sm transition-colors", active === id ? "text-bg" : "text-muted hover:text-fg")}
              >
                {label}
              </a>
              {active === id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 35 }} />
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={openCommandPalette}
          className="ml-1 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted hover:text-fg"
          aria-label="Open command menu"
        >
          <span className="md:hidden">Menu</span>
          <kbd className="hidden rounded border border-line px-1.5 font-mono text-xs md:inline">Ctrl K</kbd>
        </button>
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}
