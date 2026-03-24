import { test, expect } from '@playwright/test';

test.describe('Guest mode — View toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/app');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ko/app');
    await page.waitForSelector('[data-cell]');
  });

  test('defaults to All View (focus view not present)', async ({ page }) => {
    await expect(page.getByTestId('mandalart-focus-view')).toHaveCount(0);
    // Toggle button should not be pressed (aria-pressed=false)
    const toggle = page.getByTestId('view-toggle');
    await expect(toggle).toHaveAttribute('data-state', 'off');
  });

  test('toggles to Focus View on click', async ({ page }) => {
    const toggle = page.getByTestId('view-toggle');
    await toggle.click();

    // Focus view container should appear
    await expect(page.getByTestId('mandalart-focus-view')).toBeVisible();
    // Toggle should show pressed state
    await expect(toggle).toHaveAttribute('data-state', 'on');
  });

  test('Focus View container is square and clips overflow', async ({ page }) => {
    const toggle = page.getByTestId('view-toggle');
    await toggle.click();

    const focusView = page.getByTestId('mandalart-focus-view');
    await expect(focusView).toBeVisible();

    const box = await focusView.boundingBox();
    expect(box).not.toBeNull();
    // Focus view uses aspect-square — should be roughly square
    const ratio = box!.width / box!.height;
    expect(ratio).toBeGreaterThan(0.9);
    expect(ratio).toBeLessThan(1.1);

    // CSS overflow:hidden means computed overflow should be 'hidden'
    const overflow = await focusView.evaluate(
      (el) => getComputedStyle(el).overflow,
    );
    expect(overflow).toBe('hidden');
  });

  test('toggling back restores All View', async ({ page }) => {
    const toggle = page.getByTestId('view-toggle');

    // Toggle to Focus → back to All
    await toggle.click();
    await expect(page.getByTestId('mandalart-focus-view')).toBeVisible();

    await toggle.click();
    await expect(page.getByTestId('mandalart-focus-view')).toHaveCount(0);
    await expect(toggle).toHaveAttribute('data-state', 'off');

    // All 81 cells should still exist
    await expect(page.locator('[data-cell]')).toHaveCount(81);
  });

  test('all 81 cells exist in Focus View (rendered off-screen)', async ({
    page,
  }) => {
    const toggle = page.getByTestId('view-toggle');
    await toggle.click();

    // All 81 cells still rendered (FocusView renders full Mandalart at 240% scale)
    await expect(page.locator('[data-cell]')).toHaveCount(81);
  });
});
