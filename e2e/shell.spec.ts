import { expect, test } from "@playwright/test";

test.describe("public shell", () => {
  test("home page renders with landmarks and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/Formivo/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("security headers are set", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });

  test("unknown routes return 404", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

test.describe("application shells", () => {
  test("developer shell marks the current nav item", async ({ page, isMobile }) => {
    await page.goto("/forms");
    await expect(page.getByRole("heading", { level: 1, name: "Forms" })).toBeVisible();
    if (isMobile) await page.getByRole("button", { name: "Open Developer" }).click();
    const nav = page.getByRole("navigation", { name: "Developer" });
    await expect(nav.getByRole("link", { name: "Forms" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("Form management is not available yet")).toBeVisible();
  });

  test("client shell renders", async ({ page }) => {
    await page.goto("/client");
    await expect(page.getByRole("heading", { level: 1, name: "Shared forms" })).toBeVisible();
  });

  test("auth pages do not collect credentials", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Authentication is not available yet")).toBeVisible();
    await expect(page.locator("input")).toHaveCount(0);
  });
});

test("mobile menu opens, navigates, and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open main menu" });
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close main menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open main menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await toggle.click();
  await page
    .getByRole("navigation", { name: "main menu" })
    .getByRole("link", { name: "Pricing" })
    .click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { level: 1, name: "Pricing" })).toBeVisible();
});
