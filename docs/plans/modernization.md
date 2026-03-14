# 만다라트 현대화 계획

> **브랜치:** `rewrite/incremental`
> **시작 상태:** CRA → Vite 6 + pnpm 마이그레이션 완료
> **목표 스택:** React 19, Tailwind CSS + shadcn/ui, Zustand, React Router v7, Firebase v11, Vitest

---

## 진행 상황 요약

> 마지막 업데이트: 2026-03-14 (T17 완료)

| 작업 | 상태 | 커밋 |
|------|------|------|
| T1: 불필요한 의존성 제거 | :white_check_mark: 완료 | `c4e7509` |
| T2: lodash 제거 | :white_check_mark: 완료 | `312a421` |
| T3: 코드 위생 정리 | :white_check_mark: 완료 | `d077d60` |
| T4: Tailwind CSS 설정 | :white_check_mark: 완료 | `acecf46`, `ec9f01c` |
| T5: shadcn/ui 설정 | :white_check_mark: 완료 | `d6526d6` |
| T6: Zustand 상태 관리 전환 | :white_check_mark: 완료 | `ed707ac` |
| T7: React Router v7 | :white_check_mark: 완료 | `196d92c` |
| T8: UI 전환 — 레이아웃 | :white_check_mark: 완료 | `54a11bf`, `8ab2890` |
| T9: UI 전환 — 다이얼로그/모달 | :white_check_mark: 완료 | `ecd7d9b` |
| T10: UI 전환 — 목록/토글/기타 | :white_check_mark: 완료 | `c42ec1c` |
| T11: UI 전환 — 만다라트 그리드 | :white_check_mark: 완료 | `afd3b8c` |
| T12: MUI + Emotion 완전 제거 | :white_check_mark: 완료 | — |
| T13: Firebase SDK v12 | :white_check_mark: 완료 | `b46fcaa` |
| T14: usehooks-ts 제거 | :white_check_mark: 완료 | `20a3182`, `2d6b06f` |
| T15: Vitest 테스트 도입 | :white_check_mark: 완료 | `6376c1c`, `2edce63` |
| T16: React 19 | :white_check_mark: 완료 | — |
| T17: 번들 최적화 + 최종 점검 | :white_check_mark: 완료 | — |
| B1: 프리뷰 채널 로그인 실패 | :warning: 분석 완료, 수정 보류 | `16cf5f2` |
| B2: 확대 뷰 센터링 미동작 | :x: 미착수 | — |

**다음 작업 후보:** B2 (확대 뷰 센터링 미동작) 또는 방식 C 검토 (i18n lazy loading, Firebase 청크 분리)

---

## 의존 관계 다이어그램

```
T1 (의존성 정리) ✅ ────────────────────────────────────────────┐
T2 (lodash 제거) ✅ ────────────────────────────────────────────┤
T3 (코드 위생) ✅ ──────────────────────────────────────────────┤
                                                                ├→ T16 (React 19) → T17 (최종 점검)
T4 (Tailwind 설정) ✅ → T5 (shadcn/ui 설정) ✅ ──┐             │
                                                  ├→ T8~T12 ✅ ─┤
T6 (Zustand) ✅ ────────────────────────────────────────────────┤
T7 (React Router v7) ✅ ───────────────────────────────────────┤
T13 (Firebase v12) ✅ ──────────────────────────────────────────┤
T14 (usehooks-ts 제거) ✅ ─────────────────────────────────────┤
T15 (Vitest) ✅ ────────────────────────────────────────────────┘
```

**병렬 작업 가능 그룹:**
- T1, T2, T3 — 서로 독립
- T4→T5 와 T6, T7 — 서로 독립
- T8~T12 — T5 완료 후 서로 독립
- T13, T14, T15 — 서로 독립, UI 작업과도 독립

---

## 작업 목록

### T1: 불필요한 의존성 제거 :white_check_mark:

**선행 조건:** 없음

3개 패키지를 제거하고, 사용하던 코드를 네이티브로 대체한다.

