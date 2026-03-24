import { test, expect } from '@playwright/test';

// Mobile viewport — below 48rem (768px) breakpoint triggers BottomInputBar instead of Popover
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Guest mode — Mobile viewport', () => {
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

  test('renders 81 cells on mobile viewport', async ({ page }) => {
    await expect(page.locator('[data-cell]')).toHaveCount(81);
  });

  test('clicking cell shows BottomInputBar (not Popover)', async ({ page }) => {
    await page.locator('[data-cell]').first().click();

    // BottomInputBar should appear (has data-bottom-input attribute)
    const bottomBar = page.locator('[data-bottom-input]');
    await expect(bottomBar).toBeVisible();

    // Popover should NOT appear on mobile
    await expect(
      page.locator('[data-radix-popper-content-wrapper]'),
    ).toHaveCount(0);

    // BottomInputBar contains an input
    await expect(bottomBar.locator('input')).toBeVisible();
  });

  test('cell editing works via BottomInputBar', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.first().click();

    const input = page.locator('[data-bottom-input] input');
    await input.fill('Mobile Edit');

    await page.keyboard.press('Escape');

    await expect(cells.first()).toContainText('Mobile Edit');
  });

  test('BottomInputBar navigation buttons work', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    await cells.first().click();

    const input = page.locator('[data-bottom-input] input');
    await input.fill('Cell A');

    // Click next button via aria-label — saves current cell and moves to next
    await page.locator('[data-bottom-input]').getByLabel('다음 셀').click();

    await expect(input).toHaveValue('');
    await input.fill('Cell B');
    await page.keyboard.press('Escape');

    await expect(cells.first()).toContainText('Cell A');
  });

  test('view toggle works on mobile', async ({ page }) => {
    const toggle = page.getByTestId('view-toggle');
    await toggle.click();

    await expect(page.getByTestId('mandalart-focus-view')).toBeVisible();
    await expect(page.locator('[data-cell]')).toHaveCount(81);
  });

  test('edited text persists on mobile after reload', async ({ page }) => {
    await page.locator('[data-cell]').first().click();

    const input = page.locator('[data-bottom-input] input');
    await input.fill('Mobile Persist');
    await page.keyboard.press('Escape');

    await page.reload();
    await page.waitForSelector('[data-cell]');

    await expect(page.locator('[data-cell]').first()).toContainText(
      'Mobile Persist',
    );
  });
});
