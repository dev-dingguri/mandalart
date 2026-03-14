# CRA → Vite + pnpm 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRA + Craco + yarn 기반 빌드를 Vite + pnpm으로 교체한다. 소스 코드(컴포넌트, 훅, 로직)는 환경 변수 참조 외에는 변경하지 않는다.

**Architecture:** 패키지 매니저를 먼저 전환한 뒤, CRA 의존성을 제거하고 Vite를 설치/설정한다. 진입점(HTML, main.tsx)과 환경 변수를 Vite 규격에 맞게 변경한다.

**Tech Stack:** Vite 6, @vitejs/plugin-react, vite-tsconfig-paths, pnpm

---

## Chunk 1: pnpm 전환 + Vite 기반 구축

### Task 1: yarn → pnpm 전환

**Files:**
- Delete: `yarn.lock`
- Modify: `package.json` (scripts 내 `yarn` → `pnpm` 참조 변경)
- Create: `pnpm-lock.yaml` (pnpm install로 자동 생성)

- [ ] **Step 1: yarn.lock 삭제 + 기존 node_modules 삭제**

```bash
rm yarn.lock
rm -rf node_modules
```

yarn의 flat `node_modules` 구조와 pnpm의 symlink 기반 구조가 다르므로 반드시 삭제 후 재설치해야 한다.

- [ ] **Step 2: package.json의 yarn 참조 변경**

`package.json`의 `predeploy` 스크립트를 수정:

```json
// before
"predeploy": "yarn run build",
// after
"predeploy": "pnpm build",
```

- [ ] **Step 3: pnpm install 실행**

```bash
pnpm install
```

`pnpm-lock.yaml`이 생성되고 `node_modules`가 재설치된다.

- [ ] **Step 4: 기존 빌드 동작 확인**

```bash
pnpm build
```

Expected: CRA 빌드 성공 (아직 CRA 상태)

- [ ] **Step 5: 커밋**

```bash
git rm yarn.lock
git add package.json pnpm-lock.yaml
git commit -m "chore: yarn에서 pnpm으로 패키지 매니저 전환"
```

---

### Task 2: CRA/Craco 제거 + Vite 의존성 추가

**Files:**
- Delete: `craco.config.js`
- Modify: `package.json` (의존성 교체)

- [ ] **Step 1: CRA/Craco 관련 의존성 제거**

`package.json`에서 제거할 것:
- dependencies: `@craco/craco`, `react-scripts`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, `@types/jest`, `web-vitals`
- devDependencies: `craco-alias`, `gh-pages`

```bash
pnpm remove @craco/craco react-scripts craco-alias gh-pages @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest web-vitals
```

- [ ] **Step 2: Vite 관련 의존성 추가 + TypeScript 업그레이드**

```bash
pnpm add -D vite @vitejs/plugin-react vite-tsconfig-paths @types/node typescript
```

중요: TypeScript를 5.0+로 업그레이드한다. `moduleResolution: "bundler"` 옵션은 TypeScript 5.0 이상에서만 지원된다. `typescript`가 기존 `dependencies`에 있었으므로 `devDependencies`로 이동된다. `@types/node`도 마찬가지.

- [ ] **Step 3: craco.config.js 삭제**

```bash
rm craco.config.js
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: CRA/Craco 제거, Vite 의존성 추가"
```

---

### Task 3: Vite 설정 파일 생성

**Files:**
- Create: `vite.config.ts`

