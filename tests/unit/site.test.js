import { describe, expect, test } from "bun:test";
import { site, getProject, getNextProject } from "@/content/site";

describe("content/site", () => {
  test("every project has a unique slug and required fields", () => {
    const slugs = site.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of site.projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.image.startsWith("/")).toBe(true);
      expect(Array.isArray(p.tech)).toBe(true);
      expect(Array.isArray(p.highlights)).toBe(true);
    }
  });

  test("getProject finds by slug and returns undefined for unknown", () => {
    expect(getProject("finguru").title).toContain("FinGuru");
    expect(getProject("nope")).toBeUndefined();
  });

  test("getNextProject wraps around", () => {
    const last = site.projects.at(-1).slug;
    expect(getNextProject(last).slug).toBe(site.projects[0].slug);
  });
});
