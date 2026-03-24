import { test, expect, Page } from '@playwright/test';

// Radix Popover 내부 속성에 의존 — Radix 메이저 업데이트 시 이 한 줄만 수정
const popoverInput = (page: Page) =>
  page.locator('[data-radix-popper-content-wrapper] input');

test.describe('Guest mode — Cell navigation', () => {
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

  test('center cell (root goal) is at DOM index 40', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    // Center = gridIdx=4, gridItemIdx=4 → DOM position 4*9+4 = 40
    const centerCell = cells.nth(40);
    await centerCell.click();

    await popoverInput(page).fill('Root Goal');
    await page.keyboard.press('Escape');

    await expect(centerCell).toContainText('Root Goal');
  });

  test('Tab moves to next cell and saves current text', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    const centerCell = cells.nth(40); // G4-C4
    await centerCell.click();

    const input = popoverInput(page);
    await input.fill('Center');
    await page.keyboard.press('Tab');

    // Center cell should now show saved text
    await expect(centerCell).toContainText('Center');

    // Input should be cleared (new cell is empty)
    await expect(input).toHaveValue('');
  });

  test('Enter moves to next cell (same as Tab)', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.nth(40).click();

    const input = popoverInput(page);
    await input.fill('Via Enter');
    await page.keyboard.press('Enter');

    await expect(cells.nth(40)).toContainText('Via Enter');
    await expect(input).toHaveValue('');
  });

  test('Shift+Tab moves to previous cell', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.nth(40).click();

    const input = popoverInput(page);

    // Move forward to next cell first
    await input.fill('First');
    await page.keyboard.press('Tab');

    // Now type in second cell and go back
    await input.fill('Second');
    await page.keyboard.press('Shift+Tab');

    // Should be back at center cell — input shows "First"
    await expect(input).toHaveValue('First');
  });

  test('ArrowDown moves to cell below in same group', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    // G4-C4 (center) is at row=1, col=1 in the 3×3 inner grid
    // ArrowDown → row=2, col=1 → gridItemIdx=7 → DOM position 4*9+7 = 43
    await cells.nth(40).click();

    const input = popoverInput(page);
    await input.fill('Above');
    await page.keyboard.press('ArrowDown');

    await expect(cells.nth(40)).toContainText('Above');
    // New cell (G4-C7) should be empty
    await expect(input).toHaveValue('');
  });

  test('ArrowUp moves to cell above in same group', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    // G4-C4 at row=1, col=1 → ArrowUp → row=0, col=1 → gridItemIdx=1 → DOM 4*9+1 = 37
    await cells.nth(40).click();

    const input = popoverInput(page);
    await input.fill('Below');
    await page.keyboard.press('ArrowUp');

    await expect(cells.nth(40)).toContainText('Below');
    await expect(input).toHaveValue('');
  });

  test('sequential Tab fills multiple cells', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.nth(40).click();

    const input = popoverInput(page);

    // Fill 3 consecutive cells via Tab
    await input.fill('Goal 1');
    await page.keyboard.press('Tab');

    await input.fill('Goal 2');
    await page.keyboard.press('Tab');

    await input.fill('Goal 3');
    await page.keyboard.press('Escape');

    // Center cell (G4-C4, DOM 40) should have "Goal 1"
    await expect(cells.nth(40)).toContainText('Goal 1');

    // Next cell in nav order (G4-C0, DOM 36) should have "Goal 2"
    await expect(cells.nth(36)).toContainText('Goal 2');

    // Next (G4-C1, DOM 37) should have "Goal 3"
    await expect(cells.nth(37)).toContainText('Goal 3');
  });
});
