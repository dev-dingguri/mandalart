# Hooks 리팩토링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/hooks/` 6개 훅의 코드 품질 개선 — God Hook 분할, 불필요한 레이어 제거, 리렌더 최적화, 매직 넘버 상수화

**Architecture:** `useAppLayoutState` God Hook을 `useMandalartCallbacks` + `useAuthCallbacks` + 경량 `useAppLayoutState`(조합기)로 3분할. Analytics 2단 훅 레이어를 순수 함수 모듈(`src/lib/`)로 전환. 공통 ref 동기화 패턴을 `useLatestRef` 유틸 훅으로 추출.

**Tech Stack:** React 19, TypeScript 5, Zustand 5, Firebase v12 Analytics, Vitest

---

## File Structure

### 신규 생성

| File | Responsibility |
|------|---------------|
| `src/hooks/useLatestRef.ts` | 렌더마다 ref를 최신 값으로 동기화하는 유틸 훅 |
| `src/lib/analytics.ts` | Firebase Analytics 래핑 순수 함수 (`logEvent`, `setUserProperties`) |
| `src/lib/analyticsEvents.ts` | 도메인별 이벤트 추적 순수 함수 (`trackSignIn`, `trackMandalartCreate` 등) |
| `src/hooks/useMandalartCallbacks.ts` | Mandalart CRUD 콜백 + analytics 추적 |
| `src/hooks/useAuthCallbacks.ts` | Auth 콜백 + guest 마이그레이션 + user type 추적 |

### 삭제

| File | Reason |
|------|--------|
| `src/hooks/useAnalytics.ts` | `src/lib/analytics.ts`로 대체 — React 상태를 사용하지 않으므로 훅일 필요 없음 |
| `src/hooks/useAnalyticsEvents.ts` | `src/lib/analyticsEvents.ts`로 대체 — 동일 이유 |

### 수정

| File | Changes |
|------|---------|
| `src/hooks/useAppLayoutState.ts` | 리렌더 최적화 → God Hook 분할 (경량 조합기로 축소) |
| `src/hooks/useSwipeNavigation.ts` | 매직 넘버 상수화, 대각선 스와이프 의도 주석, `useLatestRef` 적용 |
| `src/hooks/useInfiniteScroll.ts` | `useLatestRef` 적용 |
| `src/hooks/useModal.ts` | 이름/용도 주석 추가 |
| `src/App.tsx` | import 경로 변경 (analytics) |
| `src/components/SettingsDrawer.tsx` | import 경로 변경 (analytics) |
| `src/components/MandalartView.tsx` | import 경로 변경 (analytics) |
| `src/components/AppLayout.tsx` | import 변경 (named export) |
| `src/stores/useMandalartStore.ts` | TODO 주석 추가 |
| `src/stores/useLoadingStore.ts` | TODO 주석 추가 |

---

## Task 1: `useLatestRef` 유틸 훅 추출

다른 훅들이 공통으로 사용하는 "렌더마다 ref 동기화" 패턴을 추출합니다.

**Files:**
- Create: `src/hooks/useLatestRef.ts`

- [ ] **Step 1: `useLatestRef` 작성**

```ts
// src/hooks/useLatestRef.ts
import { useRef } from 'react';

/**
 * 매 렌더마다 ref.current를 최신 값으로 동기화.
 * useCallback 내에서 최신 상태를 참조하면서도 콜백 재생성을 방지할 때 사용.
 * (advanced-use-latest / advanced-event-handler-refs 패턴)
 */
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 성공 (새 파일은 아직 import되지 않으므로 영향 없음)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLatestRef.ts
git commit -m "refactor: useLatestRef 유틸 훅 추출"
```

---

## Task 2: `useModal` 주석 추가

이름과 용도에 대한 의도를 주석으로 남깁니다.

**Files:**
- Modify: `src/hooks/useModal.ts`

- [ ] **Step 1: 주석 추가**

파일 상단에 JSDoc 추가:

```ts
/**
 * open/close 토글 + 선택적 content를 관리하는 범용 상태 훅.
 *
 * "Modal"이라는 이름이지만 Drawer, Dialog, Alert 등 open/close가 필요한 모든 UI에
 * 동일하게 사용된다. 이름을 useDisclosure 등으로 바꿀 수 있지만, 이미 프로젝트 전반에서
 * 표준 패턴으로 자리잡았으므로 현행 이름을 유지한다.
 *
 * content를 사용하지 않는 호출처(Drawer, SignInDialog)에서도 동일하게 사용하여
 * 프로젝트 내 토글 상태 패턴을 통일한다.
 */
```

