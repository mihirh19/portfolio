import { site } from "@/content/site";

export default function sitemap() {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    ...site.projects.map((p) => ({ url: `${site.url}/projects/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
