import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("content is fully visible without animation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("intro-loader")).toBeHidden();
    await expect(page.locator("#about [data-word]").first()).toHaveCSS("opacity", "1");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await expect(page.locator('#projects a[href="/projects/finguru"]')).toBeVisible();
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("no horizontal page overflow and menu opens palette", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Open command menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test("skip link targets main", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
