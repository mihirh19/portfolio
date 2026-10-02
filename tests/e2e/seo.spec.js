import { test, expect } from "@playwright/test";

test("sitemap lists home and projects", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  expect(xml).toContain("/projects/finguru");
});

test("robots and OG image are served", async ({ request }) => {
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const og = await request.get("/opengraph-image");
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("project OG image renders", async ({ request }) => {
  const og = await request.get("/projects/finguru/opengraph-image");
  expect(og.ok()).toBe(true);
  expect(og.headers()["content-type"]).toContain("image/png");
});
