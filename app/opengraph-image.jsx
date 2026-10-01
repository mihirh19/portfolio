import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — AI/ML & Full-stack Developer`;

export default function OpengraphImage() {
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
          background: "radial-gradient(circle at 70% 30%, #2a1f66 0%, #05060a 60%)",
          color: "#e8eaf2",
        }}
      >
        <div style={{ fontSize: 28, color: "#8a90a6", letterSpacing: 6 }}>PORTFOLIO</div>
        <div style={{ fontSize: 104, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 40, color: "#22d3ee" }}>AI/ML · Full-stack Developer</div>
      </div>
    ),
    size,
  );
}