**제거 대상:**

| 패키지 | 사용 파일 | 대체 방법 |
|--------|----------|----------|
| `react-helmet-async` | `main.tsx`, `App.tsx` | index.html에 이미 메타 태그 존재. `document.title` 직접 설정 |
| `react-infinite-scroll-component` | `OpenSourceLicensesPage.tsx` | 네이티브 `IntersectionObserver` 또는 단순 pagination |
| `seamless-scroll-polyfill` | `TopicGrid.tsx` | `element.scrollIntoView()` 네이티브 API (모던 브라우저 지원) |

**작업 순서:**
- [x] `react-helmet-async` 제거: `HelmetProvider` 래퍼 제거(main.tsx), `Helmet` 컴포넌트를 `useEffect` + `document.title`로 교체(App.tsx)
- [x] `react-infinite-scroll-component` 제거: `OpenSourceLicensesPage.tsx`에서 `IntersectionObserver` 기반 구현으로 교체
- [x] `seamless-scroll-polyfill` 제거: `TopicGrid.tsx`에서 `scrollIntoView` import를 네이티브 `element.scrollIntoView()`로 교체
- [x] `pnpm remove react-helmet-async react-infinite-scroll-component seamless-scroll-polyfill @types/react-helmet-async`
- [x] `pnpm build` 성공 확인

---

### T2: lodash → 네이티브 교체 :white_check_mark:

**선행 조건:** 없음

lodash를 3곳에서만 사용하므로 네이티브로 교체한다.

| 파일 | 함수 | 대체 방법 |
|------|------|----------|
| `App.tsx` | `throttle` | 직접 구현 (10줄 이내) 또는 `requestAnimationFrame` |
| `MandalartView.tsx` | `cloneDeep` | `structuredClone()` (모던 브라우저 지원) |
| `useUserMandalarts.ts` | `isEqual` | `JSON.stringify()` 비교 (Snippet/TopicNode는 단순 구조) |

**작업 순서:**
- [x] 3개 파일에서 lodash import를 네이티브 대체 코드로 교체
- [x] `pnpm remove lodash @types/lodash`
- [x] `pnpm build` 성공 확인

---

### T3: 코드 위생 정리 :white_check_mark:

**선행 조건:** 없음

프로덕션 코드에 남아있는 디버그 코드와 불필요한 코드를 정리한다.

- [x] `LoadingContext.tsx:52` — `console.log` 제거
- [x] 소스 전체 TODO 주석 검토 및 정리 (`useUserMandalarts.ts`, `useUserTopicTree.ts`, `useUser.ts`)
- [x] `pnpm build` 성공 확인

---

### T4: Tailwind CSS 설정 :white_check_mark:

**선행 조건:** 없음

Tailwind CSS v4를 설치하고 기본 설정을 구성한다.

- [x] `pnpm add -D tailwindcss @tailwindcss/vite`
- [x] `vite.config.ts`에 Tailwind 플러그인 추가
- [x] `src/index.css`에 `@import "tailwindcss"` 추가
- [x] 테마 토큰 정의 (기존 MUI 테마 색상을 CSS 변수로 이식): primary, secondary, background, foreground 등
- [x] `pnpm build` 성공 확인 (기존 MUI 스타일과 공존 가능한지)

**테마 방향 결정:** shadcn/ui 공식 Zinc 테마 (기본값)
- 현재 `index.css`의 `:root` / `.dark` 블록이 이미 공식 테마 적용 상태
- 기존 MUI 색상(`--color-app-*`)은 참고하지 않음
- MUI 제거 완료 시(T12) `--color-app-*` 커스텀 변수를 제거하고 shadcn 토큰으로 통합

---

### T5: shadcn/ui 설정 :white_check_mark:

**선행 조건:** T4 (Tailwind CSS)

shadcn/ui를 초기화하고 기본 컴포넌트를 설치한다.