- [ ] **Step 2: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useModal.ts
git commit -m "docs: useModal 용도 및 네이밍 의도 주석 추가"
```

---

## Task 3: Analytics 순수 함수 모듈 전환

`useAnalytics` + `useAnalyticsEvents` 2단 훅 레이어를 순수 함수 모듈로 전환합니다. React 상태/이펙트를 사용하지 않으므로 훅일 필요가 없습니다.

**Files:**
- Create: `src/lib/analytics.ts`
- Create: `src/lib/analyticsEvents.ts`
- Delete: `src/hooks/useAnalytics.ts`
- Delete: `src/hooks/useAnalyticsEvents.ts`
- Modify: `src/App.tsx:7,18-22`
- Modify: `src/components/SettingsDrawer.tsx:7,41`
- Modify: `src/components/MandalartView.tsx:14,38`
- Modify: `src/hooks/useAppLayoutState.ts:10,77-85`

- [ ] **Step 1: `src/lib/analytics.ts` 작성**

```ts
// src/lib/analytics.ts
import { analytics } from '@/lib/firebase';
import {
  logEvent as firebaseLogEvent,
  setUserProperties as firebaseSetUserProperties,
  type CustomParams,
} from 'firebase/analytics';

/**
 * Firebase Analytics 래퍼.
 * analytics 인스턴스가 null(measurementId 미설정)이면 no-op.
 */
export const logEvent = (
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) => {
  if (analytics) firebaseLogEvent(analytics, eventName, eventParams);
};

export const setUserProperties = (
  properties: CustomParams
) => {
  if (analytics) firebaseSetUserProperties(analytics, properties);
};
```

- [ ] **Step 2: `src/lib/analyticsEvents.ts` 작성**

```ts
// src/lib/analyticsEvents.ts
import { logEvent, setUserProperties } from '@/lib/analytics';
import { APP_VERSION } from '@/version';

export const trackAppVersion = () =>
  setUserProperties({ app_version: APP_VERSION });

export const trackUserType = (userType: 'guest' | 'authenticated') =>
  setUserProperties({ user_type: userType });

export const trackSignIn = (provider: string) =>
  logEvent('sign_in', { provider });

export const trackSignOut = () =>
  logEvent('sign_out');

export const trackMandalartCreate = () =>
  logEvent('mandalart_create');

export const trackMandalartDelete = () =>
  logEvent('mandalart_delete');

export const trackMandalartReset = () =>
  logEvent('mandalart_reset');

export const trackGuestUpload = () =>
  logEvent('guest_upload');

export const trackViewModeChange = (mode: 'all' | 'focus') =>
  logEvent('view_mode_change', { mode });

export const trackLanguageChange = (language: string) =>
  logEvent('language_change', { language });

export const trackThemeChange = (theme: string) =>
  logEvent('theme_change', { theme });
```

- [ ] **Step 3: 빌드 확인 (새 모듈 단독)**

Run: `pnpm build`
Expected: 성공 (새 파일은 아직 import되지 않음)

- [ ] **Step 4: `src/App.tsx` import 전환**

변경 전:
```ts
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';
// ...
const { trackAppVersion } = useAnalyticsEvents();
```

변경 후:
```ts
import { trackAppVersion } from '@/lib/analyticsEvents';
// (useAnalyticsEvents 호출 제거 — trackAppVersion을 직접 사용)
```

- [ ] **Step 5: `src/components/SettingsDrawer.tsx` import 전환**

변경 전:
```ts
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';
// ...
const { trackLanguageChange, trackThemeChange } = useAnalyticsEvents();
```

변경 후:
```ts
import { trackLanguageChange, trackThemeChange } from '@/lib/analyticsEvents';
// (useAnalyticsEvents 호출 제거 — 함수를 직접 사용)
```

- [ ] **Step 6: `src/components/MandalartView.tsx` import 전환**

변경 전:
```ts
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';
// ...
const { trackViewModeChange } = useAnalyticsEvents();
```

변경 후:
```ts
import { trackViewModeChange } from '@/lib/analyticsEvents';
// (useAnalyticsEvents 호출 제거 — 함수를 직접 사용)
```

- [ ] **Step 7: `src/hooks/useAppLayoutState.ts` import 전환**

변경 전:
```ts
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';
// ...
const {
  trackUserType,
  trackSignIn,
  trackSignOut,
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
  trackGuestUpload,
} = useAnalyticsEvents();
```

변경 후:
```ts
import {
  trackUserType,
  trackSignIn,
  trackSignOut,
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
  trackGuestUpload,
} from '@/lib/analyticsEvents';
// (useAnalyticsEvents 호출 제거 — 모듈 레벨 import으로 대체)
```

- [ ] **Step 8: 기존 훅 파일 삭제**

```bash
rm src/hooks/useAnalytics.ts src/hooks/useAnalyticsEvents.ts
```

- [ ] **Step 9: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 10: Commit**

```bash
git add src/lib/analytics.ts src/lib/analyticsEvents.ts \
  src/App.tsx src/components/SettingsDrawer.tsx \
  src/components/MandalartView.tsx src/hooks/useAppLayoutState.ts