- [ ] **Step 1: vite.config.ts 작성**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
});
```

주요 결정사항:
- `tsconfigPaths()`: tsconfig.json의 `baseUrl: "./src"`를 Vite에서도 동작하게 함
- `outDir: 'build'`: CRA와 동일한 빌드 출력 경로 (Firebase Hosting 설정 유지)
- `server.port: 3000`: 기존 개발 서버 포트 유지

- [ ] **Step 2: 커밋**

```bash
git add vite.config.ts
git commit -m "chore: vite.config.ts 생성"
```

---

## Chunk 2: 진입점 마이그레이션 + 설정 업데이트

### Task 4: HTML 진입점 이동 + 변환

**Files:**
- Move: `public/index.html` → `index.html` (프로젝트 루트)
- Modify: `index.html` (Vite 형식으로 변환)

- [ ] **Step 1: public/index.html을 루트로 이동**

```bash
mv public/index.html index.html
```

- [ ] **Step 2: index.html을 Vite 형식으로 수정**

변경사항:
1. `%PUBLIC_URL%` → `` (빈 문자열 — Vite는 public/ 디렉토리를 루트로 자동 서빙)
2. `<body>` 끝에 `<script type="module" src="/src/main.tsx"></script>` 추가

수정 후 전체 파일:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <link rel="alternate" hreflang="x-default" href="https://mandalart.me/" />
  <link rel="alternate" hreflang="en" href="https://mandalart.me/en/" />
  <link rel="alternate" hreflang="ko" href="https://mandalart.me/ko/" />
  <link rel="alternate" hreflang="ja" href="https://mandalart.me/ja/" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Mandalart - Organize and expand your thinking.</title>
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://mandalart.me/">
  <meta property="og:image" content="/image.png">
  <meta property="og:site_name" content="Mandalart">
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

- [ ] **Step 3: 커밋**

```bash
git add index.html
git rm public/index.html
git commit -m "chore: index.html을 루트로 이동하고 Vite 형식으로 변환"
```

---

### Task 5: JS 진입점 + 환경 변수 + 타입 선언 마이그레이션

**Files:**
- Rename: `src/index.tsx` → `src/main.tsx`
- Modify: `src/main.tsx` (환경 변수 참조 변경)
- Delete: `src/react-app-env.d.ts`
- Create: `src/vite-env.d.ts`
- Modify: `template.env` (변수명 변경)
- Delete: `src/reportWebVitals.ts` (CRA 전용 유틸리티)
- Delete: `src/setupTests.ts` (Jest 설정)
- Delete: `src/App.test.tsx` (동작하지 않는 CRA 보일러플레이트 테스트)

- [ ] **Step 1: index.tsx → main.tsx 이름 변경**

```bash
git mv src/index.tsx src/main.tsx
```

- [ ] **Step 2: main.tsx의 환경 변수 참조 변경**

`process.env.REACT_APP_*` → `import.meta.env.VITE_*`로 6곳 변경:

```typescript
// before
apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
appId: process.env.REACT_APP_FIREBASE_APP_ID,
measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,

// after
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
appId: import.meta.env.VITE_FIREBASE_APP_ID,
measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
```

- [ ] **Step 3: main.tsx에서 reportWebVitals 관련 코드 제거**

`import reportWebVitals` 구문과 마지막의 `reportWebVitals()` 호출을 제거한다.

- [ ] **Step 4: 타입 선언 파일 교체**

```bash
rm src/react-app-env.d.ts
```

`src/vite-env.d.ts` 생성:

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 5: template.env 변수명 변경**

```
# before
REACT_APP_FIREBASE_API_KEY =
REACT_APP_FIREBASE_AUTH_DOMAIN =
REACT_APP_FIREBASE_DATABASE_URL =
REACT_APP_FIREBASE_PROJECT_ID =
GENERATE_SOURCEMAP = false

# after
VITE_FIREBASE_API_KEY =
VITE_FIREBASE_AUTH_DOMAIN =
VITE_FIREBASE_DATABASE_URL =
VITE_FIREBASE_PROJECT_ID =
VITE_FIREBASE_APP_ID =
VITE_FIREBASE_MEASUREMENT_ID =
```

참고:
- `GENERATE_SOURCEMAP`은 Vite에서 `vite.config.ts`의 `build.sourcemap`으로 대체되었으므로 제거.
- `APP_ID`와 `MEASUREMENT_ID`는 기존 template.env에 누락되어 있었으나, 실제 코드에서 사용하므로 이번에 추가한다.

- [ ] **Step 6: 실제 .env 파일도 변수명 변경 (로컬 작업)**

로컬에 `.env` 파일이 있다면 동일하게 `REACT_APP_*` → `VITE_*`로 변경해야 한다.
이 파일은 git-tracked가 아니므로 커밋에 포함되지 않는다.

- [ ] **Step 7: CRA 보일러플레이트 파일 삭제**

```bash
rm src/reportWebVitals.ts src/setupTests.ts src/App.test.tsx
```

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "chore: 진입점, 환경 변수, 타입 선언을 Vite 규격으로 마이그레이션"
```

