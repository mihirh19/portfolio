import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
});

test("project page renders details and next link", async ({ page }) => {
  await page.goto("/projects/finguru");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FinGuru");
  await expect(page.getByRole("link", { name: /View on GitHub/ })).toHaveAttribute("href", /github\.com/);
  await expect(page.getByRole("link", { name: /Next project/ })).toHaveAttribute("href", "/projects/cashcraft");
});

test("unknown project returns 404", async ({ page }) => {
  const res = await page.goto("/projects/does-not-exist");
  expect(res.status()).toBe(404);
  await expect(page.getByText("Lost in the cosmos")).toBeVisible();
});

test.describe("card navigation", () => {
  // Reduced motion removes Lenis + the pinned rail, so the card isn't moving under the click.
  test.use({ reducedMotion: "reduce" });

  test("clicking a project card navigates to its page", async ({ page }) => {
    await page.goto("/");
    await page.locator('#projects a[href="/projects/cashcraft"]').click();
    await expect(page).toHaveURL(/\/projects\/cashcraft$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("CashCraft");
  });
});
