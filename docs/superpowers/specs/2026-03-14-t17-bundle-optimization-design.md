# T17: 번들 최적화 + 최종 점검 — 설계 문서

> **브랜치:** `rewrite/incremental`
> **날짜:** 2026-03-14
> **방식:** B (react-icons 교체 + OSS 페이지 코드 스플리팅)

---

## 목표

현재 번들 크기(~979KB)를 줄이고, 현대화 작업(T1~T16)의 최종 품질을 검증한다.

---

## 범위

### 포함
1. `react-icons` → `lucide-react` 완전 교체
2. OSS 페이지 `React.lazy` + `Suspense` 코드 스플리팅
3. `rollup-plugin-visualizer`로 번들 분석 (임시, 분석 후 제거)
4. `CLAUDE.md` 기술 스택 업데이트

### 제외 (C 방식 — B 완료 후 검토)
- i18n 리소스 lazy loading
- Firebase 청크 분리

---

## 설계 상세

### 1. react-icons → lucide-react

**배경:** `react-icons` v4는 트리쉐이킹이 불완전하여 사용하지 않는 아이콘 세트까지 번들에 포함된다. 프로젝트는 이미 `lucide-react`를 보유하므로 중복 의존성 제거로 번들 크기를 줄인다.

**사전 조건:** `lucide-react`는 이미 `dependencies`에 설치되어 있음 (`^0.577.0`). 추가 설치 불필요.

**변경 대상 파일 (총 8개):**

| react-icons (bs) | lucide-react | 사용 파일 |
|---|---|---|
| `BsList` | `Menu` | Header.tsx |
| `BsThreeDots` | `MoreHorizontal` | Header.tsx, MandalartListItem.tsx (2개 파일) |
| `BsPlus` | `Plus` | LeftDrawer.tsx, MainContent.tsx (2개 파일) |
| `BsGrid3X3` | `LayoutGrid` | MandalartListItem.tsx |
| `BsFullscreen` | `Maximize2` | MandalartViewToggle.tsx |
| `BsChevronLeft` | `ChevronLeft` | OpenSourceLicensesPage.tsx |
| `BsGithub` | `Github` | RightDrawer.tsx |
| `BsYoutube` | `Youtube` | RightDrawer.tsx |
| `BsChevronDown` | `ChevronDown` | RightDrawer.tsx |

**`main.tsx`:** `IconContext` import 및 `<IconContext.Provider>` 래퍼 제거 (아이콘 import 없음, Provider만 제거).

**완료 조건:** `pnpm remove react-icons` 후 `pnpm build` 성공.

---

### 2. OSS 페이지 코드 스플리팅

**변경 위치:** `src/App.tsx`

```tsx
// Before
import OpenSourceLicensesPage from 'components/OpenSourceLicensesPage';

// After
const OpenSourceLicensesPage = React.lazy(
  () => import('components/OpenSourceLicensesPage')
);
```

해당 Route를 `<Suspense fallback={null}>` 또는 스피너로 감싼다.

---

### 3. 번들 분석 (임시)

```bash
pnpm add -D rollup-plugin-visualizer
```

`vite.config.ts`에 `visualizer()` 플러그인 임시 추가 → `pnpm build` → `stats.html` 확인 → 최적화 완료 후 플러그인과 의존성 제거, `vite.config.ts` 원복.

---

### 4. CLAUDE.md 업데이트

`CLAUDE.md`의 기술 스택 섹션(`## 기술 스택`)에 아이콘 라이브러리 명시:
- 추가: `lucide-react` (아이콘)
- `react-icons`는 CLAUDE.md에 현재 미기재이므로 제거 항목 없음

`docs/plans/modernization.md` T17 상태를 ✅ 완료로 업데이트.

---

## 성공 기준

- `pnpm build` 성공, 빌드 에러 없음
- 번들 크기 < 979KB (기존 대비 감소)
- `react-icons` 의존성 제거 완료
- 전체 기능 수동 검증 통과:
  - 메인 페이지 렌더링
  - 만다라트 생성/수정/삭제
  - Google 로그인/로그아웃
  - 게스트 → 회원 데이터 업로드
  - 다크/라이트/시스템 테마 전환
  - 언어 전환 (ko/en/ja/zh-CN)
  - 모바일 반응형

---

## 미래 작업 (C 방식)

B 완료 후 검토:
- i18n 리소스 dynamic import (언어별 청크 분리)
- Firebase 모듈 청크 수동 분리 (`manualChunks`)
