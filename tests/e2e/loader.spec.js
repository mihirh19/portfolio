import { test, expect } from "@playwright/test";

test("intro loader plays once per session", async ({ page }) => {
  await page.goto("/");
  const loader = page.getByTestId("intro-loader");
  await expect(loader).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 6000 });
  await page.reload();
  await expect(loader).toBeHidden();
});
