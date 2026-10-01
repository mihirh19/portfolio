import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
});

test("home renders hero and about", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Developer.");
  await expect(page.locator("#about")).toBeAttached();
  await expect(page.locator("#about [data-word]").first()).toBeAttached();
});

test("theme toggle switches the html class", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(html).toHaveClass(/light/);
});
