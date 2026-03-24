# Mandalart

A free, open-source 9×9 grid goal-setting tool inspired by the Mandalart planning method — famously used by Shohei Ohtani to map out his baseball career at age 18.

**Break one big goal into 81 concrete action steps.**

🔗 **[mandalart.me](https://mandalart.me/)**

## What is a Mandalart?

A Mandalart (mandala + art) is a structured brainstorming and planning technique. You place your main goal at the center of a 3×3 grid, surround it with 8 supporting themes, then expand each theme into its own 3×3 grid of specific actions — resulting in a 9×9 matrix of 81 actionable steps.

## Features

- **9×9 Interactive Grid** — Click any cell to edit; navigate with keyboard or swipe gestures
- **Focus View** — Zoom into individual 3×3 sub-grids with swipe navigation on mobile
- **Guest Mode** — Start planning instantly without an account (data stored in localStorage)
- **Google Sign-In** — Sync your mandalarts across devices via Firebase Realtime Database
- **Multiple Mandalarts** — Create and manage up to 20 mandalart plans
- **Dark Mode** — System, light, and dark theme options
- **Multilingual** — Korean, English, Japanese, and Chinese (Simplified)
- **SEO & Social Sharing** — Pre-rendered landing and guide pages with Open Graph meta tags
- **Mobile-First** — Responsive design with touch-optimized interactions

## Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | React 19, TypeScript 5 (strict) |
| **Build** | Vite 6, pnpm |
| **Styling** | Tailwind CSS v4, shadcn/ui (Radix primitives) |
| **State** | Zustand 5 |
| **Backend** | Firebase v12 (Auth, Realtime Database, Analytics, Hosting) |
| **Routing** | react-router v7 |
| **i18n** | i18next v25 |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **SEO** | react-helmet-async, @prerenderer/rollup-plugin |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)
- A Firebase project with Realtime Database and Authentication enabled

### Setup

```bash
# Clone the repository
git clone https://github.com/dev-dingguri/mandalart.git
cd mandalart

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your Firebase config values
```

The `.env` file requires the following variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Development

```bash
pnpm dev        # Start dev server at localhost:3000
```

### Build

```bash
pnpm build      # Type-check + production build (output: dist/)
pnpm preview    # Preview the production build locally
```

### Testing

```bash
pnpm test           # Run unit tests (Vitest)
pnpm test:watch     # Run unit tests in watch mode
pnpm test:e2e       # Run E2E tests (Playwright, Chromium)
pnpm test:e2e:ui    # Run E2E tests with interactive UI
```

### Deploy

```bash
pnpm deploy:firebase    # Deploy to Firebase Hosting (runs build first)
pnpm deploy:preview     # Deploy to a preview channel (expires in 7 days)
```

## Project Structure

```
src/
├── components/          # React components
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── locales/             # i18n resource bundles (ko, en, ja, zh-CN)
├── types/               # TypeScript type definitions
├── lib/                 # Utilities (Firebase client, helpers)
├── constants/           # App constants
└── assets/              # Static assets

e2e/                     # Playwright E2E tests
public/                  # Static files (favicon, OG images, fonts)
docs/                    # Design docs and migration history
```

## Data Model

```
TopicNode {
  text: string
  children: TopicNode[]    // 0 (leaf) or 8 children
}
```

A single mandalart consists of:
- **1 root** node (your central goal)
- **8 level-1** children (supporting themes)
- **64 level-2** children (concrete actions)
- **= 73 nodes** total

## License

[MIT](LICENSE) © dev-dingguri
