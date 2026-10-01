import SpotlightCard from "@/components/ui/SpotlightCard";
import Marquee from "@/components/ui/Marquee";
import { site } from "@/content/site";

const spans = ["md:col-span-2", "", "", "md:col-span-2"];

export default function Skills() {
  return (
    <section id="skills" data-section data-scene="rings" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <p className="eyebrow">02 — Toolkit</p>
        <h2 className="section-title">What I work with</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {site.skills.map((s, i) => (
            <SpotlightCard key={s.group} className={`p-8 ${spans[i] ?? ""}`}>
              <h3 className="font-mono text-sm tracking-widest text-accent uppercase">{s.group}</h3>
              <ul className="mt-6 flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <li key={item} className="rounded-full border border-line px-4 py-2 text-sm">{item}</li>
                ))}
              </ul>
            </SpotlightCard>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <Marquee items={site.skills.flatMap((s) => s.items)} />
      </div>
    </section>
  );
}
