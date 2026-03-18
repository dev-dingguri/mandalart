# Confirm Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a confirmation dialog before delete and reset actions to prevent accidental destructive operations.

**Architecture:** New `ConfirmDialog` component wraps existing Radix AlertDialog primitives with Cancel + Confirm buttons. `useAppLayoutState` hook manages dialog state via existing `useModal` pattern, intercepting delete/reset handlers to show confirmation first.

**Tech Stack:** React 19, Radix AlertDialog, Zustand, i18next, Vitest

**Spec:** `docs/superpowers/specs/2026-03-18-confirm-dialog-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/ConfirmDialog.tsx` | Radix AlertDialog with Cancel + Confirm buttons |
| Modify | `src/hooks/useAppLayoutState.ts` | Add confirmDialog state group, change delete/reset handlers |
| Modify | `src/components/AppLayout.tsx` | Render ConfirmDialog |
| Modify | `src/locales/resources/ko.json` | Add `confirmDelete`, `confirmReset` keys |
| Modify | `src/locales/resources/en.json` | Add `confirmDelete`, `confirmReset` keys |
| Modify | `src/locales/resources/ja.json` | Add `confirmDelete`, `confirmReset` keys |
| Modify | `src/locales/resources/zh-CN.json` | Add `confirmDelete`, `confirmReset` keys |

---

### Task 1: Add i18n keys

**Files:**
- Modify: `src/locales/resources/ko.json:42-64` (mandalart section)
- Modify: `src/locales/resources/en.json:42-64`
- Modify: `src/locales/resources/ja.json:42-64`
- Modify: `src/locales/resources/zh-CN.json:42-64`

- [ ] **Step 1: Add `confirmDelete` and `confirmReset` to ko.json**

In the `mandalart` object, before the `"errors"` object, add:

```json
"confirmDelete": "이 만다라트를 삭제하시겠습니까?",
"confirmReset": "이 만다라트를 초기화하시겠습니까?\n모든 내용이 지워집니다."
```

- [ ] **Step 2: Add to en.json**

```json
"confirmDelete": "Are you sure you want to delete this mandalart?",
"confirmReset": "Are you sure you want to reset this mandalart?\nAll content will be cleared."
```

- [ ] **Step 3: Add to ja.json**

```json
"confirmDelete": "このマンダラートを削除しますか？",
"confirmReset": "このマンダラートをリセットしますか？\nすべての内容が消去されます。"
```

- [ ] **Step 4: Add to zh-CN.json**

```json
"confirmDelete": "确定要删除这个曼达拉图吗？",
"confirmReset": "确定要重置这个曼达拉图吗？\n所有内容将被清除。"
```

- [ ] **Step 5: Commit**

```bash
git add src/locales/resources/ko.json src/locales/resources/en.json src/locales/resources/ja.json src/locales/resources/zh-CN.json
git commit -m "feat: add i18n keys for delete/reset confirmation dialogs"
```

---

### Task 2: Create ConfirmDialog component

**Files:**
- Create: `src/components/ConfirmDialog.tsx`
- Reference: `src/components/AlertDialog.tsx` (existing pattern to follow)
- Reference: `src/components/ui/alert-dialog.tsx` (Radix primitives)

- [ ] **Step 1: Create ConfirmDialog component**

Create `src/components/ConfirmDialog.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ConfirmDialogProps = {
  isOpen: boolean;
  message: string | null;
  confirmText: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmDialog = ({ isOpen, message, confirmText, onConfirm, onClose }: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogRoot open={isOpen}>
      <AlertDialogContent className="gap-3 p-6 w-max">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('global.app')}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line break-keep">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {t('global.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default ConfirmDialog;
```

- [ ] **Step 2: Verify build compiles**

