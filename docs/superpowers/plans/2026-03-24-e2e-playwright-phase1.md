# E2E Testing with Playwright — Phase 1 (Guest Mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Playwright E2E testing infrastructure and write Phase 1 tests covering guest mode — grid size validation, view toggle (All ↔ Focus), cell editing, and localStorage persistence.

**Architecture:** Playwright runs against the Vite dev server (`localhost:3000`). Tests target the guest mode path (`/{lang}/app` without login) which uses `localStorage` instead of Firebase. Minimal `data-testid` attributes are added to components — prefer existing accessible selectors (`[data-cell]`, `aria-label`, roles) where possible.

**Tech Stack:** Playwright, Vite dev server, TypeScript

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `playwright.config.ts` | Playwright configuration — base URL, web server, projects |
| Create | `e2e/guest-grid.spec.ts` | Grid structure and size validation tests |
| Create | `e2e/guest-view-toggle.spec.ts` | All View ↔ Focus View toggle tests |
| Create | `e2e/guest-cell-edit.spec.ts` | Cell editing and localStorage persistence tests |
| Modify | `src/components/MandalartView.tsx` | Add `data-testid` to grid container div |
| Modify | `src/components/MandalartFocusView.tsx` | Add `data-testid` to focus view container |
| Modify | `src/components/MandalartViewToggle.tsx` | Add `data-testid` to toggle button |
| Modify | `package.json` | Add `test:e2e` script |
| Modify | `.gitignore` | Add Playwright artifacts |

---

### Task 1: Install Playwright and configure

**Files:**
- Create: `playwright.config.ts`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Add scripts and gitignore entries**

In `package.json` scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

In `.gitignore`:
```
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 4: Verify Playwright runs (empty test dir)**

```bash
pnpm test:e2e
```

Expected: "No tests found" or similar — confirms setup works.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts package.json pnpm-lock.yaml .gitignore
git commit -m "chore: add Playwright E2E test infrastructure"
```

---

### Task 2: Add minimal data-testid attributes to components

**Files:**
- Modify: `src/components/MandalartView.tsx:357` (grid container div)
- Modify: `src/components/MandalartFocusView.tsx:42` (focus container div)
- Modify: `src/components/MandalartViewToggle.tsx:17` (Toggle)

- [ ] **Step 1: Add data-testid to MandalartView grid container**

In `MandalartView.tsx`, the `<div className="mb-2 mt-3">` at line 357:

```tsx
<div className="mb-2 mt-3" data-testid="mandalart-container">
```

- [ ] **Step 2: Add data-testid to MandalartFocusView container**

In `MandalartFocusView.tsx`, the outer div at line 42:

```tsx
<div
  ref={containerRef}
  tabIndex={-1}
  className="aspect-square w-full overflow-hidden outline-none"
  data-testid="mandalart-focus-view"
  {...touchHandlers}
  {...keyboardHandlers}
>
```

- [ ] **Step 3: Add data-testid to MandalartViewToggle**

In `MandalartViewToggle.tsx`, the Toggle at line 17:

```tsx
<Toggle
  data-testid="view-toggle"
  variant="outline"
  ...
>
```

- [ ] **Step 4: Run existing unit tests to verify no regressions**

```bash
pnpm test
```

