# React 컴포넌트 리팩토링 설계 문서

## 개요

`src/components/` 내 모든 React 컴포넌트를 코드 품질 및 유지보수성 중심으로 리팩토링한다.
한 번에 전체를 변경하지 않고, 6개 그룹으로 나누어 순차적으로 진행하며 각 그룹마다 빌드 검증과 코드 리뷰를 수행한다.

## 범위

- **대상**: `src/components/` 내 React 컴포넌트 파일만
- **목적**: 코드 품질/유지보수성 (큰 컴포넌트 분해, 로직 추출, 패턴 통일)
- **새 훅 추출**: 허용 (컴포넌트에서 로직을 훅으로 추출)
- **제외**: `src/stores/`, `src/types/`, `src/locales/` 등은 대상 외

## 접근법

**Bottom-Up** (잎 → 루트): 의존성이 적은 작은 컴포넌트부터 정리한 뒤, 점차 상위 컴포넌트로 올라간다.
하위 컴포넌트를 먼저 정리하면 상위 컴포넌트 리팩토링 시 깔끔한 빌딩 블록으로 활용할 수 있고, 빌드가 깨질 위험이 낮다.

## 사용 스킬 및 에이전트

### 리팩토링 시

| 스킬 | 용도 |
|------|------|
| `vercel-react-best-practices` | React 베스트 프랙티스 (리렌더링 최적화, 렌더링 성능, 번들 최적화) |
| `vercel-composition-patterns` | 합성 패턴 (compound components, explicit variants, boolean prop 제거) |
| `shadcn` | shadcn/ui 컴포넌트 교체, 스타일링 규칙 (`gap`, `size`, `cn()`, `data-icon`) |
| `web-design-guidelines` | 애니메이션 (`prefers-reduced-motion`), 타이포그래피, 이미지, 다크모드 규칙 |
| `simplify` | 코드 간결성, 중첩 삼항 제거, Props 타입 정의 통일 |

### 검증 시

| 스킬/도구 | 용도 |
|-----------|------|
| `pnpm build` | 빌드 성공 확인 |
| `superpowers:verification-before-completion` | 완료 전 검증 |
| `superpowers:requesting-code-review` / `code-review` | 코드 리뷰 요청 |
| `superpowers:receiving-code-review` | 리뷰 피드백 반영 |
| Chrome DevTools MCP (`evaluate_script`) | memo 성능 측정 (그룹 2) |

### 리팩토링 완료 후 (선택)

| 스킬 | 용도 |
|------|------|
| `chrome-devtools-mcp:a11y-debugging` | 접근성 최종 검증 |
| `chrome-devtools-mcp:debug-optimize-lcp` | 성능 최종 검증 |

## 각 그룹 사이클

```
리팩토링 실행
    ↓
pnpm build (빌드 검증)
    ↓
code-reviewer 에이전트 (코드 리뷰)
    ↓
피드백 반영
    ↓
다음 그룹으로
```

---

## 그룹 1: 기초 컴포넌트

**대상**: `AspectSquare`(13줄), `TopicItem`(53줄), `ItemGrid`(40줄)
**변경 규모**: 작음

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 1-1 | `AspectSquare` 사용처 검토 — `TopicGrid`에서만 사용되면 인라인화 고려 | 탐색 |
| 1-2 | `TopicItem`, `ItemGrid`에 `React.memo` 적용 | 탐색 |
| 1-3 | `rendering-hoist-jsx` — 정적 JSX 요소를 컴포넌트 밖으로 추출 | react-best-practices |
| 1-4 | `rendering-conditional-render` — `&&` 조건부 렌더링에서 falsy 값(0, NaN) 위험 검사, 필요시 삼항 연산자로 전환 | react-best-practices |
| 1-5 | shadcn 스타일링 규칙 — `space-y/x` → `gap`, `w-* h-*` → `size-*`, `cn()` 통일 | shadcn |
| 1-6 | 중첩 삼항 연산자 제거, Props 타입 정의 패턴 통일 | simplify |
| 1-7 | `prefers-reduced-motion` 존중, `transition: all` 금지 검사 | web-design-guidelines |

---

