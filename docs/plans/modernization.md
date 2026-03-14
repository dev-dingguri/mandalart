# 만다라트 현대화 계획

> **브랜치:** `rewrite/incremental`
> **시작 상태:** CRA → Vite 6 + pnpm 마이그레이션 완료
> **목표 스택:** React 19, Tailwind CSS + shadcn/ui, Zustand, React Router v7, Firebase v11, Vitest

---

## 의존 관계 다이어그램

```
T1 (의존성 정리) ──────────────────────────────────────────────┐
T2 (lodash 제거) ──────────────────────────────────────────────┤
T3 (코드 위생) ────────────────────────────────────────────────┤
                                                               ├→ T16 (React 19) → T17 (최종 점검)
T4 (Tailwind 설정) → T5 (shadcn/ui 설정) ──┐                  │
                                            ├→ T8~T12 (UI) ───┤
T6 (Zustand) ──────────────────────────────────────────────────┤
T7 (React Router v7) ─────────────────────────────────────────┤
T13 (Firebase v11) ────────────────────────────────────────────┤
T14 (usehooks-ts 제거) ───────────────────────────────────────┤
T15 (Vitest) ──────────────────────────────────────────────────┘
```

**병렬 작업 가능 그룹:**
- T1, T2, T3 — 서로 독립
- T4→T5 와 T6, T7 — 서로 독립
- T8~T12 — T5 완료 후 서로 독립
- T13, T14, T15 — 서로 독립, UI 작업과도 독립

---

## 작업 목록

### T1: 불필요한 의존성 제거

**선행 조건:** 없음

3개 패키지를 제거하고, 사용하던 코드를 네이티브로 대체한다.

**제거 대상:**

| 패키지 | 사용 파일 | 대체 방법 |
|--------|----------|----------|
| `react-helmet-async` | `main.tsx`, `App.tsx` | index.html에 이미 메타 태그 존재. `document.title` 직접 설정 |
| `react-infinite-scroll-component` | `OpenSourceLicensesPage.tsx` | 네이티브 `IntersectionObserver` 또는 단순 pagination |
| `seamless-scroll-polyfill` | `TopicGrid.tsx` | `element.scrollIntoView()` 네이티브 API (모던 브라우저 지원) |

**작업 순서:**
- [ ] `react-helmet-async` 제거: `HelmetProvider` 래퍼 제거(main.tsx), `Helmet` 컴포넌트를 `useEffect` + `document.title`로 교체(App.tsx)
- [ ] `react-infinite-scroll-component` 제거: `OpenSourceLicensesPage.tsx`에서 `IntersectionObserver` 기반 구현으로 교체
- [ ] `seamless-scroll-polyfill` 제거: `TopicGrid.tsx`에서 `scrollIntoView` import를 네이티브 `element.scrollIntoView()`로 교체
- [ ] `pnpm remove react-helmet-async react-infinite-scroll-component seamless-scroll-polyfill @types/react-helmet-async`
- [ ] `pnpm build` 성공 확인

---

### T2: lodash → 네이티브 교체

**선행 조건:** 없음

lodash를 3곳에서만 사용하므로 네이티브로 교체한다.

| 파일 | 함수 | 대체 방법 |
|------|------|----------|
| `App.tsx` | `throttle` | 직접 구현 (10줄 이내) 또는 `requestAnimationFrame` |
| `MandalartView.tsx` | `cloneDeep` | `structuredClone()` (모던 브라우저 지원) |
| `useUserMandalarts.ts` | `isEqual` | `JSON.stringify()` 비교 (Snippet/TopicNode는 단순 구조) |

**작업 순서:**
- [ ] 3개 파일에서 lodash import를 네이티브 대체 코드로 교체
- [ ] `pnpm remove lodash @types/lodash`
- [ ] `pnpm build` 성공 확인

---

### T3: 코드 위생 정리

**선행 조건:** 없음

프로덕션 코드에 남아있는 디버그 코드와 불필요한 코드를 정리한다.

- [ ] `LoadingContext.tsx:52` — `console.log` 제거
- [ ] 소스 전체 TODO 주석 검토 및 정리 (`useUserMandalarts.ts`, `useUserTopicTree.ts`, `useUser.ts`)
- [ ] `pnpm build` 성공 확인

---

### T4: Tailwind CSS 설정

**선행 조건:** 없음

Tailwind CSS v4를 설치하고 기본 설정을 구성한다.

