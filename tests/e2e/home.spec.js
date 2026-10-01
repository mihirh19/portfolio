import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
});

test("home renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