## 그룹 2: 그리드/뷰

**대상**: `TopicGrid`(79줄), `Mandalart`(59줄), `MandalartView`(124줄), `MandalartFocusView`(115줄)
**변경 규모**: 중간

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 2-1 | `TopicGrid`에 `React.memo` 적용 | 탐색 |
| 2-2 | `Mandalart` 내부 구조 정리 (이미 memo 적용됨) | 탐색 |
| 2-3 | `MandalartFocusView` — 5개 스와이프 상태 ref + 터치 이벤트 계산 로직을 `useSwipeNavigation` 훅으로 추출 | 탐색 |
| 2-4 | `MandalartView`의 `isAllView` boolean → 명시적 variant 분리 검토 (`architecture-avoid-boolean-props` + `patterns-explicit-variants`). **검토 결론: 변경 불필요** — `isAllView`는 외부 prop이 아닌 내부 useState 토글이므로 `avoid-boolean-props` 규칙 해당 없음. 두 뷰가 동일한 `mandalartProps`/헤더/다이얼로그를 공유하므로 분리 시 중복 발생. | composition-patterns |
| 2-5 | `rerender-defer-reads` — 콜백에서만 쓰는 상태를 구독하고 있는지 검사 | react-best-practices |
| 2-6 | `rerender-functional-setstate` — setState에 함수형 업데이트 적용하여 콜백 안정성 확보 | react-best-practices |
| 2-7 | shadcn 스타일링 규칙, 중첩 삼항 제거, Props 통일, 모션 규칙 | shadcn/simplify/web-design |

### memo 성능 측정 (Chrome DevTools MCP + React DevTools)

그룹 1에서 적용한 memo와 그룹 2의 memo를 통합 측정한다.
81개 셀이 렌더링되는 만다라트 그리드에서 측정해야 유의미한 차이를 관찰할 수 있다.

| 단계 | 내용 |
|------|------|
| **Before 측정** | `evaluate_script`로 `__REACT_DEVTOOLS_GLOBAL_HOOK__` 활용 렌더링 카운터 주입 → 표준 시나리오(토픽 셀 편집 5회) 수행 → 컴포넌트별 렌더링 횟수/시간 수집 |
| **After 측정** | memo 적용 후 동일 시나리오 재측정 |
| **비교** | Before/After 비교표 작성. 렌더링 횟수가 유의미하게 감소하지 않으면 memo 제거 |

---

## 그룹 3: 다이얼로그

**대상**: `AlertDialog`(38줄), `SignInDialog`(45줄), `TextInputDialog`(120줄)
**변경 규모**: 작음~중간

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 3-1 | 다이얼로그 상태 관리 `useModal` 패턴 통일 — 현재 AppLayout은 `useModal` 훅, MandalartListItem은 `useState` 직접 사용하는 불일치 해소 | 탐색 |
| 3-2 | `react19-no-forwardref` — `forwardRef` → ref prop 직접 전달 방식으로 전환 | composition-patterns |
| 3-3 | `patterns-children-over-render-props` — renderX prop 대신 children 합성 패턴 사용 확인 | composition-patterns |
| 3-4 | `AlertDialog` → shadcn `alert-dialog`로 전환 (확인/취소 confirmation 전용 컴포넌트) | shadcn |
| 3-5 | `TextInputDialog` 폼 — shadcn `FieldGroup` + `Field` 패턴 적용 검토 | shadcn |
| 3-6 | `SignInDialog` 이미지 `width`/`height` 명시 | web-design-guidelines |
| 3-7 | shadcn 스타일링 규칙, 중첩 삼항 제거, Props 통일, 모션 규칙 | shadcn/simplify/web-design |

---

## 중간 점검 결과 (그룹 1~3 완료 후)

그룹 3에서 `useModal` 통일 작업 시, 계획 범위를 넘어 그룹 4·6 대상 컴포넌트에도 선행 적용되었다.

| 컴포넌트 | 선행 적용 내용 | 커밋 |
|----------|---------------|------|
| `MandalartListItem` (그룹 4) | `useModal` 훅 통합, `cn()` 전환 | cb982db |
| `AppLayout` (그룹 6) | `useModal` 훅 통합 (SignInDialog, AlertDialog) | cb982db |
| `TopicItem` (그룹 1) | `useModal` 훅 통합 | cb982db |

