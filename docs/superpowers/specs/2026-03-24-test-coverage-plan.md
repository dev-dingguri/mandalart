# Test Coverage Plan

## Current Status (2026-03-25)

- **20 test files, 252 tests** — all passing
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
| `useSwipeNavigation.test.ts` | Pure functions: calculateKeyboardIdx (방향/경계), calculateSwipedIdx (스와이프/플릭/대각선) | 28 |
| `useInfiniteScroll.test.ts` | IntersectionObserver mock, 교차/비교차, cleanup, rootMargin, ref 패턴 | 10 |
| `useVisualViewportOffset.test.ts` | visualViewport mock, 오프셋 계산, resize/scroll, cleanup | 6 |
| `useMandalartCallbacks.test.ts` | Store mock + toast + loading guard, CRUD 콜백 (select/meta/topicTree/create/delete/reset) | 19 |
| `useAuthCallbacks.test.ts` | signIn/signOut, userType 추적, uploadTemp 마이그레이션, 에러 처리 | 13 |
| `useAuthStore.test.ts` | Firebase Auth mock, signIn/signOut, session 관리, onAuthStateChanged | 13 |
| `useAppLayoutState.test.ts` | 오케스트레이터 통합: 반환 구조, 서랍+콜백 연동, 에러→alert→reload, confirmDialog | 14 |
| `useMandalartStore.user.test.ts` | User mode: Firebase CRUD, 원자적 쓰기, uploadTemp 마이그레이션, 경계 조건 | 21 |
| `useMandalartInit.test.ts` | onValue 구독/해제, Guest↔User 모드 전환, stale 콜백 guard, localStorage 초기화/복구 | 25 |
| **Total** | | **252** |

### Source Changes for Testability

- `useSwipeNavigation.ts`: `calculateSwipedIdx`, `calculateKeyboardIdx`, `SwipeParams` type을 `export`로 변경 (로직 변경 없음)

### Mocking Patterns Reference

| Mock 대상 | 기법 | 사용 파일 |
|-----------|------|-----------|
| `IntersectionObserver` | `vi.stubGlobal` + 콜백 캡처 | `useInfiniteScroll.test.ts` |
| `window.visualViewport` | `Object.defineProperty` + 이벤트 핸들러 캡처 | `useVisualViewportOffset.test.ts` |
| Firebase Auth | `vi.mock('@/lib/firebase')` + `vi.mock('firebase/auth')` | `useAuthStore.test.ts`, `useAuthCallbacks.test.ts` |
| Firebase RTDB | `vi.mock('firebase/database')` + mock 함수 주입 | `useMandalartStore.user.test.ts`, `useMandalartInit.test.ts` |
| Zustand 스토어 | `store.setState()`로 mock 함수 주입 (실제 스토어 사용) | `useMandalartCallbacks.test.ts`, `useAuthCallbacks.test.ts` |
| Module-level side effects | `vi.hoisted()`로 콜백 참조 선언 후 `vi.mock` 팩토리에서 캡처 | `useAuthStore.test.ts` |
| `react-i18next` | 모듈 스코프 stable `t` 함수 반환 | `useAppLayoutState.test.ts` |
| `sonner` | `vi.mock('sonner')` + `toast.error` spy | `useMandalartCallbacks.test.ts` |

## Remaining

All planned unit tests are complete.
