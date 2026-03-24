import { test, expect, Page } from '@playwright/test';

// Radix Popover 내부 속성에 의존 — Radix 메이저 업데이트 시 이 한 줄만 수정
const popoverInput = (page: Page) =>
  page.locator('[data-radix-popper-content-wrapper] input');

test.describe('Guest mode — Cell editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/app');
    await page.evaluate(() => {
      localStorage.removeItem('mandalarts__snippets');
      localStorage.removeItem('mandalarts__topictrees');
      localStorage.removeItem('last_selected_mandalart_id');
    });
    await page.goto('/ko/app');
    await page.waitForSelector('[data-cell]');
  });

  test('clicking a cell opens popover input', async ({ page }) => {
    const firstCell = page.locator('[data-cell]').first();
    await firstCell.click();

    await expect(popoverInput(page)).toBeVisible({ timeout: 3000 });
  });

  test('typing in cell input updates cell text', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    const targetCell = cells.first();
    await targetCell.click();

    await popoverInput(page).fill('My Goal');

    // Close by pressing Escape — triggers onSaveAndClose via useCellInput's keydown handler
    await page.keyboard.press('Escape');

    await expect(targetCell).toContainText('My Goal');
  });

  test('edited text persists after page reload', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.first().click();

    await popoverInput(page).fill('Persistent Text');

    await page.keyboard.press('Escape');
    await expect(cells.first()).toContainText('Persistent Text');

    await page.reload();
    await page.waitForSelector('[data-cell]');

    await expect(page.locator('[data-cell]').first()).toContainText(
      'Persistent Text',
    );
  });

  test('localStorage contains guest data after editing', async ({ page }) => {
    await page.locator('[data-cell]').first().click();
    await popoverInput(page).fill('Storage Check');

    await page.keyboard.press('Escape');

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('mandalarts__topictrees');
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.version).toBe(1);
    const serialized = JSON.stringify(stored.data);
    expect(serialized).toContain('Storage Check');
  });
});