**미적용 사항**: `AppLayout`의 드로어 상태(`isOpenLeftDrawer`, `isOpenRightDrawer`)는 여전히 `useState` 직접 사용 중 → 그룹 6에서 `useModal` 전환 필요.

---

## 그룹 4: 리스트/드로어 ✅

**대상**: `MandalartList`(44줄), `MandalartListItem`(96줄), `MandalartListDrawer`(71줄)
**변경 규모**: 작음~중간 (그룹 3에서 useModal/cn() 선행 적용 완료)

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 4-1 ✅ | `MandalartListItem` — DropdownMenu를 `MandalartListItemMenu`로 추출. `Button variant="ghost" size="icon-xs"` + `asChild` 패턴 적용, `aria-label` 추가, `stopPropagation` why 주석 | 탐색 |
| 4-2 ✅ | `@radix-ui/react-scroll-area` 설치 (Radix 통일), `scroll-area.tsx` 생성, `MandalartListDrawer`에 `ScrollArea` 적용. `overflow-auto` + `scrollbar-gutter` → `ScrollArea` 전환, 불필요한 `px-[var(--size-scrollbar-width)]` 제거 | shadcn |
| 4-3 ✅ | Button 내 Plus 아이콘에 `data-icon="inline-start"` 적용, 아이콘 사이징 클래스 제거, `meta.title ? meta.title : t(...)` → `meta.title \|\| t(...)` 간소화, `global.more` 번역 키 추가 (ko/en/ja/zh-CN) | shadcn/simplify/web-design |

> **삭제된 항목**:
> - 구 4-2 (compound components 검토) → 4-1에 통합, 단순 추출로 한정
> - 구 4-3 (useModal 패턴 적용) → 그룹 3에서 선행 완료됨 (cb982db)

---

## 그룹 5: 설정/헤더

**대상**: `SettingsDrawer`(201줄), `Header`(94줄), `MandalartViewToggle`(30줄)
**변경 규모**: 중간~큼

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 5-1 | SettingsDrawer 내부 `InlineSelect`를 별도 파일로 추출 — 모듈 분리 및 재사용성 확보, shadcn Select로 ARIA/키보드 접근성 자동 지원 | react-best-practices / shadcn |
| 5-2 | `Select` 설치 — 추출한 InlineSelect를 shadcn `Select`로 대체 (ARIA, 키보드 네비게이션 자동 지원) | shadcn |
| 5-3 | `Tooltip` 설치 — 버튼/아이콘에 tooltip 적용 검토 | shadcn |
| 5-4 | 아이콘 `data-icon` 패턴 — 그룹 1~3에서 적용 여부 먼저 확인, 미적용 시 이 그룹에서 전 컴포넌트 대상 일괄 적용 | shadcn |
| 5-5 | `rerender-derived-state` — 연속 값 대신 파생 boolean 구독으로 전환 가능한 곳 검사 | react-best-practices |
| 5-6 | `MandalartViewToggle` aria-label 검토 — 번역 키 값이 "다음 동작"을 올바르게 안내하는지 확인 | 탐색 |
| 5-7 | `Header` 드로어/다이얼로그 트리거 콜백 패턴 검토 — 현재 `onOpenLeftDrawer`, `onOpenRightDrawer`, `onOpenSignInUI`, `onSignOut` 4개 콜백 props를 AppLayout으로부터 전달받는 구조. 그룹 6의 AppLayout 드로어 상태 리팩토링과 연계하여 인터페이스 정리 필요 | 탐색 |
| 5-8 | `text-wrap: balance` — 제목 요소에 적용 검토 | web-design-guidelines |
| 5-9 | shadcn 스타일링 규칙, 중첩 삼항 제거, Props 통일, 모션 규칙 | shadcn/simplify/web-design |

---

## 그룹 6: 레이아웃/페이지

**대상**: `AppLayout`(227줄), `MainPage`(28줄), `AuthenticatedView`(24줄), `GuestView`(20줄), `OpenSourceLicensesPage`(124줄)
**변경 규모**: 큼