- [ ] `pnpm add -D tailwindcss @tailwindcss/vite`
- [ ] `vite.config.ts`에 Tailwind 플러그인 추가
- [ ] `src/index.css`에 `@import "tailwindcss"` 추가
- [ ] 테마 토큰 정의 (기존 MUI 테마 색상을 CSS 변수로 이식): primary, secondary, background, foreground 등
- [ ] `pnpm build` 성공 확인 (기존 MUI 스타일과 공존 가능한지)

---

### T5: shadcn/ui 설정

**선행 조건:** T4 (Tailwind CSS)

shadcn/ui를 초기화하고 기본 컴포넌트를 설치한다.

- [ ] `pnpm dlx shadcn@latest init` 실행 (components.json 생성)
- [ ] 디렉토리 구조 결정: `src/components/ui/`
- [ ] 기본 유틸리티 생성 확인: `src/lib/utils.ts` (cn 함수)
- [ ] 필요한 컴포넌트 설치: `button`, `dialog`, `input`, `select`, `toggle`, `toggle-group`, `drawer`, `separator`, `scroll-area`
- [ ] 샘플 컴포넌트로 렌더링 확인

---

### T6: Zustand 상태 관리 전환

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

- [ ] `pnpm add zustand`
- [ ] `useLoadingStore` 생성 — `LoadingContext` 대체 (가장 단순한 것부터)
- [ ] `useAuthStore` 생성 — 인증 관련 훅 통합
- [ ] `useMandalartStore` 생성 — 만다라트 CRUD + 선택 상태 통합
- [ ] Firebase SDK 초기화를 모듈 스코프로 이동 (Context 불필요 — `getAuth()` 등은 싱글톤)
- [ ] `contexts/` 디렉토리 제거, `main.tsx`에서 Provider 래퍼 제거
- [ ] 기존 커스텀 훅 파일 정리/제거
- [ ] `pnpm build` 성공 + 로그인/만다라트 CRUD 동작 확인

---

### T7: React Router v6 → v7

**선행 조건:** 없음

사용 범위가 3개 파일로 한정되어 있어 변경이 작다.

**현재 사용 API:**
- `App.tsx` — `BrowserRouter`, `Routes`, `Route`, `Navigate`
- `RightDrawer.tsx`, `OpenSourceLicensesPage.tsx` — `useNavigate`

- [ ] `pnpm add react-router@7` (react-router-dom은 react-router로 통합됨)
- [ ] `pnpm remove react-router-dom`
- [ ] import 경로 변경: `react-router-dom` → `react-router`
- [ ] `BrowserRouter` → `createBrowserRouter` + `RouterProvider` 패턴으로 전환 (선택)
- [ ] `pnpm build` 성공 + 라우팅(메인, OSS 페이지, 언어 전환) 동작 확인

---

### T8: UI 전환 — 레이아웃 컴포넌트

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
- [ ] `Header.tsx` — AppBar, Toolbar, Box, IconButton → Tailwind header
- [ ] `LeftDrawer.tsx` — Drawer, Box, Divider, List → shadcn Sheet + Tailwind
- [ ] `RightDrawer.tsx` — Drawer, Box, Divider, List, FormControl, Select → shadcn Sheet + Select
- [ ] `MainContent.tsx` — Box → Tailwind div
- [ ] `MainPage.tsx` — Box, CircularProgress → Tailwind + 커스텀 스피너
- [ ] `App.tsx` — ThemeProvider, CssBaseline → Tailwind 다크모드 (class 기반)
- [ ] `pnpm build` 성공 + 레이아웃 시각적 확인

---

### T9: UI 전환 — 다이얼로그/모달

**선행 조건:** T5 (shadcn/ui 설정)

MUI Dialog를 shadcn Dialog로 교체한다.

**대상 파일 (3개):**
- [ ] `Alert.tsx` — Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
- [ ] `SignInModal.tsx` — Dialog, DialogTitle, DialogContent, Button, Box, Typography, Divider
- [ ] `TextEditor.tsx` — Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, styled
- [ ] `pnpm build` 성공 + 모달 열기/닫기/입력 동작 확인

---

### T10: UI 전환 — 목록/토글/기타 컴포넌트

**선행 조건:** T5 (shadcn/ui 설정)

나머지 MUI 컴포넌트를 교체한다.

