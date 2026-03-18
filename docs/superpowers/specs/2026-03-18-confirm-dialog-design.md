# Confirm Dialog for Destructive Actions

**Date:** 2026-03-18
**Status:** Review Complete
**Resolves:** Known Issue — "No confirmation dialog for delete/reset actions"

## Problem

Delete and reset actions in `MandalartListItemMenu` execute immediately without user confirmation. Both are destructive and irreversible — delete removes the mandalart entirely, reset wipes all 73 topic nodes.

## Scope

- Add confirmation dialog to **delete** and **reset** actions only.
- Toast notifications (the other Known Issue) are excluded — Firebase realtime subscriptions already provide immediate visual feedback for all mutations.

## Design

### Approach: ConfirmDialog + useModal

Follows the existing `AlertDialog` pattern. A new `ConfirmDialog` component wraps the same Radix AlertDialog primitives but with both Cancel and Confirm buttons. State is managed via the existing `useModal` hook in `useAppLayoutState`.

### New Component: `ConfirmDialog.tsx`

```tsx
// src/components/ConfirmDialog.tsx
type ConfirmDialogProps = {
  isOpen: boolean;
  message: string | null;
  confirmText: string | null;
  onConfirm: () => void;
  onClose: () => void;
};
```

- Uses `AlertDialogAction` for confirm (displays `confirmText`), `AlertDialogCancel` for cancel (`global.cancel`).
- `AlertDialogCancel` already exists in `ui/alert-dialog.tsx` — no UI primitive changes needed.
- Same styling as `AlertDialog` (gap-3 p-6 w-max).
- Confirm button text is context-specific: "삭제" for delete, "초기화" for reset — makes the destructive action explicit.

### Hook Change: `useAppLayoutState.ts`

Add a `useModal<{ message: string; confirmText: string; onConfirm: () => void }>()` instance:

```ts
const {
  isOpen: isOpenConfirmDialog,
  open: openConfirmDialog,
  close: closeConfirmDialog,
  content: confirmDialogContent,
} = useModal<{ message: string; confirmText: string; onConfirm: () => void }>();
```

**Handler changes:**

- `handleDeleteMandalart`: instead of calling `deleteMandalart(id)` directly, calls `openConfirmDialog({ message: t('mandalart.confirmDelete'), confirmText: t('mandalart.delete'), onConfirm: () => { deleteMandalart(id); trackMandalartDelete(); } })`.
- `handleResetMandalart`: instead of executing immediately, calls `openConfirmDialog({ message: t('mandalart.confirmReset'), confirmText: t('mandalart.reset'), onConfirm: () => { saveMandalartMeta(id, EMPTY_META); saveTopicTree(id, EMPTY_TOPIC_TREE); trackMandalartReset(); } })`.

**Closure safety:** `openConfirmDialog` is `useModal`'s `open` — a stable `useCallback([], [])` ref. The `mandalartId` parameter is captured in the `onConfirm` closure at call time and remains valid because the dialog opens synchronously in response to user action. Adding `openConfirmDialog` to `useCallback` deps does not cause unnecessary re-creation.

**Return value — new `confirmDialog` group:**

```ts
confirmDialog: {
  isOpen: isOpenConfirmDialog,
  message: confirmDialogContent?.message ?? null,
  confirmText: confirmDialogContent?.confirmText ?? null,
  onConfirm: () => { confirmDialogContent?.onConfirm(); closeConfirmDialog(); },
  close: closeConfirmDialog,
},
```

**Note on `useModal` close behavior:** `useModal`'s `close()` sets `isOpen` to `false` but does **not** null out `content` (intentional — preserves content during close animation). This is safe for `ConfirmDialog` because `onConfirm` is only invocable via user interaction with the `AlertDialogAction` button, which is only rendered when `isOpen === true`. There is no call path to `onConfirm` after the dialog closes.

### Layout: `AppLayout.tsx`

```tsx
import ConfirmDialog from '@/components/ConfirmDialog';

// Below existing AlertDialog
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  message={confirmDialog.message}
  confirmText={confirmDialog.confirmText}
  onConfirm={confirmDialog.onConfirm}
  onClose={confirmDialog.close}
/>
```

Not lazy-loaded — same as `AlertDialog` (lightweight component).

### i18n Keys

Added to all 4 locale files (`ko.json`, `en.json`, `ja.json`, `zh-CN.json`):

| Key | ko | en |
|-----|----|----|
| `mandalart.confirmDelete` | 이 만다라트를 삭제하시겠습니까? | Are you sure you want to delete this mandalart? |
| `mandalart.confirmReset` | 이 만다라트를 초기화하시겠습니까?\n모든 내용이 지워집니다. | Are you sure you want to reset this mandalart?\nAll content will be cleared. |

Cancel button: reuses `global.cancel` ("취소"). Confirm button: reuses existing `mandalart.delete` ("삭제") / `mandalart.reset` ("초기화") — no new i18n keys needed for buttons.

## Files Changed

| Change | File |
|--------|------|
| New component | `src/components/ConfirmDialog.tsx` |
| Hook modification | `src/hooks/useAppLayoutState.ts` |
| Layout wiring | `src/components/AppLayout.tsx` |
| i18n (4 files) | `src/locales/resources/{ko,en,ja,zh-CN}.json` |

## Out of Scope

- Toast notifications — deferred; current UI provides sufficient feedback via realtime state updates.
- Undo functionality — not needed given explicit confirmation step.
- Other destructive actions (logout, etc.) — confirmed unnecessary by user.
