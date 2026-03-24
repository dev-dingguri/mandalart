# Test Coverage Plan

## Current Status (2026-03-24)

- **11 test files, 103 tests** — all passing
- Framework: Vitest + @testing-library/react (jsdom)

### Completed Tests

| File | Target | Tests |
|------|--------|-------|
| `constants.test.ts` | Constants, factory functions | 7 |
| `useLoadingStore.test.ts` | LoadingStore CRUD | 5 |
| `useThemeStore.test.ts` | ThemeStore state transitions | 4 |
| `guestStorage.test.ts` | localStorage save/load/migration | 7 |
| `cellNavigation.test.ts` | Cell navigation, position, topic lookup | 13 |
| `routing.test.tsx` | has_used_tool flag | 3 |
| `useMandalartStore.test.ts` | MandalartStore Guest mode (select, save, reset, guard) | 20 |
| `useModal.test.ts` | open/close/content state, generic type, animation retention | 8 |
| `useTitleEdit.test.ts` | Edit/save/cancel, limit, keydown, external sync, mandalart switch | 13 |
| `useCellInput.test.ts` | Key handlers, text change, limit, cellKey change, text preservation | 15 |
| `useMediaQuery.test.ts` | matchMedia subscription, change event, cleanup | 5 |
| **Total** | | **103** |

## Remaining: Hooks (Difficulty: Hard)

These hooks require extensive mocking (Firebase, Analytics, i18next, toast, etc.) and are better suited for a dedicated session.

### useSwipeNavigation
- **Difficulty:** Hard
- **Why:** Touch event simulation + DOM container ref. Pure functions (`calculateSwipedIdx`, `calculateKeyboardIdx`) are not exported.
- **Approach options:**
  - A) Export pure functions and test them separately (recommended — low-effort, high-value)
  - B) Full renderHook with touch event simulation

### useVisualViewportOffset
- **Difficulty:** Hard
- **Why:** Requires `window.visualViewport` API mocking (not available in jsdom)
- **Approach:** Mock visualViewport with resize/scroll event triggers

### useAppLayoutState
- **Difficulty:** Hard (orchestrator hook)
- **Why:** Depends on MandalartStore, i18next, useModal, useMandalartCallbacks, useAuthCallbacks. Essentially an integration test.
- **Approach:** Mock stores and i18next, verify output structure and callback wiring

### useAuthCallbacks
- **Difficulty:** Hard
- **Why:** Depends on AuthStore (Firebase Auth), MandalartStore, analytics events
- **Approach:** Mock Firebase auth, verify signIn/signOut flows, uploadTemp migration

### useMandalartCallbacks
- **Difficulty:** Hard
- **Why:** Depends on MandalartStore, LoadingStore, analytics events, sonner toast
- **Approach:** Mock stores and toast, verify CRUD callback flows and loading state management

### useInfiniteScroll
- **Difficulty:** Medium-Hard
- **Why:** Requires `IntersectionObserver` mock
- **Approach:** Mock IntersectionObserver, trigger intersection, verify callback

## Remaining: Stores

### useAuthStore
- **Difficulty:** Hard
- **Why:** Firebase Auth dependency (onAuthStateChanged, GoogleAuthProvider, signInWithPopup)
- **Approach:** Mock Firebase Auth module

### useMandalartStore (User mode)
- **Difficulty:** Hard
- **Why:** Firebase Realtime Database dependency (onValue, push, set, update)
- **Approach:** Mock Firebase Database module, test subscription logic
