import { describe, expect, test } from "bun:test";
import { techIcon } from "@/lib/tech-icons";
import { site } from "@/content/site";

// Names with no published logo; these render the letter-badge fallback on purpose.
const NO_LOGO = new Set(["Generative AI", "News API"]);

describe("techIcon", () => {
  test("every skill and project tech has an icon (or is a known no-logo name)", () => {
    const names = new Set([...site.skills.flatMap((s) => s.items), ...site.projects.flatMap((p) => p.tech)]);
    const missing = [...names].filter((n) => !NO_LOGO.has(n) && !techIcon(n));
    expect(missing).toEqual([]);
  });

  test("returns src + mono flag, and null for unknown names", () => {
    expect(techIcon("React")).toEqual({ src: "https://techstack-generator.vercel.app/react-icon.svg", mono: false, scale: 1.3 });
    expect(techIcon("Next.js")).toEqual({ src: "https://cdn.simpleicons.org/nextdotjs", mono: true, scale: 1 });
    expect(techIcon("Klingon")).toBeNull();
  });
});
