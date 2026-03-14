# T17 번들 최적화 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `react-icons`를 `lucide-react`로 교체하고 OSS 페이지를 코드 스플리팅하여 번들 크기를 줄인다.

**Architecture:** 8개 파일에서 react-icons 아이콘을 lucide-react 동등 아이콘으로 교체 후 패키지 제거. `App.tsx`에서 `OpenSourceLicensesPage`를 `React.lazy`로 분리. `rollup-plugin-visualizer`로 번들 분석 후 도구 제거.

**Tech Stack:** React 19, Vite 6, lucide-react ^0.577.0 (이미 설치됨), rollup-plugin-visualizer (dev, 임시)

**Spec:** `docs/superpowers/specs/2026-03-14-t17-bundle-optimization-design.md`

---

## Chunk 1: react-icons → lucide-react 교체

### Task 1: main.tsx — IconContext 제거

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: `IconContext` import 및 Provider 래퍼 제거**

`src/main.tsx`를 아래와 같이 수정한다:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import 'locales/i18n';
import 'stores/useAuthStore';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: 타입스크립트 컴파일 확인**

```bash
pnpm tsc --noEmit
```

Expected: 에러 없음

---

### Task 2: Header.tsx — BsList, BsThreeDots 교체

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsList, BsThreeDots } from 'react-icons/bs';

// After
import { Menu, MoreHorizontal } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체**

```tsx
// Before
<BsList className="size-5" />

// After
<Menu className="size-5" />
```

```tsx
// Before
<BsThreeDots className="size-5" />

// After
<MoreHorizontal className="size-5" />
```

---

### Task 3: LeftDrawer.tsx — BsPlus 교체

**Files:**
- Modify: `src/components/LeftDrawer.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsPlus } from 'react-icons/bs';

// After
import { Plus } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체**

```tsx
// Before
<BsPlus className="size-5" />

// After
<Plus className="size-5" />
```

---

### Task 4: MainContent.tsx — BsPlus 교체

**Files:**
- Modify: `src/components/MainContent.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsPlus } from 'react-icons/bs';

// After
import { Plus } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체 (line 146)**

```tsx
// Before
<BsPlus className="size-8" />

// After
<Plus className="size-8" />
```

---

### Task 5: MandalartListItem.tsx — BsGrid3X3, BsThreeDots 교체

**Files:**
- Modify: `src/components/MandalartListItem.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';

// After
import { LayoutGrid, MoreHorizontal } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체**

```tsx
// Before
<BsGrid3X3 className="shrink-0 text-muted-foreground" />

// After
<LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
```

> 참고: lucide-react 기본 크기는 24px이다. 리스트 아이템 맥락에서 `size-4`(16px)가 적절하다. 빌드 후 시각적으로 확인하여 조정할 것.

```tsx
// Before
<BsThreeDots />

// After
<MoreHorizontal className="size-4" />
```

---

### Task 6: MandalartViewToggle.tsx — BsFullscreen 교체

**Files:**
- Modify: `src/components/MandalartViewToggle.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsFullscreen } from 'react-icons/bs';

// After
import { Maximize2 } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체**

```tsx
// Before
<BsFullscreen />

// After
<Maximize2 />
```

> 참고: 부모 Toggle에 `[&_svg]:size-5` 클래스가 있어 SVG 크기를 자동으로 적용한다. 별도 size 지정 불필요.

---

### Task 7: OpenSourceLicensesPage.tsx — BsChevronLeft 교체

**Files:**
- Modify: `src/components/OpenSourceLicensesPage.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsChevronLeft } from 'react-icons/bs';

// After
import { ChevronLeft } from 'lucide-react';
```

- [ ] **Step 2: JSX에서 `BsChevronLeft` → `ChevronLeft`로 교체** (파일 내 모든 사용처)

---

### Task 8: RightDrawer.tsx — BsGithub, BsYoutube, BsChevronDown 교체

**Files:**
- Modify: `src/components/RightDrawer.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before
import { BsGithub, BsYoutube, BsChevronDown } from 'react-icons/bs';

// After
import { Github, Youtube, ChevronDown } from 'lucide-react';
```