- [x] `pnpm dlx shadcn@latest init` 실행 (components.json 생성)
- [x] 디렉토리 구조 결정: `src/components/ui/`
- [x] 기본 유틸리티 생성 확인: `src/lib/utils.ts` (cn 함수)
- [x] 필요한 컴포넌트 설치: `button`, `dialog`, `input`, `select`, `toggle`, `toggle-group`, `drawer`, `separator`, `scroll-area`
- [x] 샘플 컴포넌트로 렌더링 확인

---

### T6: Zustand 상태 관리 전환 :white_check_mark:

**선행 조건:** 없음

Context API 기반 상태 관리를 Zustand 스토어로 전환한다.

**현재 상태 관리 구조:**
- `FirebaseSdksContext` — Firebase SDK 인스턴스 제공 (Auth, Database, Analytics)
- `LoadingContext` — 다중 로딩 조건 추적 (Map 기반)
- 14개 커스텀 훅 — 인증, DB, 만다라트 CRUD, 게스트/유저 분기

**전환 계획:**

| 스토어 | 대체 대상 | 주요 상태 |
|--------|----------|----------|
| `useAuthStore` | `useUser.ts`, `useAuth.ts`, `useSignInSession.ts` | user, isSignedIn, signIn/signOut |
| `useMandalartStore` | `useUserMandalarts.ts`, `useGuestMandalarts.ts`, `useMandalartSelector.ts` | snippets, selectedId, CRUD actions |
| `useLoadingStore` | `LoadingContext.tsx` | conditions Map, isLoading |

- [x] `pnpm add zustand`
- [x] `useLoadingStore` 생성 — `LoadingContext` 대체 (가장 단순한 것부터)
- [x] `useAuthStore` 생성 — 인증 관련 훅 통합
- [x] `useMandalartStore` 생성 — 만다라트 CRUD + 선택 상태 통합
- [x] Firebase SDK 초기화를 모듈 스코프로 이동 (Context 불필요 — `getAuth()` 등은 싱글톤)
- [x] `contexts/` 디렉토리 제거, `main.tsx`에서 Provider 래퍼 제거
- [x] 기존 커스텀 훅 파일 정리/제거
- [x] `pnpm build` 성공 + 로그인/만다라트 CRUD 동작 확인

---

### T7: React Router v6 → v7 :white_check_mark:

**선행 조건:** 없음

사용 범위가 3개 파일로 한정되어 있어 변경이 작다.

**현재 사용 API:**
- `App.tsx` — `BrowserRouter`, `Routes`, `Route`, `Navigate`
- `RightDrawer.tsx`, `OpenSourceLicensesPage.tsx` — `useNavigate`

- [x] `pnpm add react-router@7` (react-router-dom은 react-router로 통합됨)
- [x] `pnpm remove react-router-dom`
- [x] import 경로 변경: `react-router-dom` → `react-router`
- [x] `BrowserRouter` → `createBrowserRouter` + `RouterProvider` 패턴으로 전환 (선택)
- [x] `pnpm build` 성공 + 라우팅(메인, OSS 페이지, 언어 전환) 동작 확인

---

### T8: UI 전환 — 레이아웃 컴포넌트 :white_check_mark:

**선행 조건:** T5 (shadcn/ui 설정)

MUI의 레이아웃 관련 컴포넌트를 Tailwind + shadcn/ui로 교체한다.

**대상 컴포넌트 (사용 빈도순):**
- `Box` (12개 파일) → Tailwind `div` + 클래스
- `AppBar` + `Toolbar` (3개 파일) → Tailwind `header`/`nav`
- `Drawer` (2개 파일) → shadcn `Drawer` 또는 `Sheet`
- `Divider` (5개 파일) → shadcn `Separator`
- `CssBaseline` (1개 파일) → Tailwind preflight (자동 포함)
- `Grid` / `Unstable_Grid2` (1개 파일) → Tailwind grid/flex

