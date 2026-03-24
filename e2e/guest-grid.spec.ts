import { test, expect } from '@playwright/test';

test.describe('Guest mode — Grid structure', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh guest session
    await page.goto('/ko/app');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ko/app');
    await page.waitForSelector('[data-cell]');
  });

  test('renders 81 cells (9×9 grid)', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await expect(cells).toHaveCount(81);
  });

  test('grid container is approximately square', async ({ page }) => {
    const container = page.getByTestId('mandalart-container');
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    // Allow 15% tolerance — CSS variables and gap can cause minor deviation
    const ratio = box!.width / box!.height;
    expect(ratio).toBeGreaterThan(0.85);
    expect(ratio).toBeLessThan(1.15);
  });

  test('individual cells maintain square aspect-ratio', async ({ page }) => {
    // Sample 5 cells across different grid positions
    const cells = page.locator('[data-cell]');
    const indices = [0, 20, 40, 60, 80];

    for (const i of indices) {
      const box = await cells.nth(i).boundingBox();
      expect(box, `cell[${i}] should be visible`).not.toBeNull();
      const ratio = box!.width / box!.height;
      expect(ratio, `cell[${i}] aspect ratio`).toBeGreaterThan(0.9);
      expect(ratio, `cell[${i}] aspect ratio`).toBeLessThan(1.1);
    }
  });

  test('grid fills expected viewport width', async ({ page }) => {
    const container = page.getByTestId('mandalart-container');
    const box = await container.boundingBox();
    const viewport = page.viewportSize()!;
    // CSS: w-[var(--size-content-width)] = 90vw on narrow / min(90vw,80dvh) on wider
    // Grid should occupy a meaningful portion of viewport
    expect(box!.width).toBeGreaterThan(viewport.width * 0.3);
  });
});
