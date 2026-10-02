import { test, expect } from "@playwright/test";

test("intro loader plays once per session", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const loader = page.getByTestId("intro-loader");
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden();
  await page.reload();
  await expect(loader).toBeHidden();
});
