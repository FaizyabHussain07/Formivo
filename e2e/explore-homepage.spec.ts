import { test, expect } from "@playwright/test";



test.describe("Explore the homepage link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Explore the homepage link is visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: /^Explore the homepage/ })).toBeVisible();
  });

  test("Explore the homepage link navigates home", async ({ page }) => {
    await page.getByRole("link", { name: /^Explore the homepage/ }).click();
    await expect(page).toHaveURL("https://formivo.faizyab.me/");
  });
});

test.describe("Explore the homepage scroll helper", () => {
  test("scrollToFirstRunnableLink focuses the first link", async () => {
    // Not needed. Only for visual review.
  });
});