**대상 파일:**
- [x] `Header.tsx` — AppBar, Toolbar, Box, IconButton → Tailwind header
- [x] `LeftDrawer.tsx` — Drawer, Box, Divider, List → shadcn Sheet + Tailwind
- [x] `RightDrawer.tsx` — Drawer, Box, Divider, List, FormControl, Select → shadcn Sheet + Select
- [x] `MainContent.tsx` — Box → Tailwind div
- [x] `MainPage.tsx` — Box, CircularProgress → Tailwind + 커스텀 스피너
- [x] `App.tsx` — ThemeProvider, CssBaseline → Tailwind 다크모드 (class 기반) *(ThemeProvider 잔존 — T12에서 제거)*
- [x] `pnpm build` 성공 + 레이아웃 시각적 확인

---

### T9: UI 전환 — 다이얼로그/모달 :white_check_mark:

**선행 조건:** T5 (shadcn/ui 설정)

MUI Dialog를 shadcn Dialog로 교체한다.

**대상 파일 (3개):**
- [x] `Alert.tsx` — Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
- [x] `SignInModal.tsx` — Dialog, DialogTitle, DialogContent, Button, Box, Typography, Divider
- [x] `TextEditor.tsx` — Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, styled
- [x] `pnpm build` 성공 + 모달 열기/닫기/입력 동작 확인

---

### T10: UI 전환 — 목록/토글/기타 컴포넌트 :white_check_mark:

**선행 조건:** T5 (shadcn/ui 설정)

나머지 MUI 컴포넌트를 교체한다.

**대상:**
- [x] `MandalartList.tsx` — List, ListItem, ListItemText, Divider, Typography → Tailwind 리스트
- [x] `MandalartListItem.tsx` — ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Dialog → shadcn DropdownMenu + Dialog
- [x] `MandalartViewToggle.tsx` — ToggleButton, ToggleButtonGroup → shadcn ToggleGroup
- [x] `MandalartView.tsx` — Box, Typography → Tailwind
- [x] `OpenSourceLicensesPage.tsx` — Box, Typography, Link, Divider, AppBar, Toolbar → Tailwind
- [x] `pnpm build` 성공 + 해당 UI 동작 확인

---

### T11: UI 전환 — 만다라트 그리드 핵심 컴포넌트 :white_check_mark:

**선행 조건:** T5 (shadcn/ui 설정)

만다라트의 핵심 그리드 컴포넌트를 Tailwind로 교체한다.

- [x] `Mandalart.tsx` — Box → Tailwind grid
- [x] `ZoomInMandalart.tsx` — Box → Tailwind grid
- [x] `TopicGrid.tsx` — Box → Tailwind grid
- [x] `TopicItem.tsx` — Box, Typography, styled → Tailwind
- [x] `ItemGrid.tsx` — Box → Tailwind grid
- [x] `SquareBox.tsx` — Box, styled → Tailwind aspect-square
- [x] `MaxLinesTypography.tsx` — Typography, styled → Tailwind line-clamp
- [x] `pnpm build` 성공 + 3×3 그리드 렌더링 + 텍스트 입력 동작 확인

---

### T12: MUI + Emotion 완전 제거

**선행 조건:** T8, T9, T10, T11 (모든 UI 전환 완료) — ✅ 선행 조건 충족

MUI 관련 의존성을 모두 제거하고 테마 시스템을 정리한다.

**현재 잔존 MUI 사용처:**
- `src/App.tsx` — `ThemeProvider` import (`@mui/material/styles`)
- `src/theme.ts` — MUI 테마 정의 파일 전체

- [ ] `src/theme.ts` 삭제 (Tailwind CSS 변수로 대체 완료 상태여야 함)
- [ ] `App.tsx`에서 `ThemeProvider` import 및 래퍼 제거
- [ ] `pnpm remove @mui/material @emotion/react @emotion/styled`
- [ ] 남아있는 MUI import가 없는지 확인
- [ ] `pnpm build` 성공

---

### T13: Firebase SDK v9 → v12 :white_check_mark:

**선행 조건:** 없음

이미 modular API를 사용 중이므로 버전만 올린다.

**사용 중인 Firebase 모듈:** `firebase/app`, `firebase/auth`, `firebase/database`, `firebase/analytics`

