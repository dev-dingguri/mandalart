# Dialog Radix 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dialog 프리미티브를 Base UI에서 Radix UI로 교체하여 Vaul(Drawer)과 DismissableLayer 스택을 공유하도록 통일

**Architecture:** `dialog.tsx`의 내부 프리미티브를 Base UI → Radix Dialog로 교체하고, Radix AlertDialog 프리미티브 기반의 `alert-dialog.tsx`를 신규 생성. 래퍼 API를 유지하여 소비자 변경을 최소화.

**Tech Stack:** @radix-ui/react-dialog, @radix-ui/react-alert-dialog, Tailwind CSS v4, shadcn/ui

**참고:** `shadcn/tailwind.css`의 `data-open:`/`data-closed:` 커스텀 variant가 Radix의 `data-state="open"`/`data-state="closed"`를 이미 매치하므로, CSS 클래스 변경 불필요.

---

## File Structure

| 파일 | 작업 |
|---|---|
| `src/components/ui/dialog.tsx` | 수정: Base UI → Radix Dialog 프리미티브 교체 |
| `src/components/ui/alert-dialog.tsx` | 신규: Radix AlertDialog 프리미티브 기반 UI 컴포넌트 |
| `src/components/AlertDialog.tsx` | 수정: dialog → alert-dialog UI 컴포넌트로 변경 |
| `src/components/SignInDialog.tsx` | 변경 없음 (래퍼 API 동일) |
| `src/components/TextInputDialog.tsx` | 변경 없음 (래퍼 API 동일) |

---

## Chunk 1: Radix 패키지 설치 및 dialog.tsx 교체

### Task 1: Radix 패키지 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Radix Dialog, AlertDialog 패키지 설치**

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

- [ ] **Step 2: 설치 확인**

```bash
pnpm ls @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

Expected: 두 패키지 버전이 출력됨

---

### Task 2: dialog.tsx를 Radix Dialog로 교체

**Files:**
- Modify: `src/components/ui/dialog.tsx`

**API 매핑:**
| Base UI | Radix | 비고 |
|---|---|---|
| `DialogPrimitive.Root.Props` | `React.ComponentProps<typeof DialogPrimitive.Root>` | 타입 접근 방식 변경 |
| `DialogPrimitive.Backdrop` | `DialogPrimitive.Overlay` | 컴포넌트명 변경 |
| `DialogPrimitive.Backdrop.Props` | `React.ComponentProps<typeof DialogPrimitive.Overlay>` | 타입 |
| `DialogPrimitive.Popup` | `DialogPrimitive.Content` | 컴포넌트명 변경 |
| `DialogPrimitive.Popup.Props` | `React.ComponentProps<typeof DialogPrimitive.Content>` | 타입 |
| `render={<Button />}` | `asChild` + `<Button>` 감싸기 | 컴포지션 패턴 변경 |

- [ ] **Step 1: dialog.tsx 전체 교체**

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            asChild
          >
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">{closeLabel}</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel = "Close",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">
            {closeLabel}
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

- [ ] **Step 2: 빌드 확인**

```bash
pnpm build
```

Expected: 타입 에러 없이 빌드 성공. SignInDialog, TextInputDialog는 래퍼 API가 동일하므로 변경 불필요.

- [ ] **Step 3: 커밋**

```bash
git add package.json pnpm-lock.yaml src/components/ui/dialog.tsx
git commit -m "refactor(dialog): Base UI Dialog를 Radix Dialog 프리미티브로 교체"
```

---

## Chunk 2: AlertDialog 분리

### Task 3: alert-dialog.tsx 신규 생성

**Files:**
- Create: `src/components/ui/alert-dialog.tsx`

- [ ] **Step 1: Radix AlertDialog 기반 UI 컴포넌트 작성**

```tsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
```

**참고:** `AlertDialogContent`에는 `showCloseButton`이 없음. Radix AlertDialog는 외부 클릭/ESC로 닫히지 않으므로, 명시적 Action/Cancel 버튼으로만 닫아야 함.

---

### Task 4: AlertDialog.tsx를 alert-dialog UI 컴포넌트로 변경

**Files:**
- Modify: `src/components/AlertDialog.tsx`

- [ ] **Step 1: AlertDialog.tsx 교체**

```tsx
import { useTranslation } from 'react-i18next';
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export type AlertDialogProps = {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
};

const AlertDialog = ({ isOpen, message, onClose }: AlertDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="gap-3 p-6 w-max">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('global.app')}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line break-keep">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center">
          <AlertDialogAction className="w-full">{t('global.ok')}</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
```

**변경점:**
- import: `@/components/ui/dialog` → `@/components/ui/alert-dialog`
- `Dialog` → `AlertDialogRoot` (이름 충돌 방지)
- `DialogContent` → `AlertDialogContent` (showCloseButton prop 제거 — AlertDialog에는 불필요)
- `DialogHeader/Title/Description` → `AlertDialogHeader/Title/Description`
- `<Button onClick={onClose}>` → `<AlertDialogAction>` (Radix가 자동으로 onOpenChange(false) 트리거)

- [ ] **Step 2: 빌드 확인**

```bash
pnpm build
```

Expected: 타입 에러 없이 빌드 성공

- [ ] **Step 3: 커밋**

```bash
git add src/components/ui/alert-dialog.tsx src/components/AlertDialog.tsx
git commit -m "refactor(alert-dialog): Radix AlertDialog 프리미티브 도입 및 AlertDialog 분리"
```

---

## Chunk 3: 검증 및 정리

### Task 5: 수동 검증

- [ ] **Step 1: 개발 서버 실행 및 동작 확인**

```bash
pnpm dev
```

확인 항목:
1. SignInDialog: 열기/닫기, X 버튼, 오버레이 클릭으로 닫기
2. TextInputDialog: 열기/닫기, 입력 후 저장/취소
3. AlertDialog: 열기, OK 버튼으로 닫기, **외부 클릭으로 닫히지 않는지 확인**
4. **핵심 확인**: Drawer가 열린 상태에서 AlertDialog가 표시될 때, AlertDialog OK 클릭 후 Drawer가 열린 상태로 유지되는지

- [ ] **Step 2: @base-ui/react에서 dialog import가 없는지 확인**

```bash
grep -r "@base-ui/react/dialog" src/
```

Expected: 출력 없음 (모든 dialog import가 Radix로 교체됨)
