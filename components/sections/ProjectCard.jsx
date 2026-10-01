import Image from "next/image";
import { Link } from "next-view-transitions";

export default function ProjectCard({ project, index }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-cursor="view"
      className="group block w-[80vw] shrink-0 snap-start md:w-[42vw] lg:w-[36vw]"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-card"
        style={{ viewTransitionName: `project-${project.slug}` }}
      >
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          sizes="(min-width: 1024px) 36vw, (min-width: 768px) 42vw, 80vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl">{project.title}</h3>
        <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.slice(0, 4).map((t) => (
          <li key={t} className="chip">{t}</li>
        ))}
      </ul>
    </Link>
  );
}
