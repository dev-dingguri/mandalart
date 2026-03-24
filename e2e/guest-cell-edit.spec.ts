import { test, expect } from '@playwright/test';

test.describe('Guest mode — Cell editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/app');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ko/app');
    await page.waitForSelector('[data-cell]');
  });

  test('clicking a cell opens popover input', async ({ page }) => {
    const firstCell = page.locator('[data-cell]').first();
    await firstCell.click();

    // Popover content should appear (contains an input)
    const input = page.locator('[data-radix-popper-content-wrapper] input');
    await expect(input).toBeVisible({ timeout: 3000 });
  });

  test('typing in cell input updates cell text', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    const targetCell = cells.first();
    await targetCell.click();

    // Type text into the popover input
    const input = page.locator('[data-radix-popper-content-wrapper] input');
    await input.fill('My Goal');

    // Close by pressing Escape — triggers onSaveAndClose via useCellInput's keydown handler
    await page.keyboard.press('Escape');

    // Cell text should now show "My Goal"
    await expect(targetCell).toContainText('My Goal');
  });

  test('edited text persists after page reload', async ({ page }) => {
    // Edit a cell
    const cells = page.locator('[data-cell]');
    await cells.first().click();

    const input = page.locator('[data-radix-popper-content-wrapper] input');
    await input.fill('Persistent Text');

    // Close input
    await page.keyboard.press('Escape');
    await expect(cells.first()).toContainText('Persistent Text');

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-cell]');

    // Text should persist from localStorage
    await expect(page.locator('[data-cell]').first()).toContainText(
      'Persistent Text',
    );
  });

  test('localStorage contains guest data after editing', async ({ page }) => {
    // Edit a cell
    await page.locator('[data-cell]').first().click();
    const input = page.locator('[data-radix-popper-content-wrapper] input');
    await input.fill('Storage Check');

    // Close and verify localStorage
    await page.keyboard.press('Escape');

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('mandalarts__topictrees');
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.version).toBe(1);
    // At least one topic tree should have "Storage Check" somewhere in serialized data
    const serialized = JSON.stringify(stored.data);
    expect(serialized).toContain('Storage Check');
  });
});