**대상:**
- [ ] `MandalartList.tsx` — List, ListItem, ListItemText, Divider, Typography → Tailwind 리스트
- [ ] `MandalartListItem.tsx` — ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Dialog → shadcn DropdownMenu + Dialog
- [ ] `MandalartViewToggle.tsx` — ToggleButton, ToggleButtonGroup → shadcn ToggleGroup
- [ ] `MandalartView.tsx` — Box, Typography → Tailwind
- [ ] `OpenSourceLicensesPage.tsx` — Box, Typography, Link, Divider, AppBar, Toolbar → Tailwind
- [ ] `pnpm build` 성공 + 해당 UI 동작 확인

---

### T11: UI 전환 — 만다라트 그리드 핵심 컴포넌트

**선행 조건:** T5 (shadcn/ui 설정)

만다라트의 핵심 그리드 컴포넌트를 Tailwind로 교체한다.

- [ ] `Mandalart.tsx` — Box → Tailwind grid
- [ ] `ZoomInMandalart.tsx` — Box → Tailwind grid
- [ ] `TopicGrid.tsx` — Box → Tailwind grid
- [ ] `TopicItem.tsx` — Box, Typography, styled → Tailwind
- [ ] `ItemGrid.tsx` — Box → Tailwind grid
- [ ] `SquareBox.tsx` — Box, styled → Tailwind aspect-square
- [ ] `MaxLinesTypography.tsx` — Typography, styled → Tailwind line-clamp
- [ ] `pnpm build` 성공 + 3×3 그리드 렌더링 + 텍스트 입력 동작 확인

---

### T12: MUI + Emotion 완전 제거

**선행 조건:** T8, T9, T10, T11 (모든 UI 전환 완료)

MUI 관련 의존성을 모두 제거하고 테마 시스템을 정리한다.

- [ ] `src/theme.ts` 삭제 (Tailwind CSS 변수로 대체 완료 상태여야 함)
- [ ] `pnpm remove @mui/material @emotion/react @emotion/styled`
- [ ] 남아있는 MUI import가 없는지 확인
- [ ] `pnpm build` 성공

---

### T13: Firebase SDK v9 → v11

**선행 조건:** 없음

이미 modular API를 사용 중이므로 버전만 올린다.

**사용 중인 Firebase 모듈:** `firebase/app`, `firebase/auth`, `firebase/database`, `firebase/analytics`

- [ ] `pnpm add firebase@latest`
- [ ] 주요 API 변경사항 확인 (v9 → v11 breaking changes)
- [ ] `pnpm build` 성공
- [ ] 로그인(Google OAuth), DB 읽기/쓰기, Analytics 이벤트 동작 확인

---

### T14: usehooks-ts 제거

**선행 조건:** 없음 (단, T6이 완료되면 작업량이 줄어듦)

usehooks-ts의 5개 훅을 직접 구현하거나 Zustand로 흡수한다.

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

| 작업 | 선행 조건 | 병렬 가능 대상 |
|------|----------|---------------|
| T1 | — | T2, T3, T4, T6, T7, T13, T14, T15 |
| T2 | — | T1, T3, T4, T6, T7, T13, T14, T15 |
| T3 | — | T1, T2, T4, T6, T7, T13, T14, T15 |
| T4 | — | T1, T2, T3, T6, T7, T13, T14, T15 |
| T5 | T4 | T6, T7, T13, T14, T15 |
| T6 | — | T1~T5, T7, T8~T11, T13, T15 |
| T7 | — | T1~T6, T8~T11, T13, T14, T15 |
| T8 | T5 | T9, T10, T11, T6, T7, T13, T14, T15 |
| T9 | T5 | T8, T10, T11, T6, T7, T13, T14, T15 |
| T10 | T5 | T8, T9, T11, T6, T7, T13, T14, T15 |
| T11 | T5 | T8, T9, T10, T6, T7, T13, T14, T15 |
| T12 | T8, T9, T10, T11 | — |
| T13 | — | T1~T11, T14, T15 |
| T14 | — (T6 완료 시 작업량 감소) | T1~T13, T15 |
| T15 | — | T1~T14 |
| T16 | T1~T15 | — |
| T17 | T16 | — |

---

## 검증 체크리스트 (모든 작업 공통)

각 작업 완료 후 반드시 확인:

1. `pnpm build` — 빌드 에러 없음
2. `pnpm dev` — 개발 서버 정상 실행
3. 해당 작업에서 변경한 기능의 브라우저 동작 확인
4. 콘솔에 새로운 에러/경고 없음