- [ ] **Step 2: JSX 교체**

```tsx
// Before
<BsYoutube
  className="size-6 cursor-pointer hover:text-foreground"
  onClick={...}
/>
<BsGithub
  className="size-6 cursor-pointer hover:text-foreground"
  onClick={...}
/>

// After
<Youtube
  className="size-6 cursor-pointer hover:text-foreground"
  onClick={...}
/>
<Github
  className="size-6 cursor-pointer hover:text-foreground"
  onClick={...}
/>
```

```tsx
// Before
<BsChevronDown
  className={`size-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
/>

// After
<ChevronDown
  className={`size-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
/>
```

---

### Task 9: react-icons 제거 + 빌드 확인

- [ ] **Step 1: react-icons 패키지 제거**

```bash
pnpm remove react-icons
```

- [ ] **Step 2: react-icons 잔존 import 없는지 확인**

```bash
grep -r "react-icons" src/ --include="*.tsx" --include="*.ts"
```

Expected: 출력 없음 (잔존 import 없음)

- [ ] **Step 3: `src/index.css`의 `.react-icons` 규칙 제거**

`src/index.css` 하단의 아래 3줄을 삭제한다:

```css
.react-icons {
  font-size: inherit;
}
```

- [ ] **Step 4: `openSourceLicenses.json`에서 react-icons 항목 제거**

`src/assets/data/openSourceLicenses.json`에서 아래 항목을 삭제한다:

```json
"react-icons@4.11.0": {
  "licenses": "MIT",
  "repository": "https://github.com/react-icons/react-icons",
  "name": "react-icons"
},
```

- [ ] **Step 6: 빌드 확인**

```bash
pnpm build
```

Expected: 에러 없음, `build/` 디렉토리 생성

- [ ] **Step 7: 커밋**

```bash
git add src/main.tsx src/components/Header.tsx src/components/LeftDrawer.tsx src/components/MainContent.tsx src/components/MandalartListItem.tsx src/components/MandalartViewToggle.tsx src/components/OpenSourceLicensesPage.tsx src/components/RightDrawer.tsx src/index.css src/assets/data/openSourceLicenses.json
git commit -m "refactor(T17): react-icons → lucide-react 교체, 데드코드 정리"
```

그 다음:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(T17): react-icons 의존성 제거"
```

---

## Chunk 2: OSS 페이지 코드 스플리팅 + 번들 분석

### Task 10: App.tsx — OpenSourceLicensesPage React.lazy 적용

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: import 교체**

```tsx
// Before (line 1)
import { useEffect, useState, useLayoutEffect } from 'react';
import OpenSourceLicensesPage from 'components/OpenSourceLicensesPage';

// After
import { lazy, Suspense, useEffect, useState, useLayoutEffect } from 'react';

const OpenSourceLicensesPage = lazy(
  () => import('components/OpenSourceLicensesPage')
);
```

> React 19 스타일: `React.lazy` / `React.Suspense` 네임스페이스 대신 named import 사용. App.tsx에 `import React` default import가 없으므로 반드시 named import 방식을 써야 한다.

- [ ] **Step 2: Route를 Suspense로 감싸기**

```tsx
// Before
<Route
  path={`/${lang}${PATH_OSS}`}
  element={<OpenSourceLicensesPage />}
/>

// After
<Route
  path={`/${lang}${PATH_OSS}`}
  element={
    <Suspense fallback={null}>
      <OpenSourceLicensesPage />
    </Suspense>
  }
/>
```

- [ ] **Step 3: 빌드 확인**

```bash
pnpm build
```

Expected: 에러 없음. 빌드 결과에 `OpenSourceLicensesPage`가 별도 청크로 분리되는지 출력에서 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/App.tsx
git commit -m "feat(T17): OSS 페이지 React.lazy 코드 스플리팅 적용"
```

---

### Task 11: 번들 분석 (임시)

**Files:**
- Modify: `vite.config.ts` (임시, 분석 후 원복)

- [ ] **Step 1: rollup-plugin-visualizer 설치**

```bash
pnpm add -D rollup-plugin-visualizer
```

- [ ] **Step 2: vite.config.ts에 플러그인 임시 추가**

```ts
// 상단에 추가
import { visualizer } from 'rollup-plugin-visualizer';

// plugins 배열에 추가
plugins: [react(), tsconfigPaths(), tailwindcss(), visualizer({ open: false, filename: 'stats.html' })],
```

- [ ] **Step 3: 빌드 실행**

```bash
pnpm build
```

- [ ] **Step 4: 번들 크기 확인**

빌드 출력에서 `dist/assets/*.js` 크기 확인. 기존 ~979KB 대비 감소 여부 기록.

`stats.html` 파일을 브라우저에서 열어 의존성 비중 분석 (대용량 의존성 파악).

- [ ] **Step 5: visualizer 제거 (원복)**

`vite.config.ts`에서 `visualizer` import 줄과 플러그인 호출을 **모두** 제거한다. 패키지도 함께 삭제:

```bash
pnpm remove rollup-plugin-visualizer
```

`vite.config.ts`를 원래 상태로 완전 복원 (import 포함):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 6: stats.html 삭제**

```bash
rm -f stats.html
```

- [ ] **Step 7: 최종 빌드 확인 (visualizer 없이)**

```bash
pnpm build
```

Expected: 에러 없음

---

### Task 12: 문서 업데이트

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/plans/modernization.md`

- [ ] **Step 1: CLAUDE.md 기술 스택 업데이트**

`## 기술 스택` 섹션에 `lucide-react` 추가:

```markdown
- React 19 + TypeScript 5
- Tailwind CSS v4 + shadcn/ui (CSS-in-JS 없음)
- Zustand (상태 관리)
- Firebase v12 (Auth, Realtime Database, Analytics, Hosting)
- react-router v7, i18next v25, react-i18next v16
- lucide-react (아이콘)
```

- [ ] **Step 2: modernization.md T17 상태 업데이트**

`docs/plans/modernization.md`에서:

```markdown
| T17: 번들 최적화 + 최종 점검 | :x: 미완료 (T16 선행) | — |
```

→

```markdown
| T17: 번들 최적화 + 최종 점검 | :white_check_mark: 완료 | — |
```

`다음 작업 후보` 줄도 업데이트:

```markdown
**다음 작업 후보:** B2 (확대 뷰 센터링 미동작) 또는 방식 C 검토 (i18n lazy loading, Firebase 청크 분리)
```

- [ ] **Step 3: 커밋**

```bash
git add CLAUDE.md docs/plans/modernization.md
git commit -m "docs(T17): 기술 스택 업데이트 및 T17 완료 표시"
```

---

## 전체 기능 수동 검증 체크리스트

Task 11 완료 후 `pnpm dev`로 개발 서버 기동하여 아래 항목 확인:

- [ ] 메인 페이지 렌더링 정상
- [ ] 만다라트 생성 / 수정 / 삭제 정상
- [ ] Google 로그인 / 로그아웃 정상
- [ ] 게스트 → 회원 데이터 업로드 정상
- [ ] 다크 / 라이트 / 시스템 테마 전환 정상
- [ ] 언어 전환 (ko / en / ja / zh-CN) 정상
- [ ] OSS 라이선스 페이지 이동 정상 (lazy 로딩 확인)
- [ ] 모바일 반응형 정상 (DevTools 모바일 에뮬레이션)
- [ ] 헤더 아이콘 (햄버거 메뉴, 점 세 개) 정상 렌더링
- [ ] LeftDrawer 만다라트 목록 아이콘 정상 렌더링
- [ ] RightDrawer YouTube / GitHub 아이콘 정상 렌더링

---

## 성공 기준 요약

| 기준 | 확인 방법 |
|---|---|
| `pnpm build` 성공 | 빌드 에러 없음 |
| 번들 크기 감소 | Task 11 Step 4에서 기록 |
| `react-icons` 완전 제거 | Task 9 Step 2 grep 결과 |
| 전체 기능 정상 | 수동 검증 체크리스트 통과 |