git rm src/hooks/useAnalytics.ts src/hooks/useAnalyticsEvents.ts
git commit -m "refactor: analytics 훅을 순수 함수 모듈로 전환"
```

---

## Task 4: `useSwipeNavigation` 정리

매직 넘버를 named constant로 추출하고, 대각선 스와이프 의도 주석을 추가하고, `useLatestRef`를 적용합니다.

**Files:**
- Modify: `src/hooks/useSwipeNavigation.ts`

- [ ] **Step 1: 매직 넘버를 named constant로 추출**

파일 상단 (import 아래)에 추가:

```ts
/** 스와이프 인식 기준: 컨테이너 너비 대비 비율 */
const SWIPE_THRESHOLD_RATIO = 0.35;
/** 플릭 제스처로 인식하는 최대 시간(ms) */
const FLICK_MAX_DURATION_MS = 500;
/** 플릭 속도→가중치 변환 계수 */
const FLICK_WEIGHT_FACTOR = 0.02;
/** 빠른 플릭 시 최대 가중치 배율 */
const FLICK_MAX_WEIGHT = 5;
```

`calculateSwipedIdx` 내부의 매직 넘버를 상수로 교체:

```ts
// 변경 전
baseline: container.clientWidth * 0.35,
const weight = Math.min(Math.max((500 - period) * 0.02, 1), 5);

// 변경 후
baseline: container.clientWidth * SWIPE_THRESHOLD_RATIO,
const weight = Math.min(
  Math.max((FLICK_MAX_DURATION_MS - period) * FLICK_WEIGHT_FACTOR, 1),
  FLICK_MAX_WEIGHT
);
```

- [ ] **Step 2: 대각선 스와이프 의도 주석 추가**

`calculateSwipedIdx`의 4개 `if` 블록 앞에:

```ts
// 의도적으로 else if가 아닌 독립 if 사용 — 대각선 스와이프 시 상하+좌우 동시 이동을 허용
```

- [ ] **Step 3: `useLatestRef` 적용**

변경 전:
```ts
const focusedIdxRef = useRef(focusedIdx);
focusedIdxRef.current = focusedIdx;
const configRef = useRef({ gridSize, colSize });
configRef.current = { gridSize, colSize };
```

변경 후:
```ts
import { useLatestRef } from '@/hooks/useLatestRef';
// ...
const focusedIdxRef = useLatestRef(focusedIdx);
const configRef = useLatestRef({ gridSize, colSize });
```

⚠️ `configRef`에 매 렌더 새 객체 `{ gridSize, colSize }`가 전달되지만, `useLatestRef`는 ref.current에 할당만 하므로 참조 동등성은 중요하지 않음 — `handleTouchEnd`가 호출 시점에 `.current`를 읽으므로 항상 최신 값 사용.

- [ ] **Step 4: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSwipeNavigation.ts
git commit -m "refactor: useSwipeNavigation 매직 넘버 상수화 및 useLatestRef 적용"
```

---

## Task 5: `useInfiniteScroll` — `useLatestRef` 적용

**Files:**
- Modify: `src/hooks/useInfiniteScroll.ts`

- [ ] **Step 1: `useLatestRef` 적용**

변경 전:
```ts
import { useEffect, useRef } from 'react';

// ...
const onLoadMoreRef = useRef(onLoadMore);
onLoadMoreRef.current = onLoadMore;
```

변경 후:
```ts
import { useEffect, useRef } from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';

// ...
const onLoadMoreRef = useLatestRef(onLoadMore);
```

