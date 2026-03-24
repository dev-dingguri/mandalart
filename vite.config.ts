import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import prerender from '@prerenderer/rollup-plugin';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

// puppeteer 번들 Chromium이 없는 환경(CI, Windows pnpm 등)을 위한 Chrome 경로 탐색
// CHROME_EXECUTABLE_PATH 환경 변수로 오버라이드 가능
const CHROME_PATHS: Record<string, string> = {
  win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome',
};
const chromePath =
  process.env.CHROME_EXECUTABLE_PATH ??
  CHROME_PATHS[process.platform] ??
  undefined;

// 프리렌더링된 HTML에서 index.html 원본 메타 태그(fallback용)와 SEOHead가 생성한 태그가
// 중복되므로, SEOHead 태그(data-rh 없음)만 남기고 원본 fallback 태그를 제거
function dedupeMetaTags(html: string): string {
  // react-helmet-async가 생성한 태그가 있으면 index.html 원본 fallback 제거
  // SEOHead 태그: data-rh 속성 없음, 원본: data-rh="true" 없지만 항상 뒤에 위치
  // 전략: 중복 <title> 중 두 번째 제거, 중복 og:/twitter: 메타 중 두 번째 제거
  const titleCount = (html.match(/<title[\s>]/g) || []).length;
  if (titleCount > 1) {
    // 첫 번째 <title>은 SEOHead(언어별), 두 번째는 index.html fallback(영어) — 두 번째 제거
    let found = 0;
    html = html.replace(/<title[^>]*>[^<]*<\/title>/g, (match) => {
      found++;
      return found > 1 ? '' : match;
    });
  }

  // property/name 기준으로 중복 <meta> 제거 — 마지막(SEOHead 생성) 것만 유지
  // index.html 원본이 앞, SEOHead가 뒤에 위치하므로 앞의 것(원본 fallback)을 제거
  const metaKeys = ['og:', 'twitter:', 'description'];
  const metaMatches: { key: string; index: number }[] = [];
  html.replace(/<meta\s[^>]*>/g, (match, offset) => {
    const propMatch = match.match(/(?:property|name)="([^"]+)"/);
    if (propMatch) {
      const key = propMatch[1];
      if (metaKeys.some((prefix) => key === prefix || key.startsWith(prefix))) {
        metaMatches.push({ key, index: offset });
      }
    }
    return match;
  });
  // 뒤에서부터 본 key 기준으로, 앞쪽 중복을 제거 대상으로 표시
  const lastSeen = new Map<string, number>();
  for (const { key, index } of metaMatches) {
    lastSeen.set(key, Math.max(lastSeen.get(key) ?? -1, index));
  }
  const removeOffsets = new Set(
    metaMatches
      .filter(({ key, index }) => lastSeen.get(key) !== index)
      .map(({ index }) => index),
  );
  if (removeOffsets.size > 0) {
    html = html.replace(/<meta\s[^>]*>/g, (match, offset) =>
      removeOffsets.has(offset) ? '' : match,
    );
  }

  return html;
}

// 빌드 후처리: sitemap lastmod 갱신 + 프리렌더링 HTML 메타 태그 중복 제거
function postBuildSeo(): Plugin {
  return {
    name: 'post-build-seo',
    closeBundle() {
      const buildDir = resolve(__dirname, 'build');

      // 1. sitemap.xml lastmod를 오늘 날짜로 갱신
      try {
        const sitemapPath = resolve(buildDir, 'sitemap.xml');
        const today = new Date().toISOString().split('T')[0];
        const content = readFileSync(sitemapPath, 'utf-8');
        writeFileSync(
          sitemapPath,
          content.replace(
            /<lastmod>[^<]+<\/lastmod>/g,
            `<lastmod>${today}</lastmod>`,
          ),
        );
      } catch {
        // sitemap.xml이 없으면 무시 (dev 모드 등)
      }

      // 2. 프리렌더링된 HTML에서 중복 메타 태그 제거 (루트 index.html은 SPA fallback이므로 제외)
      const walkHtml = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const fullPath = join(dir, entry);
          if (statSync(fullPath).isDirectory()) {
            walkHtml(fullPath);
          } else if (
            entry === 'index.html' &&
            fullPath !== join(buildDir, 'index.html')
          ) {
            const html = readFileSync(fullPath, 'utf-8');
            const cleaned = dedupeMetaTags(html);
            if (cleaned !== html) writeFileSync(fullPath, cleaned);
          }
        }
      };
      try {
        walkHtml(buildDir);
      } catch {
        /* build 폴더 없으면 무시 */
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // 콘텐츠 페이지(랜딩·가이드)를 전 언어 프리렌더링 — /app은 로그인이 필요한 도구 페이지이므로 제외
    prerender({
      routes: [
        '/ko',
        '/ko/guide',
        '/en',
        '/en/guide',
        '/ja',
        '/ja/guide',
        '/zh-CN',
        '/zh-CN/guide',
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
    postBuildSeo(),
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
          // lucide-react 분리 — 콘텐츠 페이지(랜딩/가이드)는 아이콘만 필요하므로
          // Radix UI 전체(vendor-ui)를 같이 로드하지 않도록 별도 청크로 분리
          'vendor-icons': ['lucide-react'],
          'vendor-ui': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-toggle',
            '@radix-ui/react-tooltip',
          ],
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
