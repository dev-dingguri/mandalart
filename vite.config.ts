import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import prerender from '@prerenderer/rollup-plugin';

// puppeteer 번들 Chromium이 없는 환경(CI, Windows pnpm 등)을 위한 Chrome 경로 탐색
// CHROME_EXECUTABLE_PATH 환경 변수로 오버라이드 가능
const CHROME_PATHS: Record<string, string> = {
  win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome',
};
const chromePath =
  process.env.CHROME_EXECUTABLE_PATH ?? CHROME_PATHS[process.platform] ?? undefined;

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // 콘텐츠 페이지(랜딩·가이드)를 전 언어 프리렌더링 — /app은 로그인이 필요한 도구 페이지이므로 제외
    prerender({
      routes: [
        '/ko', '/ko/guide',
        '/en', '/en/guide',
        '/ja', '/ja/guide',
        '/zh-CN', '/zh-CN/guide',
      ],
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        // App.tsx의 useEffect에서 dispatch하는 이벤트를 기다린 뒤 HTML 캡처
        // 이벤트 없이 캡처하면 React 마운트 전 빈 div만 스냅샷될 수 있음
        renderAfterDocumentEvent: 'render-event',
        // puppeteer 번들 Chromium 대신 시스템 Chrome 사용 (경로가 없으면 puppeteer 기본값 사용)
        ...(chromePath ? { executablePath: chromePath } : {}),
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['react-router'],
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/database',
            'firebase/analytics',
          ],
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toggle', '@radix-ui/react-separator', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