- [ ] **Step 2: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useInfiniteScroll.ts
git commit -m "refactor: useInfiniteScroll에 useLatestRef 적용"
```

---

## Task 6: `useAppLayoutState` 리렌더 최적화 + 중복 제거

God Hook 분할 전에 먼저 최적화를 적용합니다. 분할 시 이 최적화가 자연스럽게 반영됩니다.

**Files:**
- Modify: `src/hooks/useAppLayoutState.ts`

- [ ] **Step 1: `currentMandalartId` → ref 전환 (rerender-defer-reads)**

`currentMandalartId`는 콜백(`handleMetaChange`, `handleTopicTreeChange`) 내에서만 읽히므로, 구독 대신 ref로 참조하여 콜백 재생성을 방지합니다.

변경 전:
```ts
const handleMandalartMetaChange = useCallback(
  (meta: MandalartMeta) => {
    saveMandalartMeta(currentMandalartId, meta);
  },
  [currentMandalartId, saveMandalartMeta]
);
```

변경 후:
```ts
import { useLatestRef } from '@/hooks/useLatestRef';
// ...
// 콜백 전용 — ref로 참조하여 콜백 재생성 방지 (rerender-defer-reads)
const currentIdRef = useLatestRef(currentMandalartId);

const handleMandalartMetaChange = useCallback(
  (meta: MandalartMeta) => {
    saveMandalartMeta(currentIdRef.current, meta);
  },
  [saveMandalartMeta, currentIdRef]
);

const handleTopicTreeChange = useCallback(
  (topicTree: TopicNode) => {
    saveTopicTree(currentIdRef.current, topicTree);
  },
  [saveTopicTree, currentIdRef]
);
```

- [ ] **Step 2: `currentMandalartMeta` — 커스텀 equality fn 추가**

Firebase `onValue`가 매 snapshot마다 새 객체를 생성하므로, `Object.is` 비교가 실패하여 내용이 같아도 리렌더됩니다. 필드 수준 비교로 방지합니다.

```ts
// 파일 상단에 equality 함수 정의
// Firebase onValue가 매 snapshot마다 새 MandalartMeta 객체를 생성하므로
// Object.is 대신 필드 수준 비교를 사용하여 내용이 같으면 리렌더 방지
const metaEquals = (a: MandalartMeta | null, b: MandalartMeta | null) =>
  a === b || (a !== null && b !== null && a.title === b.title);

// selector에 equality fn 전달
const currentMandalartMeta = useMandalartStore(
  (s) => s.currentMandalartId ? s.metaMap.get(s.currentMandalartId) ?? null : null,
  metaEquals
);
```

- [ ] **Step 3: `handleCreateMandalart` 중복 통합**

변경 전 (2개 함수):
```ts
const handleCreateMandalart = useCallback(() => {
  createMandalart(createEmptyMeta(), createEmptyTopicTree())
    .then(() => trackMandalartCreate())
    .catch((e: Error) => openAlert(e.message));
}, [createMandalart, trackMandalartCreate, openAlert]);

const handleCreateMandalartFromDrawer = useCallback(() => {
  createMandalart(createEmptyMeta(), createEmptyTopicTree())
    .then(() => {
      trackMandalartCreate();
      closeLeftDrawer();
    })
    .catch((e: Error) => openAlert(e.message));
}, [createMandalart, trackMandalartCreate, closeLeftDrawer, openAlert]);
```

변경 후 (1개 함수):
```ts
const handleCreateMandalart = useCallback(
  (afterSuccess?: () => void) => {
    createMandalart(createEmptyMeta(), createEmptyTopicTree())
      .then(() => {
        trackMandalartCreate();
        afterSuccess?.();
      })
      .catch((e: Error) => openAlert(e.message));
  },
  [createMandalart, openAlert]
);
```

반환 객체에서:
```ts
mandalart: {
  // ...
  // onClick 핸들러로 직접 전달되므로 래핑하여 MouseEvent가 afterSuccess에 전달되지 않도록 함
  onCreate: () => handleCreateMandalart(),
},
leftDrawer: {
  // ...
  onCreate: () => handleCreateMandalart(closeLeftDrawer),
},
```

⚠️ 두 `onCreate` 모두 인라인 화살표 함수이므로 매 렌더마다 새 참조. `MandalartListDrawer`가 `React.memo`가 아니고 이미 `isOpen`으로 렌더를 제어하므로 실질적 문제 없음. 필요하다면 별도 `useCallback`으로 감싸면 됨.

- [ ] **Step 4: `prevUserRef` 단순화**

변경 전:
```ts
const prevUserRef = useRef(user);
useEffect(() => {
  if (prevUserRef.current === user) return;
  prevUserRef.current = user;
  trackUserType(user ? 'authenticated' : 'guest');
}, [user, trackUserType]);
```

변경 후:
```ts
// 초기 마운트 시 스킵 — AuthenticatedView/GuestView가 이미 올바른 user로 마운트되므로
// 실제 전환(로그인/로그아웃) 시에만 추적
const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  trackUserType(user ? 'authenticated' : 'guest');
}, [user]);
```

- [ ] **Step 5: `confirmDialog.onConfirm` 안정화**

변경 전 (인라인 — 매 렌더마다 새 참조):
```ts
confirmDialog: {
  // ...
  onConfirm: () => {
    confirmDialogContent?.onConfirm();
    closeConfirmDialog();
  },
}
```

변경 후:
```ts
const handleConfirmDialogConfirm = useCallback(() => {
  confirmDialogContent?.onConfirm();
  closeConfirmDialog();
}, [confirmDialogContent, closeConfirmDialog]);

