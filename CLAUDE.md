# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Branch Status

The `rewrite/incremental` branch has migrated from CRA to Vite 6 + modern stack. Core migration tasks (T1–T17) and component refactoring (6 groups, Bottom-Up) are all complete. Design docs live in `docs/superpowers/specs/`.

## Build & Development

- Package manager: pnpm
- `pnpm dev` — dev server (localhost:3000)
- `pnpm build` — production build (`tsc -b && vite build`, output: `build/`)
- `pnpm test` — run Vitest tests (single file: `pnpm vitest run src/test/<filename>`)
- `pnpm test:watch` — Vitest watch mode
- `pnpm deploy:firebase` — deploy to Firebase Hosting
- `pnpm deploy:preview` — deploy to Firebase preview channel (expires in 7 days)

## Tech Stack

- React 19 + TypeScript 5 (strict mode)
- Tailwind CSS v4 + shadcn/ui (Radix-based — do not use Base UI)
- Zustand 5 (state management)
- Firebase v12 (Auth, Realtime Database, Analytics, Hosting)
- react-router v7, i18next v25, vaul (Drawer)
- lucide-react (icons), `@/` path alias via `vite-tsconfig-paths`

## Environment Variables

- Vite convention: `VITE_` prefix (`import.meta.env.VITE_*`)
- Firebase config: requires `VITE_FIREBASE_*` variables in `.env` (see template.env)

## Data Model

Mandalart is a 9×9 grid goal-setting tool. Two core types:

- `TopicNode = { text: string; children: TopicNode[] }` — tree structure (1 root + 8 level-1 children + 64 level-2 children = 73 nodes total)
- `MandalartMeta = { title: string }` — metadata

Firebase Realtime Database paths:
- `{uid}/mandalarts/snippets/{id}` → MandalartMeta
- `{uid}/mandalarts/topictrees/{id}` → TopicNode

## Architecture

### Zustand Stores (4)

| Store | Responsibility |
|-------|---------------|
| `useAuthStore` | User object, Google OAuth, session flags. Registers `onAuthStateChanged` at **file level** (outside React) |
| `useMandalartStore` | metaMap, current mandalart ID/topic tree, CRUD. Branching logic for authenticated vs guest mode built-in |
| `useLoadingStore` | Map-based multi-condition loading tracker |
| `useThemeStore` | Ternary dark mode (`system`/`light`/`dark`), persisted to localStorage via `zustand/persist` |

### Store Connection Flow

The `useMandalartInit(user)` hook bridges Auth state and MandalartStore. `AuthenticatedView` calls `useMandalartInit(user)`, `GuestView` calls `useMandalartInit(null)`. Firebase `onValue` realtime subscriptions are managed inside this hook.

### Guest Mode

Works without login — data stored in `localStorage`. On sign-in, `uploadTemp()` migrates the first guest mandalart to Firebase. A `shouldUploadTemp` flag in `sessionStorage` prevents duplicate uploads.

### Component Hierarchy (Key)

```
App → MainPage → AuthenticatedView / GuestView → AppLayout (useAppLayoutState hook)
  ├── Header
  ├── MandalartView → Mandalart → ItemGrid → TopicGrid → TopicItem
  │                 → MandalartFocusView (useSwipeNavigation hook)
  ├── MandalartListDrawer (lazy, vaul Drawer left, subscribes to store directly)
  ├── SettingsDrawer (lazy, vaul Drawer right)
  └── SignInDialog (lazy)
```

### `useAppLayoutState` Hook

Extracts all state/logic from `AppLayout` (modals, store subscriptions, analytics, error handling, callbacks). Returns grouped object:

| Group | Contents |
|-------|----------|
| `mandalart` | `hasMandalarts`, `currentId`, `currentMeta`, `currentTopicTree`, CRUD callbacks |
| `leftDrawer` | `isOpen`, `open`, `close`, list action callbacks |
| `rightDrawer` | `isOpen`, `open`, `close` |
| `signInDialog` | `isOpen`, `open`, `close`, `onSignIn` |
| `alert` | `isOpen`, `content`, `close` |

### Performance Patterns

- `memo`: entire grid hierarchy (`Mandalart`, `TopicGrid`, `TopicItem`, `ItemGrid`)
- `React.lazy`: `MandalartListDrawer`, `SettingsDrawer`, `SignInDialog`, `OpenSourceLicensesPage`
- Manual bundle chunk splitting: `vendor-router`, `vendor-firebase`, `vendor-i18n`, `vendor-ui`
- `structuredClone` for deep-copying topic trees
- Zustand individual selectors: avoid full store subscription, subscribe only to needed slices (e.g., `hasMandalarts` boolean instead of full `metaMap`)
- Touch handler stabilization: `useCallback` + ref pattern in `useSwipeNavigation` to prevent handler recreation on every render
- `content-visibility: auto` on OSS page items for scroll performance

### Routing

```
/{lang}      → MainPage
/{lang}/oss  → OpenSourceLicensesPage (lazy)
*            → Navigate to /{lang}
```

### i18n

- Supported languages: `ko`, `en`, `ja`, `zh-CN`
- Detection order: path > localStorage > navigator, fallback: `en`
- Language detected from the first path segment (`/{lang}/`)

## Project Structure

- `src/components/` — React components
- `src/components/ui/` — shadcn/ui primitives
- `src/hooks/` — Custom hooks (`useModal`, `useAnalytics`, `useSwipeNavigation`, `useAppLayoutState`, `useInfiniteScroll`, etc.)
- `src/stores/` — Zustand stores (`useMandalartInit` hook also lives here)
- `src/locales/` — i18n resource bundles (JSON)
- `src/types/` — TypeScript type definitions
- `src/lib/` — Utilities (`firebase.ts`, `utils.ts`)
- `src/constants/` — Constants (TABLE_SIZE=9, TABLE_CENTER_IDX=4, MAX_UPLOAD_MANDALARTS_SIZE=20, etc.)
- `docs/` — Refactoring design docs, migration history

## Known Issues

- No save-success feedback — deferred; Firebase realtime subscriptions provide sufficient immediate visual feedback
