import Magnetic from "@/components/ui/Magnetic";
import SplitReveal from "@/components/ui/SplitReveal";
import RotatingWords from "@/components/ui/RotatingWords";
import { site } from "@/content/site";

export default function Hero() {
  return (
    <section id="hero" data-section data-scene="brain" className="relative flex min-h-svh flex-col justify-center px-6 pt-24 md:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow">{site.name} — {site.location}</p>
        <h1 className="mt-6 font-display text-[clamp(3.2rem,11vw,10rem)] leading-[0.9] font-semibold tracking-tight">
          <SplitReveal className="block">Developer.</SplitReveal>
          <SplitReveal className="block text-accent" delay={0.15}>
            Explorer.
          </SplitReveal>
          <SplitReveal className="block" delay={0.3}>Gamer.</SplitReveal>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted md:text-xl">
          I&apos;m <RotatingWords words={site.roles} className="font-medium text-fg" />, building products at the
          intersection of AI and the web.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Magnetic>
            <a href="#projects" className="btn-primary">View work</a>
          </Magnetic>
          <Magnetic>
            <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost">Resume ↗</a>
          </Magnetic>
        </div>
      </div>
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">Scroll ↓</p>
    </section>
  );
}