// return에서:
confirmDialog: {
  // ...
  onConfirm: handleConfirmDialogConfirm,
}
```

- [ ] **Step 6: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useAppLayoutState.ts
git commit -m "perf: useAppLayoutState 리렌더 최적화 및 중복 콜백 통합"
```

---

## Task 7: `useAppLayoutState` God Hook 분할

260줄 God Hook을 3개 파일로 분할합니다.

**Files:**
- Create: `src/hooks/useMandalartCallbacks.ts`
- Create: `src/hooks/useAuthCallbacks.ts`
- Modify: `src/hooks/useAppLayoutState.ts`

- [ ] **Step 1: `useMandalartCallbacks.ts` 작성**

`ConfirmDialogOptions` 타입을 이 파일 내에 정의하고 export합니다.
`useAppLayoutState`에서도 이 타입을 import하므로, 순환 참조를 방지하기 위해 `useMandalartCallbacks`에 타입의 원본을 둡니다.

```ts
// src/hooks/useMandalartCallbacks.ts
import { useCallback } from 'react';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { createEmptyMeta, createEmptyTopicTree } from '@/constants';
import { MandalartMeta } from '@/types/MandalartMeta';
import { TopicNode } from '@/types/TopicNode';
import {
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
} from '@/lib/analyticsEvents';
import { useLatestRef } from '@/hooks/useLatestRef';
import type { TFunction } from 'i18next';

export type ConfirmDialogOptions = {
  message: string;
  confirmText: string;
  onConfirm: () => void;
};

type MandalartCallbackDeps = {
  openAlert: (msg: string) => void;
  openConfirmDialog: (options: ConfirmDialogOptions) => void;
  t: TFunction;
};

export const useMandalartCallbacks = ({
  openAlert,
  openConfirmDialog,
  t,
}: MandalartCallbackDeps) => {
  // 콜백 전용 — ref로 참조하여 콜백 재생성 방지 (rerender-defer-reads)
  const currentIdRef = useLatestRef(
    useMandalartStore((s) => s.currentMandalartId)
  );

  const selectMandalartId = useMandalartStore((s) => s.selectMandalart);
  const createMandalart = useMandalartStore((s) => s.createMandalart);
  const deleteMandalart = useMandalartStore((s) => s.deleteMandalart);
  const saveMandalartMeta = useMandalartStore((s) => s.saveMandalartMeta);
  const saveTopicTree = useMandalartStore((s) => s.saveTopicTree);

  const handleMetaChange = useCallback(
    (meta: MandalartMeta) => {
      saveMandalartMeta(currentIdRef.current, meta);
    },
    [saveMandalartMeta, currentIdRef]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentIdRef.current, topicTree);
    },
    [saveTopicTree, currentIdRef]
  );

  const handleCreate = useCallback(
    (afterSuccess?: () => void) => {
      createMandalart(createEmptyMeta(), createEmptyTopicTree())
        .then(() => {
          trackMandalartCreate();
          afterSuccess?.();
        })
        .catch((e: Error) => openAlert(e.message));
    },
    [createMandalart, openAlert]
  );

  const handleSelect = useCallback(
    (mandalartId: string) => {
      selectMandalartId(mandalartId);
    },
    [selectMandalartId]
  );

  const handleDelete = useCallback(
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
    [openConfirmDialog, t, deleteMandalart]
  );

  const handleRename = useCallback(
    (mandalartId: string, name: string) => {
      saveMandalartMeta(mandalartId, { title: name });
    },
    [saveMandalartMeta]
  );

  const handleReset = useCallback(
    (mandalartId: string) => {
      openConfirmDialog({
        message: t('mandalart.confirmReset'),
        confirmText: t('mandalart.reset'),
        onConfirm: () => {
          saveMandalartMeta(mandalartId, createEmptyMeta());
          saveTopicTree(mandalartId, createEmptyTopicTree());
          trackMandalartReset();
        },
      });
    },
    [openConfirmDialog, t, saveMandalartMeta, saveTopicTree]
  );

  return {
    onMetaChange: handleMetaChange,
    onTopicTreeChange: handleTopicTreeChange,
    onCreate: handleCreate,
    onSelect: handleSelect,
    onDelete: handleDelete,
    onRename: handleRename,
    onReset: handleReset,
  };
};
```

