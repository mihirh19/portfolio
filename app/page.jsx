import { site } from "@/content/site";

export default function Home() {
  return (
    <section id="hero" data-scene="brain" className="flex min-h-svh items-center px-6">
      <h1 className="font-display text-7xl">{site.name}</h1>
    </section>
  );
}
