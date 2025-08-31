import { test, expect } from "@playwright/test";

test("student portal loads and shows form", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: /college application smart portal/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /next/i })).toBeVisible();
});