- [ ] **Step 3: `useAuthCallbacks.ts` 작성**

```ts
// src/hooks/useAuthCallbacks.ts
import { useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import {
  trackSignIn,
  trackSignOut,
  trackUserType,
  trackGuestUpload,
} from '@/lib/analyticsEvents';
import type { TFunction } from 'i18next';

type AuthCallbackDeps = {
  user: User | null;
  openAlert: (msg: string) => void;
  t: TFunction;
};

export const useAuthCallbacks = ({
  user,
  openAlert,
  t,
}: AuthCallbackDeps) => {
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const getShouldUploadTemp = useAuthStore((s) => s.getShouldUploadTemp);
  const setShouldUploadTemp = useAuthStore((s) => s.setShouldUploadTemp);
  const uploadTemp = useMandalartStore((s) => s.uploadTemp);

  // 초기 마운트 시 스킵 — 실제 전환(로그인/로그아웃) 시에만 추적
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackUserType(user ? 'authenticated' : 'guest');
  }, [user]);

  // 로그인 직후 게스트 데이터를 Firebase로 마이그레이션
  useEffect(() => {
    const shouldUploadTemp = !!user && getShouldUploadTemp();
    if (!shouldUploadTemp) return;
    setShouldUploadTemp(false);
    uploadTemp()
      .then(() => trackGuestUpload())
      .catch((e: Error) => openAlert(e.message));
  }, [user, getShouldUploadTemp, setShouldUploadTemp, uploadTemp, openAlert]);

  const handleSignIn = useCallback(
    async (providerId: string) => {
      trackSignIn(providerId);
      try {
        await signIn(providerId);
      } catch (e) {
        // 사용자가 팝업을 직접 닫은 경우는 에러로 표시하지 않음
        if ((e as { code?: string })?.code !== 'auth/popup-closed-by-user') {
          openAlert(t('auth.errors.signIn.default'));
        }
      }
    },
    [signIn, openAlert, t]
  );

  const handleSignOut = useCallback(() => {
    trackSignOut();
    signOut();
  }, [signOut]);

  return {
    onSignIn: handleSignIn,
    onSignOut: handleSignOut,
  };
};
```

- [ ] **Step 4: `useAppLayoutState.ts`를 경량 조합기로 축소**

