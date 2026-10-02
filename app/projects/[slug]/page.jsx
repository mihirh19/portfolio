import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import SceneOverride from "@/components/scene/SceneOverride";
import TechIcon from "@/components/ui/TechIcon";
import { getNextProject, getProject, site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(slug);

  return (
    <article className="mx-auto max-w-6xl px-6 pt-32 pb-24 md:px-12">
      <SceneOverride shape="orb" dimmed />
      <Link href="/#projects" className="font-mono text-sm text-muted hover:text-fg">← All work</Link>
      <h1 className="mt-6 font-display text-5xl leading-none font-semibold tracking-tight md:text-8xl">{project.title}</h1>
      <p className="mt-6 max-w-2xl text-xl text-muted">{project.summary}</p>

      <div
        className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-card"
        style={{ viewTransitionName: `project-${project.slug}` }}
      >
        <Image src={project.image} alt={`${project.title} screenshot`} fill priority unoptimized={project.image.endsWith(".svg")} sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="eyebrow">Tech</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t} className="chip inline-flex items-center gap-2 py-1.5 text-sm">
                <TechIcon name={t} size={18} />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={project.repo} target="_blank" rel="noreferrer" className="btn-primary">View on GitHub ↗</a>
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="btn-ghost">Live demo ↗</a>
            )}
          </div>
        </div>
        <div>
          <h2 className="eyebrow">Highlights</h2>
          <ul className="mt-4 space-y-4 text-lg">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span className="text-accent">✦</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link href={`/projects/${next.slug}`} className="group mt-24 block border-t border-line pt-10">
        <span className="eyebrow">Next project</span>
        <span className="mt-3 block font-display text-4xl transition-colors group-hover:text-accent md:text-6xl">{next.title} →</span>
      </Link>
    </article>
  );
}