- [x] `pnpm add firebase@latest`
- [x] 주요 API 변경사항 확인 (v9 → v11 breaking changes)
- [x] `pnpm build` 성공
- [x] 로그인(Google OAuth), DB 읽기/쓰기, Analytics 이벤트 동작 확인

---

### T14: usehooks-ts 제거

**선행 조건:** 없음 (단, T6이 완료되면 작업량이 줄어듦) — ✅ T6 완료

usehooks-ts의 5개 훅을 직접 구현하거나 Zustand로 흡수한다.

**현재 잔존 사용처:** `MainContent.tsx`, `RightDrawer.tsx`, `App.tsx` (3개 파일)

| 훅 | 사용 파일 수 | 대체 방법 |
|----|-----------|----------|
| `useBoolean` | 4 | `useState<boolean>` |
| `useLocalStorage` | 2 | T6에서 Zustand persist 미들웨어로 대체 |
| `useSessionStorage` | 1 | T6에서 Zustand persist 미들웨어로 대체 |
| `useEventListener` | 2 | `useEffect` + `addEventListener` |
| `useTernaryDarkMode` | 2 | Zustand 테마 스토어 또는 커스텀 훅 |
| `useMediaQuery` | 1 | Tailwind 반응형으로 대체 또는 `matchMedia` 직접 사용 |

- [ ] 각 훅을 네이티브 또는 Zustand로 교체
- [ ] `pnpm remove usehooks-ts`
- [ ] `pnpm build` 성공 + 다크모드 전환, 게스트 데이터 저장 동작 확인

---

### T15: Vitest 테스트 도입

**선행 조건:** 없음

테스트 프레임워크를 설정하고 핵심 로직에 대한 단위 테스트를 작성한다.