Run: `pnpm build`
Expected: SUCCESS (no type errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfirmDialog.tsx
git commit -m "feat: add ConfirmDialog component with Cancel/Confirm buttons"
```

---

### Task 3: Wire useAppLayoutState + AppLayout

**Files:**
- Modify: `src/hooks/useAppLayoutState.ts:1-232`
- Modify: `src/components/AppLayout.tsx:1-81`

- [ ] **Step 1: Add confirmDialog state to useAppLayoutState**

In `useAppLayoutState.ts`, add a new `useModal` instance after the existing `useModal<string>()` for alert (around line 62):

```ts
const {
  isOpen: isOpenConfirmDialog,
  open: openConfirmDialog,
  close: closeConfirmDialog,
  content: confirmDialogContent,
} = useModal<{ message: string; confirmText: string; onConfirm: () => void }>();
```

- [ ] **Step 2: Change handleDeleteMandalart to open confirm dialog**

Replace `handleDeleteMandalart` (lines 167-173):

Before:
```ts
const handleDeleteMandalart = useCallback(
  (mandalartId: string) => {
    deleteMandalart(mandalartId);
    trackMandalartDelete();
  },
  [deleteMandalart, trackMandalartDelete]
);
```

After:
```ts
const handleDeleteMandalart = useCallback(
  (mandalartId: string) => {
    openConfirmDialog({
      message: t('mandalart.confirmDelete'),
      confirmText: t('mandalart.delete'),
      onConfirm: () => {
        deleteMandalart(mandalartId);
        trackMandalartDelete();
      },
    });
  },
  [openConfirmDialog, t, deleteMandalart, trackMandalartDelete]
);
```

- [ ] **Step 3: Change handleResetMandalart to open confirm dialog**

Replace `handleResetMandalart` (lines 182-189):

Before:
```ts
const handleResetMandalart = useCallback(
  (mandalartId: string) => {
    saveMandalartMeta(mandalartId, EMPTY_META);
    saveTopicTree(mandalartId, EMPTY_TOPIC_TREE);
    trackMandalartReset();
  },
  [saveMandalartMeta, saveTopicTree, trackMandalartReset]
);
```

After:
```ts
const handleResetMandalart = useCallback(
  (mandalartId: string) => {
    openConfirmDialog({
      message: t('mandalart.confirmReset'),
      confirmText: t('mandalart.reset'),
      onConfirm: () => {
        saveMandalartMeta(mandalartId, EMPTY_META);
        saveTopicTree(mandalartId, EMPTY_TOPIC_TREE);
        trackMandalartReset();
      },
    });
  },
  [openConfirmDialog, t, saveMandalartMeta, saveTopicTree, trackMandalartReset]
);
```

- [ ] **Step 4: Add confirmDialog group to return value**

In the return object (around line 191), add after the `alert` group:

```ts
confirmDialog: {
  isOpen: isOpenConfirmDialog,
  message: confirmDialogContent?.message ?? null,
  confirmText: confirmDialogContent?.confirmText ?? null,
  onConfirm: () => {
    confirmDialogContent?.onConfirm();
    closeConfirmDialog();
  },
  close: closeConfirmDialog,
},
```

- [ ] **Step 5: Add ConfirmDialog to AppLayout**

In `src/components/AppLayout.tsx`:

Add import (after AlertDialog import, line 12):
```ts
import ConfirmDialog from '@/components/ConfirmDialog';
```

Destructure `confirmDialog` from hook result (line 22):
```ts
const { user, onSignOut, mandalart, leftDrawer, rightDrawer, signInDialog, alert, confirmDialog } =
  useAppLayoutState(userHandlers);
```

Add ConfirmDialog render after AlertDialog (after line 75):
```tsx
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  message={confirmDialog.message}
  confirmText={confirmDialog.confirmText}
  onConfirm={confirmDialog.onConfirm}
  onClose={confirmDialog.close}
/>
```

- [ ] **Step 6: Verify build compiles**

Run: `pnpm build`
Expected: SUCCESS

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useAppLayoutState.ts src/components/AppLayout.tsx
git commit -m "feat: wire ConfirmDialog for delete/reset actions"
```

---

### Task 4: Update CLAUDE.md Known Issues

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Known Issues section**

Replace:
```markdown
## Known Issues

- No confirmation dialog for delete/reset actions (executes immediately)
- No save-success feedback (no toast notifications)
```

With:
```markdown
## Known Issues

- No save-success feedback — deferred; Firebase realtime subscriptions provide sufficient immediate visual feedback
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update Known Issues — confirmation dialog resolved, toast deferred"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Test delete confirmation**

1. Open the left drawer (mandalart list)
2. Click the "..." menu on a mandalart item
3. Click "삭제" (delete)
4. Verify: confirmation dialog appears with message "이 만다라트를 삭제하시겠습니까?"
5. Verify: Cancel button says "취소", Confirm button says "삭제"
6. Click "취소" → dialog closes, mandalart still exists
7. Repeat steps 2-3, click "삭제" on confirm → mandalart is deleted

- [ ] **Step 3: Test reset confirmation**

1. Click the "..." menu on a mandalart item
2. Click "초기화" (reset)
3. Verify: confirmation dialog appears with message "이 만다라트를 초기화하시겠습니까?\n모든 내용이 지워집니다."
4. Verify: Cancel button says "취소", Confirm button says "초기화"
5. Click "취소" → dialog closes, content unchanged
6. Repeat steps 1-2, click "초기화" on confirm → mandalart content is cleared

- [ ] **Step 4: Test TMP_MANDALART_ID edge case**

1. Sign out (guest mode)
2. Open the "..." menu on the guest mandalart
3. Verify: "삭제" option is NOT shown (only reset and rename) — this is existing behavior, confirm it still works
4. Click "초기화" → confirm dialog appears → works correctly
