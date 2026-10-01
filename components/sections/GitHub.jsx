import SpotlightCard from "@/components/ui/SpotlightCard";
import CountUp from "@/components/ui/CountUp";
import { getLatestRepos, languageColor } from "@/lib/github";
import { site } from "@/content/site";

export default async function GitHub() {
  const repos = await getLatestRepos({ username: site.githubUsername, token: process.env.GITHUB_AUTH_TOKEN });
  if (!repos.length) return null;

  const stars = repos.reduce((sum, r) => sum + r.stars, 0);
  const languages = new Set(repos.map((r) => r.language).filter(Boolean)).size;
  const stats = [
    { label: "Recent repos", value: repos.length },
    { label: "Stars", value: stars },
    { label: "Languages", value: languages },
  ];

  return (
    <section id="github" data-section data-scene="galaxy" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">05 — Latest code</p>
            <h2 className="section-title">Fresh from GitHub</h2>
          </div>
          <dl className="flex gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-mono text-xs text-muted uppercase">{s.label}</dt>
                <dd className="font-display text-4xl"><CountUp to={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((r) => (
            <li key={r.id}>
              <SpotlightCard as="a" href={r.url} target="_blank" rel="noreferrer" className="flex h-full flex-col p-6">
                <h3 className="font-display text-xl">{r.name}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{r.description ?? "No description yet."}</p>
                <div className="mt-6 flex items-center gap-4 font-mono text-xs text-muted">
                  {r.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: languageColor(r.language) }} />
                      {r.language}
                    </span>
                  )}
                  <span>★ {r.stars}</span>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