- [ ] `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `vite.config.ts`에 test 설정 추가
- [ ] 유틸리티 테스트: TopicNode 생성, Snippet 유효성 검증
- [ ] 스토어 테스트: Zustand 스토어 단위 테스트 (T6 완료 시)
- [ ] 컴포넌트 테스트: 만다라트 그리드 렌더링 테스트
- [ ] `pnpm test` 전체 통과 확인

---

### T16: React 18 → 19

**선행 조건:** T1~T15 전체 완료 (MUI 제거 필수)

MUI가 완전히 제거된 후 React 19로 업그레이드한다.

- [ ] `pnpm add react@19 react-dom@19`
- [ ] `pnpm add -D @types/react@19 @types/react-dom@19`
- [ ] 주요 breaking changes 대응:
  - `forwardRef` → ref를 일반 prop으로 전달
  - `useContext` → `use(Context)` (선택적)
  - `ReactNode` 타입 변경 확인
- [ ] 의존 라이브러리 React 19 호환성 확인 (react-router, i18next, firebase 등)
- [ ] `pnpm build` 성공 + 전체 기능 동작 확인

---

### T17: 번들 최적화 + 최종 점검

**선행 조건:** T16 (React 19)

- [ ] 번들 분석: `pnpm add -D rollup-plugin-visualizer` → 번들 크기 확인
- [ ] 코드 스플리팅: `React.lazy` + `Suspense`로 OSS 페이지 분리
- [ ] `pnpm build` 후 번들 크기가 현재(~979KB)보다 감소했는지 확인
- [ ] 전체 기능 수동 검증 체크리스트:
  - 메인 페이지 렌더링
  - 만다라트 생성/수정/삭제
  - Google 로그인/로그아웃
  - 게스트 → 회원 데이터 업로드
  - 다크/라이트/시스템 테마 전환
  - 언어 전환 (ko/en/ja/zh-CN)
  - 모바일 반응형
- [ ] CLAUDE.md 업데이트 (새로운 기술 스택 반영)

---

## 작업별 병렬 가능 여부 요약

| 작업 | 선행 조건 | 병렬 가능 대상 | 상태 |
|------|----------|---------------|------|
| T1 | — | T2, T3, T4, T6, T7, T13, T14, T15 | :white_check_mark: |
| T2 | — | T1, T3, T4, T6, T7, T13, T14, T15 | :white_check_mark: |
| T3 | — | T1, T2, T4, T6, T7, T13, T14, T15 | :white_check_mark: |
| T4 | — | T1, T2, T3, T6, T7, T13, T14, T15 | :white_check_mark: |
| T5 | T4 | T6, T7, T13, T14, T15 | :white_check_mark: |
| T6 | — | T1~T5, T7, T8~T11, T13, T15 | :white_check_mark: |
| T7 | — | T1~T6, T8~T11, T13, T14, T15 | :white_check_mark: |
| T8 | T5 | T9, T10, T11, T6, T7, T13, T14, T15 | :white_check_mark: |
| T9 | T5 | T8, T10, T11, T6, T7, T13, T14, T15 | :white_check_mark: |
| T10 | T5 | T8, T9, T11, T6, T7, T13, T14, T15 | :white_check_mark: |
| T11 | T5 | T8, T9, T10, T6, T7, T13, T14, T15 | :white_check_mark: |
| T12 | T8, T9, T10, T11 | — | :white_check_mark: |
| T13 | — | T1~T11, T14, T15 | :white_check_mark: |
| T14 | — (T6 완료 시 작업량 감소) | T1~T13, T15 | :white_check_mark: |
| T15 | — | T1~T14 | :white_check_mark: |
| T16 | T1~T15 | — | ⬜ |
| T17 | T16 | — | ⬜ |

---

## 버그 수정

### B1: Firebase 프리뷰 채널에서 Google 로그인 실패 :warning:

**선행 조건:** 없음 (현대화 작업과 독립)
**우선순위:** 높음 — 프리뷰 채널에서 QA 불가
**상태:** 분석 완료, 수정 시도 후 Revert — 보류 중

**현상:**
- Firebase Hosting 프리뷰 채널(`mandalart-94631--preview-xxx.web.app`)에서 Google 로그인 시 실패
- 콘솔에 에러 없음 — `getRedirectResult()`가 `null`로 resolve되어 조용히 실패
- 프로덕션(`mandalart-94631.web.app`)에서는 정상 동작

**추정 원인 (미확인):**
- `signInWithRedirect` 사용 시, 앱 origin과 `authDomain`이 다른 cross-origin 환경에서 브라우저의 스토리지 파티셔닝(Chrome 115+)으로 인해 인증 credential이 유실되는 것으로 추정
- 승인된 도메인(Authorized Domains)에는 프리뷰 채널 도메인이 등록되어 있음을 확인 → 도메인 승인 문제는 아님
- **정확한 원인을 확인하려면**: 프리뷰 채널에서 `getRedirectResult(auth)`의 반환값과 `auth.currentUser`를 로깅하여 실제 동작 확인 필요

**해결 방안:**
- `signInWithRedirect` → `signInWithPopup` 우선 방식으로 전환
- Popup은 새 창에서 인증 후 `postMessage`로 결과를 전달하므로 cross-origin 스토리지 문제를 우회
- 팝업 차단 시 `signInWithRedirect`로 폴백

**작업 순서:**
- [x] 프리뷰 채널에서 `getRedirectResult` 반환값 로깅으로 원인 확정 — `16cf5f2`에서 분석 문서 작성
- [x] `signInWithPopup` 우선 + `signInWithRedirect` 폴백 방식으로 수정 시도 (`d326b79`)
- [x] Revert (`eb5d43c`) — Revert 사유 확인 필요
- [ ] 근본 원인 해결 후 재적용
- [ ] 프로덕션 환경에서 로그인 정상 동작 확인
- [ ] 프리뷰 채널 재배포 후 로그인 정상 동작 확인

**참고:** 이전에 `signInWithPopup` 우선 방식으로 변경(d326b79)했다가 Revert(eb5d43c)한 이력 있음. Revert 사유 확인 후 진행할 것.

---

### B2: 확대 뷰(ZoomInMandalart) 센터링 미동작

**선행 조건:** 없음 (T11과 독립)
**우선순위:** 중간 — 확대 뷰 사용성 저하
**상태:** 미착수

**현상:**
- 확대 뷰 진입 시 포커스된 셀 그룹(TopicGrid)이 화면 중앙에 위치하지 않음
- 스와이프로 `focusedIdx` 변경 후에도 센터링 안 됨
- MUI 전환 이전(원본 코드)에서도 동일 현상인지 확인 필요

**추정 원인:**
- `TopicGrid`의 `scrollIntoView({ block: 'center', inline: 'center' })`가 `overflow: hidden` 컨테이너에서 정상 동작하지 않는 것으로 추정
- 절대 위치(absolute) 자식이 부모의 `scrollWidth`/`scrollHeight`에 기여하지 않아 스크롤 영역이 0일 가능성
- `useLayoutEffect` + 직접 `scroll()` 계산 방식도 시도했으나 동일 현상

**시도한 접근:**
1. SquareBox를 `aspect-square` 단일 div로 단순화
2. ZoomInMandalart에서 SquareBox 제거 → `aspect-square overflow-hidden` 컨테이너 + `w-[240%]` normal flow 자식
3. `useLayoutEffect`로 `focusedIdx` 기반 스크롤 위치 직접 계산
4. 위 모든 접근에서 동일하게 센터링 미동작 → 롤백

**작업 순서:**
- [ ] MUI 전환 이전 코드에서 센터링 정상 동작 여부 확인 (git stash로 비교)
- [ ] 브라우저 DevTools에서 `scrollWidth`, `scrollHeight`, `clientWidth` 값 확인
- [ ] `scrollIntoView` 호출 시 실제 스크롤 발생 여부 콘솔 로깅
- [ ] 필요 시 `scrollIntoView` 대신 직접 `scrollLeft`/`scrollTop` 계산 방식으로 전환

---

## 기술 부채

### TD1: 불필요한 `import React` default import 잔존 :white_check_mark:

**발견:** T17 코드 리뷰 (2026-03-14)
**완료:** 2026-03-14
**우선순위:** 낮음 — 기능 영향 없음, 코드 위생 문제

**대상 파일:**
- `src/components/MandalartListItem.tsx` — 1번 줄 `import React from 'react'`
- `src/components/MandalartList.tsx` — 1번 줄 `import React from 'react'`
- `src/components/ZoomInMandalart.tsx` — 1번 줄 `import React, { ... }` (default import 불필요, named import만 사용)

**내용:** React 17+ JSX transform 이후 JSX 변환에 `React`를 명시적으로 import할 필요가 없다. 세 파일 모두 `React.` 네임스페이스를 직접 사용하지 않으므로 default import를 제거해야 한다.

**수정 방법:** 각 파일에서 `import React from 'react'`의 default import 부분을 제거하고 named import만 유지.

---

### TD2: 소셜 아이콘 접근성 미흡 (RightDrawer)

**발견:** T17 코드 리뷰 (2026-03-14)
**우선순위:** 낮음 — 시각 사용자에겐 기능 이상 없음

**대상 파일:** `src/components/RightDrawer.tsx`

**내용:** YouTube, GitHub 아이콘(`Youtube`, `Github` lucide 컴포넌트)이 `onClick` 핸들러를 직접 달고 인터랙티브 요소로 사용되지만, `<button>` 래퍼와 `aria-label`이 없어 스크린 리더에서 접근 불가.

**수정 방법:** SVG 아이콘을 `<button aria-label="YouTube 채널로 이동">` 등의 래퍼로 감싸거나, shadcn `Button` 컴포넌트 (`variant="ghost" size="icon"`)로 교체.

---

## 검증 체크리스트 (모든 작업 공통)

각 작업 완료 후 반드시 확인:

1. `pnpm build` — 빌드 에러 없음
2. `pnpm dev` — 개발 서버 정상 실행
3. 해당 작업에서 변경한 기능의 브라우저 동작 확인
4. 콘솔에 새로운 에러/경고 없음
