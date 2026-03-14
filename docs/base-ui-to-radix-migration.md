# Base UI → Radix 기반 shadcn/ui 마이그레이션 가이드

## 배경

Vaul(Drawer)이 Radix 기반이므로, Base UI 오버레이 컴포넌트와 `DismissableLayer` 스택을 공유하지 못해 레이어 충돌이 발생함. Dialog를 Radix로 교체하여 해결 확인 (2026-03-15).

**방향: Radix 기반 shadcn/ui + Tailwind 사용. Base UI 사용 자제.**

## 마이그레이션 완료 (2026-03-15)

| 컴포넌트 | 변경 전 | 변경 후 |
|---|---|---|
| `ui/dialog.tsx` | `@base-ui/react/dialog` | `@radix-ui/react-dialog` |
| `ui/dropdown-menu.tsx` | `@base-ui/react/menu` | `@radix-ui/react-dropdown-menu` |
| `ui/button.tsx` | `@base-ui/react/button` | native `<button>` |
| `ui/input.tsx` | `@base-ui/react/input` | native `<input>` |
| `ui/toggle.tsx` | `@base-ui/react/toggle` | `@radix-ui/react-toggle` |
| `ui/separator.tsx` | `@base-ui/react/separator` | `@radix-ui/react-separator` |

**`@base-ui/react` 패키지 제거 완료.**

## 마이그레이션 시 핵심 참고사항

### 1. API 매핑 패턴

| Base UI | Radix | 비고 |
|---|---|---|
| `Primitive.Root.Props` | `React.ComponentProps<typeof Primitive.Root>` | 타입 접근 방식 |
| `Primitive.Backdrop` | `Primitive.Overlay` | Dialog 계열 |
| `Primitive.Popup` | `Primitive.Content` | Dialog 계열 |
| `render={<Component />}` | `asChild` + `<Component>` 감싸기 | 컴포지션 패턴 |

### 2. data attribute 호환성

`shadcn/tailwind.css`가 커스텀 variant를 정의하여 호환 처리함:
- `data-open:` → `[data-state="open"]` (Radix) 또는 `[data-open]` (Base UI) 둘 다 매치
- `data-closed:` → `[data-state="closed"]` (Radix) 또는 `[data-closed]` (Base UI) 둘 다 매치

**따라서 CSS 클래스 변경 불필요.** 단, `data-horizontal:`/`data-vertical:` (Base UI 전용)은 Radix의 `data-[orientation=horizontal]:`/`data-[orientation=vertical]:`로 변경 필요.

### 3. DropdownMenu 마이그레이션 시 주의

Base UI Menu와 Radix DropdownMenu의 API 차이가 큼:
- Base UI: `Menu.Positioner` 존재 → Radix: 없음 (Content가 자체 위치 지정)
- Base UI: `Menu.Popup` → Radix: `DropdownMenu.Content`
- `pointer-events-auto` 핵 → Radix에서는 불필요하여 제거함

### 4. Button, Input은 프리미티브 제거

`button.tsx`와 `input.tsx`는 Base UI 프리미티브가 native HTML element의 얇은 래퍼였으므로 native element(`<button>`, `<input>`)로 직접 교체함.