이 그룹을 마지막에 배치한 이유: 그룹 1~5에서 하위 컴포넌트들의 인터페이스가 정리된 후에야 AppLayout을 깔끔하게 분해할 수 있다.

### 작업 항목

| # | 작업 | 출처 |
|---|------|------|
| 6-1 | `AppLayout` — 드로어 상태, 다이얼로그 상태, 임시 데이터 업로드 useEffect, 메타 태그 설정 등 여러 관심사를 `useAppLayoutState` 훅으로 추출하여 컴포넌트는 렌더링에만 집중 | 탐색 |
| 6-2a | `AppLayout` 드로어 상태를 `useModal`로 전환 — 현재 `isOpenLeftDrawer`, `isOpenRightDrawer`가 `useState` 직접 사용 중(49~55줄). 그룹 3에서 확립된 `useModal` 패턴으로 통일하면 boolean props 문제가 상당 부분 해소됨 | 탐색 / composition-patterns |
| 6-2b | `architecture-avoid-boolean-props` — 6-2a 적용 후에도 여전히 다수의 boolean이 props로 자식에게 전달되는 경우에만 Provider/Context 전환 검토 | composition-patterns |
| 6-3 | `rerender-move-effect-to-event` — useEffect에 들어 있는 상호작용 로직이 이벤트 핸들러로 옮겨질 수 있는지 검사 | react-best-practices |
| 6-4 | `OpenSourceLicensesPage` — 무한 스크롤 로직(IntersectionObserver + ref)을 커스텀 훅으로 추출 | 탐색 |
| 6-5 | `rendering-content-visibility` — OSS 라이선스 목록에 content-visibility CSS 적용 검토 | react-best-practices |
| 6-6 | 다크모드 `<meta name="theme-color">` — 배경색과 일치하는 메타 태그 추가 | web-design-guidelines |
| 6-7 | `text-wrap: balance` — 제목 요소에 적용 검토 | web-design-guidelines |
| 6-8 | `MainPage`, `AuthenticatedView`, `GuestView` — 앞선 그룹 변경 반영 확인 | 탐색 |
| 6-9 | shadcn 스타일링 규칙, 중첩 삼항 제거, Props 통일, 모션 규칙 | shadcn/simplify/web-design |

---

## 전 그룹 공통 규칙

리팩토링 시 모든 그룹에 일관되게 적용하는 규칙이다.

### vercel-react-best-practices

- `rendering-hoist-jsx` — 정적 JSX를 컴포넌트 밖으로 추출
- `rendering-conditional-render` — `&&` 조건부 렌더링 falsy 값 검사
- `rerender-functional-setstate` — 함수형 setState로 콜백 안정성 확보
- `rerender-defer-reads` — 콜백에서만 쓰는 상태 구독 검사
- `rerender-no-inline-components` — 컴포넌트 내부에 컴포넌트 정의 금지

### vercel-composition-patterns

- `react19-no-forwardref` — forwardRef 제거, ref를 일반 prop으로 전달
- `architecture-avoid-boolean-props` — boolean prop 대신 합성 패턴 사용
- `patterns-children-over-render-props` — renderX prop 대신 children 사용

### shadcn 스타일링 규칙

- `space-y-*` / `space-x-*` → `flex` + `gap-*`
- `w-* h-*` (동일 값) → `size-*`
- 조건부 클래스에 `cn()` 유틸리티 사용
- 아이콘에 `data-icon` 속성, 사이징 클래스 직접 적용 금지
- semantic 색상 사용 (`bg-primary`, `text-muted-foreground`)

### web-design-guidelines

- `prefers-reduced-motion` 존중 (애니메이션이 있는 모든 컴포넌트)
- `transition: all` 금지 — 구체적 속성만 지정 (`transition-transform`, `transition-opacity`)
- 이미지에 명시적 `width`, `height`

### simplify

- 중첩 삼항 연산자 제거 — switch 또는 if/else로 전환
- Props 타입 정의 통일 — 명시적 `Props` 인터페이스 패턴
- 코드 간결성 — 불필요한 추상화 제거, 명확성 우선