```ts
// src/hooks/useAppLayoutState.ts
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { useModal } from '@/hooks/useModal';
import { useMandalartCallbacks, type ConfirmDialogOptions } from '@/hooks/useMandalartCallbacks';
import { useAuthCallbacks } from '@/hooks/useAuthCallbacks';
import { MandalartMeta } from '@/types/MandalartMeta';

export type UserHandlers = {
  user?: User | null;
  error?: Error | null;
};

// Firebase onValue가 매 snapshot마다 새 MandalartMeta 객체를 생성하므로
// Object.is 대신 필드 수준 비교를 사용하여 내용이 같으면 리렌더 방지
const metaEquals = (a: MandalartMeta | null, b: MandalartMeta | null) =>
  a === b || (a !== null && b !== null && a.title === b.title);

export const useAppLayoutState = ({
  user = null,
  error: userError = null,
}: UserHandlers) => {
  // -- UI 상태 --
  const leftDrawer = useModal();
  const rightDrawer = useModal();
  const signInDialog = useModal();
  const alert = useModal<string>();
  const confirmDialog = useModal<ConfirmDialogOptions>();

  const { t } = useTranslation();

  // -- Store 상태 구독 --
  const signOut = useAuthStore((s) => s.signOut);
  const hasMandalarts = useMandalartStore((s) => s.metaMap.size > 0);
  const currentMandalartId = useMandalartStore((s) => s.currentMandalartId);
  const currentTopicTree = useMandalartStore((s) => s.currentTopicTree);
  const mandalartsError = useMandalartStore((s) => s.error);
  const currentMandalartMeta = useMandalartStore(
    (s) => s.currentMandalartId
      ? s.metaMap.get(s.currentMandalartId) ?? null
      : null,
    metaEquals
  );

  // -- 콜백 조합 --
  const mandalartCallbacks = useMandalartCallbacks({
    openAlert: alert.open,
    openConfirmDialog: confirmDialog.open,
    t,
  });

  const authCallbacks = useAuthCallbacks({
    user,
    openAlert: alert.open,
    t,
  });

  // -- 에러 이펙트 --
  useEffect(() => {
    if (!userError) return;
    alert.open(t('auth.errors.signIn.default'));
  }, [userError, alert.open, t]);

  useEffect(() => {
    if (!mandalartsError) return;
    alert.open(t('mandalart.errors.sync.default'));
    signOut();
  }, [mandalartsError, alert.open, signOut, t]);

  // -- Drawer 통합 콜백 --
  const handleSelectFromDrawer = useCallback(
    (mandalartId: string) => {
      mandalartCallbacks.onSelect(mandalartId);
      leftDrawer.close();
    },
    [mandalartCallbacks.onSelect, leftDrawer.close]
  );

  // -- confirmDialog 콜백 안정화 --
  const handleConfirmDialogConfirm = useCallback(() => {
    confirmDialog.content?.onConfirm();
    confirmDialog.close();
  }, [confirmDialog.content, confirmDialog.close]);

  return {
    user,
    onSignOut: authCallbacks.onSignOut,
    mandalart: {
      hasMandalarts,
      currentId: currentMandalartId,
      currentMeta: currentMandalartMeta,
      currentTopicTree,
      onMetaChange: mandalartCallbacks.onMetaChange,
      onTopicTreeChange: mandalartCallbacks.onTopicTreeChange,
      // onClick 핸들러로 직접 전달되므로 래핑하여 MouseEvent가 afterSuccess에 전달되지 않도록 함
      onCreate: () => mandalartCallbacks.onCreate(),
    },
    leftDrawer: {
      isOpen: leftDrawer.isOpen,
      open: leftDrawer.open,
      close: leftDrawer.close,
      onSelect: handleSelectFromDrawer,
      onDelete: mandalartCallbacks.onDelete,
      onRename: mandalartCallbacks.onRename,
      onReset: mandalartCallbacks.onReset,
      onCreate: () => mandalartCallbacks.onCreate(leftDrawer.close),
    },
    rightDrawer: {
      isOpen: rightDrawer.isOpen,
      open: rightDrawer.open,
      close: rightDrawer.close,
    },
    signInDialog: {
      isOpen: signInDialog.isOpen,
      open: signInDialog.open,
      close: signInDialog.close,
      onSignIn: authCallbacks.onSignIn,
    },
    alert: {
      isOpen: alert.isOpen,
      content: alert.content,
      close: alert.close,
    },
    confirmDialog: {
      isOpen: confirmDialog.isOpen,
      message: confirmDialog.content?.message ?? null,
      confirmText: confirmDialog.content?.confirmText ?? null,
      onConfirm: handleConfirmDialogConfirm,
      close: confirmDialog.close,
    },
  };
};
```

- [ ] **Step 5: `AppLayout.tsx` import 업데이트**

변경 전:
```ts
import useAppLayoutState from '@/hooks/useAppLayoutState';
import type { UserHandlers } from '@/hooks/useAppLayoutState';
```

변경 후:
```ts
import { useAppLayoutState } from '@/hooks/useAppLayoutState';
import type { UserHandlers } from '@/hooks/useAppLayoutState';
```

(named export로 전환했으므로)

- [ ] **Step 6: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useMandalartCallbacks.ts src/hooks/useAuthCallbacks.ts \
  src/hooks/useAppLayoutState.ts src/components/AppLayout.tsx
