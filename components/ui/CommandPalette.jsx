"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import { NAV_SECTIONS } from "./Nav";
import { OPEN_COMMAND_PALETTE } from "@/lib/command-palette-events";
import { scrollToSection } from "@/lib/scroll";
import { site } from "@/content/site";

const itemClass =
  "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-fg data-[selected=true]:text-bg";
const groupClass = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  const goToSection = (id) => {
    if (pathname === "/") scrollToSection(lenis, id);
    else router.push(`/#${id}`);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
      contentClassName="fixed top-[20vh] left-1/2 z-[120] w-[min(92vw,560px)] -translate-x-1/2 glass bg-bg/90 p-2 shadow-2xl"
    >
      <Command.Input
        placeholder="Jump to, open, toggle…"
        className="w-full border-b border-line bg-transparent px-3 py-3 text-base outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[50vh] overflow-y-auto p-1">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">No results.</Command.Empty>
        <Command.Group heading="Navigate" className={groupClass}>
          {[{ id: "hero", label: "Home" }, ...NAV_SECTIONS].map((s) => (
            <Command.Item key={s.id} value={`go ${s.label}`} onSelect={run(() => goToSection(s.id))} className={itemClass}>
              {s.label}
              <span className="font-mono text-xs opacity-60">section</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className={groupClass}>
          {site.projects.map((p) => (
            <Command.Item key={p.slug} value={`project ${p.title}`} onSelect={run(() => router.push(`/projects/${p.slug}`))} className={itemClass}>
              {p.title}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Links" className={groupClass}>
          {[...site.socials, { label: "Resume", href: site.resumeUrl }].map((s) => (
            <Command.Item key={s.label} value={`open ${s.label}`} onSelect={run(() => window.open(s.href, "_blank", "noopener"))} className={itemClass}>
              {s.label}
              <span className="opacity-60">↗</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Actions" className={groupClass}>
          <Command.Item value="toggle theme" onSelect={run(() => setTheme(resolvedTheme === "light" ? "dark" : "light"))} className={itemClass}>
            Toggle theme
          </Command.Item>
          <Command.Item value="copy email" onSelect={run(() => navigator.clipboard?.writeText(site.email))} className={itemClass}>
            Copy email
            <span className="font-mono text-xs opacity-60">{site.email}</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