Expected: All 7 existing test files pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/MandalartView.tsx src/components/MandalartFocusView.tsx src/components/MandalartViewToggle.tsx
git commit -m "test: add data-testid attributes for E2E selectors"
```

---

### Task 3: E2E — Grid structure and size validation

**Files:**
- Create: `e2e/guest-grid.spec.ts`

These tests verify the mandalart renders correctly in guest mode:
- Correct number of cells (81 = 9 groups × 9 items)
- Grid container is approximately square (aspect-ratio)
- Individual cells maintain aspect-ratio (width ≈ height)

- [ ] **Step 1: Write grid structure test**

```typescript
// e2e/guest-grid.spec.ts
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
```

- [ ] **Step 2: Run the test**

```bash
pnpm test:e2e e2e/guest-grid.spec.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/guest-grid.spec.ts
git commit -m "test(e2e): add guest mode grid structure and size validation"
```

---

### Task 4: E2E — All View ↔ Focus View toggle

**Files:**
- Create: `e2e/guest-view-toggle.spec.ts`

Tests the view mode toggle behavior:
- Default state is All View
- Toggle switches to Focus View (only 1 group visible in viewport)
- Toggle back returns to All View
- Focus View container exists only when toggled

- [ ] **Step 1: Write view toggle tests**

```typescript
// e2e/guest-view-toggle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest mode — View toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/app');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ko/app');
    await page.waitForSelector('[data-cell]');
  });

  test('defaults to All View (focus view not present)', async ({ page }) => {
    await expect(page.getByTestId('mandalart-focus-view')).not.toBeVisible();
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
    await expect(page.getByTestId('mandalart-focus-view')).not.toBeVisible();
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
```

- [ ] **Step 2: Run the test**

```bash
pnpm test:e2e e2e/guest-view-toggle.spec.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/guest-view-toggle.spec.ts
git commit -m "test(e2e): add All View ↔ Focus View toggle tests"
```

---

### Task 5: E2E — Cell editing and localStorage persistence

**Files:**
- Create: `e2e/guest-cell-edit.spec.ts`

Tests cell editing in desktop mode (Popover-based input):
- Clicking a cell opens the input UI
- Typing text and closing saves to the cell
- Data persists in localStorage across page reloads

Note: Playwright's default `Desktop Chrome` device has a wide viewport (1280×720) which satisfies the `min-width: 48rem` breakpoint — tests will exercise the desktop Popover path, not the mobile BottomInputBar.

- [ ] **Step 1: Write cell editing tests**

```typescript
// e2e/guest-cell-edit.spec.ts
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
    const input = page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input');
    await expect(input).toBeVisible({ timeout: 3000 });
  });

  test('typing in cell input updates cell text', async ({ page }) => {
    const cells = page.locator('[data-cell]');
    const targetCell = cells.first();
    await targetCell.click();

    // Type text into the popover input
    const input = page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input');
    await input.fill('My Goal');

    // Close by clicking outside (on the grid container)
    await page.getByTestId('mandalart-container').click({ position: { x: 1, y: 1 } });

    // Cell text should now show "My Goal"
    await expect(targetCell).toContainText('My Goal');
  });

  test('edited text persists after page reload', async ({ page }) => {
    // Edit a cell
    const cells = page.locator('[data-cell]');
    await cells.first().click();

    const input = page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input');
    await input.fill('Persistent Text');

    // Close input
    await page.getByTestId('mandalart-container').click({ position: { x: 1, y: 1 } });
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
    const input = page.locator('[role="dialog"] input, [data-radix-popper-content-wrapper] input');
    await input.fill('Storage Check');

    // Close and verify localStorage
    await page.getByTestId('mandalart-container').click({ position: { x: 1, y: 1 } });

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
```

- [ ] **Step 2: Run the test**

```bash
pnpm test:e2e e2e/guest-cell-edit.spec.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/guest-cell-edit.spec.ts
git commit -m "test(e2e): add guest mode cell editing and localStorage persistence tests"
```

---

### Task 6: Run all E2E tests and verify

- [ ] **Step 1: Run full E2E suite**

```bash
pnpm test:e2e
```

Expected: All tests pass (4 + 5 + 4 = 13 tests total).

- [ ] **Step 2: Run existing unit tests to confirm no regressions**

```bash
pnpm test
```

Expected: All existing tests pass.

- [ ] **Step 3: Final commit if any adjustments were needed**

```bash
git add -A
git commit -m "test(e2e): Phase 1 complete — guest mode E2E tests with Playwright"
```
