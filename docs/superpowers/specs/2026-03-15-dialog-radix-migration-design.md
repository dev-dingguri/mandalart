# Dialog 프리미티브 Radix 통일 설계

## 문제

Drawer(Vaul/Radix 기반)와 Dialog(Base UI 기반)가 서로 다른 레이어 관리 시스템을 사용하여, Drawer가 열린 상태에서 AlertDialog가 표시될 때 AlertDialog 클릭이 Drawer의 "외부 클릭"으로 인식되어 Drawer가 닫히는 문제.

## 해결 방향

Dialog 프리미티브를 Base UI에서 Radix UI로 교체하여 Vaul(Drawer)과 동일한 `DismissableLayer` 스택을 공유하도록 통일.

추가로, AlertDialog를 Radix AlertDialog 프리미티브로 분리하여 WAI-ARIA `role="alertdialog"` 시맨틱과 외부 클릭 차단 기본 동작을 확보.

## 패키지 변경

- **추가**: `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`
- **유지**: `@base-ui/react` (DropdownMenu, Button, Input 등에서 계속 사용)

## 변경 파일

### 1. `src/components/ui/dialog.tsx` — 프리미티브 교체

Base UI Dialog → Radix Dialog. 래퍼 API(Dialog, DialogContent, DialogOverlay 등) 유지.

API 매핑:
| Base UI | Radix |
|---|---|
| `DialogPrimitive.Backdrop` | `DialogPrimitive.Overlay` |
| `DialogPrimitive.Popup` | `DialogPrimitive.Content` |
| `DialogPrimitive.Close` + `render` prop | `DialogPrimitive.Close` + `asChild` |
| `DialogPrimitive.Root.Props` | `React.ComponentProps<typeof DialogPrimitive.Root>` |

### 2. `src/components/ui/alert-dialog.tsx` — 신규 생성

Radix AlertDialog 프리미티브 기반. dialog.tsx와 유사한 래퍼 구조.

내보내기: `AlertDialog`, `AlertDialogContent`, `AlertDialogOverlay`, `AlertDialogPortal`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`

### 3. `src/components/AlertDialog.tsx` — import 변경

`@/components/ui/dialog` → `@/components/ui/alert-dialog`로 변경. Radix AlertDialog 전용 컴포넌트 사용.

### 4. `src/components/SignInDialog.tsx` — 변경 없음

래퍼 API 동일 유지.

### 5. `src/components/TextInputDialog.tsx` — 변경 없음

래퍼 API 동일 유지.

## 소비자 영향

- SignInDialog, TextInputDialog: **변경 없음** (dialog.tsx 래퍼 API 유지)
- AlertDialog: import 경로 변경 + AlertDialog 전용 컴포넌트 사용

## 범위 외

- DropdownMenu (Base UI 유지, 별도 마이그레이션 시 진행)
- Button, Input, Separator, Toggle (오버레이 아님, Base UI 유지)