---

### Task 6: tsconfig.json 업데이트 + ESLint 설정 + package.json 스크립트

**Files:**
- Modify: `tsconfig.json`
- Modify: `package.json` (scripts, eslintConfig 제거)

- [ ] **Step 1: tsconfig.json 업데이트**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": {}
  },
  "include": ["src", "vite.config.ts"]
}
```

주요 변경:
- `target`: `es5` → `ES2020` (현대 브라우저 타겟)
- `moduleResolution`: `node` → `bundler` (Vite 권장, TypeScript 5.0+ 필요)
- `include`: `["src", "vite.config.ts"]` 추가 (vite.config.ts도 타입 체크 대상에 포함)
- `allowJs`: 기존 값(`true`) 유지 (기존 동작 변경 최소화)

- [ ] **Step 2: package.json scripts 업데이트**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "predeploy": "pnpm build",
    "deploy": "firebase deploy"
  }
}
```

- [ ] **Step 3: package.json의 eslintConfig, browserslist 제거**

이 두 필드를 `package.json`에서 제거한다:
- `eslintConfig` (react-app 프리셋은 CRA 전용)
- `browserslist` (Vite는 자체 브라우저 타겟 설정 사용)

- [ ] **Step 4: 커밋**

```bash
git add package.json tsconfig.json
git commit -m "chore: tsconfig, scripts, ESLint를 Vite 규격으로 업데이트"
```

---

### Task 7: 빌드 및 개발 서버 검증

- [ ] **Step 1: pnpm install (의존성 동기화)**

```bash
pnpm install
```

- [ ] **Step 2: TypeScript 타입 체크**

```bash
pnpm exec tsc -b
```

Expected: 에러 없음

- [ ] **Step 3: Vite 빌드 검증**

```bash
pnpm build
```

Expected: `build/` 디렉토리에 번들 생성, 에러 없음

- [ ] **Step 4: 개발 서버 실행 확인**

```bash
pnpm dev
```

Expected: `http://localhost:3000`에서 앱이 정상 렌더링

- [ ] **Step 5: 수동 검증 체크리스트**

브라우저에서 다음을 확인:
1. 메인 페이지 렌더링
2. 다크/라이트 모드 전환
3. 만다라트 그리드 표시
4. 다국어 전환 (ko/en/ja/zh-CN)
5. 콘솔에 에러 없음

검증 완료 후 별도 커밋 불필요 (코드 변경 없음).

---

## 실행 중 발견된 사항

### Vite 8 사용 금지 (MUI 5 호환 문제)

Vite 8은 Rolldown(Rust 기반 번들러)을 사용하는데, MUI 5의 `@emotion/styled` CJS 모듈을 ESM으로 변환할 때 default export를 인식하지 못한다. 개발 서버에서 다음 에러가 발생:

```
Uncaught TypeError: (0 , __toESM(...).default) is not a function
    at styled-*.js
```

`optimizeDeps.include`로 해결 시도했으나 실패. **Vite 6으로 다운그레이드하여 해결.** MUI 5를 사용하는 동안은 Vite 8을 사용하지 말 것.

### lodash 직접 의존성 필요

`lodash`가 `package.json`의 `dependencies`에 없었고, CRA(`react-scripts`)의 transitive dependency로 동작하고 있었다. CRA 제거 후 빌드 에러 발생. `pnpm add lodash`로 해결.

### pnpm + CRA 사용 시 shamefully-hoist 필요

pnpm의 기본 symlink 기반 `node_modules` 구조에서 CRA의 ESLint 설정이 플러그인 충돌을 일으킨다. `.npmrc`에 `shamefully-hoist=true`를 추가하여 해결. CRA 제거 후에는 이 설정 제거 가능.
