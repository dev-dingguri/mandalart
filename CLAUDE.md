# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Branch Status

The `rewrite/incremental` branch has migrated from CRA to Vite 6 + modern stack. Core migration tasks (T1–T17) and component refactoring (6 groups, Bottom-Up) are all complete. Design docs live in `docs/superpowers/specs/`.

## Build & Development

- Package manager: pnpm
- `pnpm dev` — dev server (localhost:3000)
- `pnpm build` — production build (`tsc -b && vite build`, output: `dist/`); prerenders `/ko` and `/ko/guide` to static HTML for SEO
- `pnpm test` — run Vitest unit tests (single file: `pnpm vitest run src/__tests__/<filename>`)
- `pnpm test:watch` — Vitest watch mode
- `pnpm test:e2e` — run Playwright E2E tests (single file: `pnpm test:e2e e2e/<filename>`)
- `pnpm test:e2e:ui` — Playwright UI mode (interactive debugging)
- `pnpm deploy:firebase` — deploy to Firebase Hosting
- `pnpm deploy:preview` — deploy to Firebase preview channel (expires in 7 days)

## Tech Stack

- React 19 + TypeScript 5 (strict mode)
- Tailwind CSS v4 + shadcn/ui (Radix-based — do not use Base UI)
- Zustand 5 (state management)
- Firebase v12 (Auth, Realtime Database, Analytics, Hosting)
- react-router v7, i18next v25
- lucide-react (icons), `@/` path alias via `vite-tsconfig-paths`
- react-helmet-async (per-page meta tags for SEO)
- @prerenderer/rollup-plugin (build-time prerendering for static HTML)
- Playwright (E2E testing, Chromium only)

## Environment Variables

- Vite convention: `VITE_` prefix (`import.meta.env.VITE_*`)
- Firebase config: requires `VITE_FIREBASE_*` variables in `.env` (see .env.example)

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
App → LandingPage (재방문자 리다이렉트 → /app)
    → MainPage → AuthenticatedView / GuestView → AppLayout (useAppLayoutState hook)
    │   ├── Header
    │   ├── MandalartView → Mandalart → ItemGrid → TopicGrid → TopicItem
    │   │                 → MandalartFocusView (useSwipeNavigation hook)
    │   ├── MandalartListDrawer (lazy, Radix Sheet left)
    │   ├── SettingsDrawer (lazy, Radix Sheet right)
    │   └── SignInDialog (lazy)
    → GuidePage
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
| `confirmDialog` | `isOpen`, `message`, `confirmText`, `onConfirm`, `close` |

### Performance Patterns

- `memo`: entire grid hierarchy (`Mandalart`, `TopicGrid`, `TopicItem`, `ItemGrid`)
- `React.lazy`: `MandalartListDrawer`, `SettingsDrawer`, `SignInDialog`, `OpenSourceLicensesPage`
- Manual bundle chunk splitting: `vendor-router`, `vendor-firebase`, `vendor-i18n`, `vendor-ui`
- `structuredClone` for deep-copying topic trees
- Zustand individual selectors: avoid full store subscription, subscribe only to needed slices (e.g., `hasMandalarts` boolean instead of full `metaMap`)
- Touch handler stabilization: `useCallback` + ref pattern in `useSwipeNavigation` to prevent handler recreation on every render
- `content-visibility: auto` on OSS page items for scroll performance

### SEO Infrastructure

- `SEOHead` component manages per-page meta tags via react-helmet-async
- Content pages (LandingPage, GuidePage) use `min-h-dvh` for scrollable layout
- Tool pages (MainPage, OpenSourceLicensesPage) use `h-dvh` for fixed viewport

### Routing

```
/{lang}        → LandingPage (재방문자: /app으로 리다이렉트)
/{lang}/app    → MainPage (만다라트 도구)
/{lang}/guide  → GuidePage
/{lang}/oss    → OpenSourceLicensesPage (lazy)
*              → Navigate to /{lang}
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
- `e2e/` — Playwright E2E tests (guest mode: grid, view toggle, cell editing)
- `docs/` — Refactoring design docs, migration history

## Testing

### Unit Tests (Vitest)

- Config: `vite.config.ts` → `test` section (jsdom environment)
- Tests: `src/__tests__/` — stores, hooks, utilities, routing
- `e2e/**` is excluded from Vitest via `test.exclude`

### E2E Tests (Playwright)

- Config: `playwright.config.ts` — Chromium only, webServer starts `pnpm dev`
- Tests: `e2e/` — Phase 1 covers guest mode (no Firebase dependency)
- Selectors: `[data-cell]` (pre-existing), `data-testid` on MandalartView container, FocusView container, ViewToggle
- Desktop viewport (1280×720) tests the Popover input path; mobile BottomInputBar path is not yet covered

## Known Issues

- No save-success feedback — deferred; Firebase realtime subscriptions provide sufficient immediate visual feedback