git commit -m "refactor: useAppLayoutState God Hook을 3파일로 분할"
```

---

## Task 8: default → named export 통일

모든 hooks 파일을 named export로 전환합니다. Task 3(Analytics 삭제)과 Task 7(`useAppLayoutState` named export)은 이미 완료되었으므로 나머지만 처리합니다.

**Files:**
- Modify: `src/hooks/useModal.ts` + 4개 사용처
- Modify: `src/hooks/useSwipeNavigation.ts` + 1개 사용처
- Modify: `src/hooks/useInfiniteScroll.ts` + 1개 사용처

- [ ] **Step 1: `useModal.ts`**

변경 전: `export default useModal;`
변경 후: `export { useModal };` (또는 선언부에서 `export const useModal = ...`)

사용처 업데이트:
- `src/hooks/useAppLayoutState.ts` — (이미 Task 7에서 named import으로 변경됨)
- `src/components/MandalartView.tsx:15` — `import useModal from` → `import { useModal } from`
- `src/components/MandalartListItem.tsx:7` — 동일 변경
- `src/components/TopicItem.tsx:7` — 동일 변경

- [ ] **Step 2: `useSwipeNavigation.ts`**

변경 전: `export default useSwipeNavigation;`
변경 후: 선언부에 `export` 추가, 하단 `export default` 제거

사용처:
- `src/components/MandalartFocusView.tsx:8` — `import useSwipeNavigation from` → `import { useSwipeNavigation } from`

- [ ] **Step 3: `useInfiniteScroll.ts`**

변경 전: `export default useInfiniteScroll;`
변경 후: 선언부에 `export` 추가, 하단 `export default` 제거

사용처:
- `src/components/OpenSourceLicensesPage.tsx:8` — `import useInfiniteScroll from` → `import { useInfiniteScroll } from`

- [ ] **Step 4: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useModal.ts src/hooks/useSwipeNavigation.ts \
  src/hooks/useInfiniteScroll.ts \
  src/components/MandalartView.tsx src/components/MandalartListItem.tsx \
  src/components/TopicItem.tsx src/components/MandalartFocusView.tsx \
  src/components/OpenSourceLicensesPage.tsx
git commit -m "refactor: hooks default export를 named export로 통일"
```

---

## Task 9: 스토어 TODO 주석 추가

Efficiency Review에서 발견된 스토어 개선 사항을 TODO 주석으로 남깁니다.

**Files:**
- Modify: `src/stores/useMandalartStore.ts`
- Modify: `src/stores/useLoadingStore.ts`

- [ ] **Step 1: `useMandalartStore.ts` TODO 주석**

`isAnyChanged` 함수 위에:
```ts
// TODO: createEmptyMeta()와 createEmptyTopicTree()가 매 호출마다 새 객체를 생성한 뒤
// JSON.stringify하므로, empty 상태의 JSON 문자열을 모듈 레벨에서 미리 캐싱하면
// 불필요한 객체 생성과 직렬화를 제거할 수 있다.
// 예: const EMPTY_META_JSON = JSON.stringify(createEmptyMeta());
```

`loadGuestMandalartMetas` 함수 위에:
```ts
// TODO: guest localStorage 데이터에 스키마 버전이 없음 (client-localstorage-schema).
// MandalartMeta/TopicNode 타입이 변경되면 기존 데이터와 호환되지 않을 수 있으므로
// 저장 형식에 version 필드를 추가하는 것을 고려.
```

- [ ] **Step 2: `useLoadingStore.ts` TODO 주석**

`Array.from(conditions.values()).includes(true)` 라인에:
```ts
// TODO: Array.from() 없이 iterator를 직접 순회하면 중간 배열 생성을 피할 수 있다.
// 현재 Map 크기가 2~3개이므로 실질적 영향은 미미함.
```

- [ ] **Step 3: 빌드 + 테스트 확인**

Run: `pnpm build && pnpm test`
Expected: 모두 통과

- [ ] **Step 4: Commit**

```bash
git add src/stores/useMandalartStore.ts src/stores/useLoadingStore.ts
git commit -m "docs: 스토어 개선 사항 TODO 주석 추가"
```

---

## 주의 사항

### 수동 검증 필요 항목

리팩토링은 동작을 변경하지 않지만, 다음 시나리오는 수동으로 확인합니다:

1. **만다라트 생성/삭제/리셋** — confirmDialog가 정상 동작하는지
2. **좌측 Drawer** — 선택 시 Drawer 닫힘 + 해당 만다라트 표시
3. **로그인/로그아웃** — 정상 흐름 + 에러 시 AlertDialog
4. **게스트 → 로그인 마이그레이션** — 게스트 데이터가 Firebase로 이전
5. **스와이프 네비게이션** — 포커스 뷰에서 상하좌우 + 대각선 스와이프

### 발견된 의외의 코드

- `useAppLayoutState.ts:142` — `(e as { code?: string })?.code` ad-hoc 타입 가드. Firebase의 `AuthError` 타입을 import하면 더 안전하나, 현재 동작에 문제 없으므로 이번 스코프에서는 유지.
