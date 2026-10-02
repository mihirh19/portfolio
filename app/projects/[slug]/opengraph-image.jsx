import { ImageResponse } from "next/og";
import { getProject, site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return site.projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectOgImage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "radial-gradient(circle at 30% 30%, #1d3b4f 0%, #05060a 65%)",
          color: "#e8eaf2",
        }}
      >
        <div style={{ fontSize: 28, color: "#8a90a6", letterSpacing: 6 }}>{`${site.name.toUpperCase()} · PROJECT`}</div>
        <div style={{ fontSize: 88, fontWeight: 700 }}>{project?.title ?? "Project"}</div>
        <div style={{ fontSize: 34, color: "#7c5cff" }}>{project?.tech.join(" · ")}</div>
      </div>
    ),
    size,
  );
}
