import { test, expect } from "@playwright/test";

test("faculty portal shows applications table", async ({ page }) => {
  await page.goto("/faculty");
  await expect(page.getByRole("heading", { name: /faculty application review portal/i })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});
