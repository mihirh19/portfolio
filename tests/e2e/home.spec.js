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

test("projects rail lists every project with a detail link", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('#projects a[href^="/projects/"]');
  await expect(links).toHaveCount(8);
  await expect(links.first()).toHaveAttribute("href", "/projects/finguru");
});

test("experience timeline lists entries", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experience ol > li")).toHaveCount(4);
});

test("contact form shows server validation errors", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByLabel("Your name").fill("A");
  await page.getByLabel("Email").fill("bad");
  await page.getByLabel("Message").fill("short");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();
  await expect(page.getByText("Please enter your name")).toBeVisible();
});

test("Ctrl+K palette jumps to a section", async ({ page }) => {
  await page.goto("/");
  // The theme toggle icon renders only after mount, so it signals hydration is done.
  await expect(page.getByRole("button", { name: /Switch to/ }).locator("svg")).toBeVisible();
  await page.keyboard.press("Control+KeyK");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.type("Journey");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#experience")).toBeInViewport();
});
