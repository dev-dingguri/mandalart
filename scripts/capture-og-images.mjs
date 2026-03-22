/**
 * 페이지별 OG 이미지 자동 캡처 스크립트
 * 1200×630 뷰포트에서 각 랜딩/가이드 페이지 스크린샷을 찍어 public/ 폴더에 저장
 *
 * 사용법: node scripts/capture-og-images.mjs [--base-url http://localhost:3000]
 */
import puppeteer from 'puppeteer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3000';

// OG 이미지 권장 사이즈
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const PAGES = [
  { path: '/ko', filename: 'og-landing-ko.png' },
  { path: '/en', filename: 'og-landing-en.png' },
  { path: '/ko/guide', filename: 'og-guide-ko.png' },
  { path: '/en/guide', filename: 'og-guide-en.png' },
];

// puppeteer 번들 Chromium이 없는 환경을 위한 Chrome 경로 탐색
const CHROME_PATHS = {
  win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome',
};
const chromePath = process.env.CHROME_EXECUTABLE_PATH ?? CHROME_PATHS[process.platform];

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    ...(chromePath ? { executablePath: chromePath } : {}),
  });

  for (const { path, filename } of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: OG_WIDTH, height: OG_HEIGHT });
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0' });

    // 라이트 모드 강제 — OG 이미지는 라이트 모드가 보편적
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    // 스타일 재적용 대기
    await new Promise((r) => setTimeout(r, 500));

    const outputPath = resolve(PUBLIC_DIR, filename);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✓ ${filename} saved`);
    await page.close();
  }

  await browser.close();
  console.log('\nDone! OG images saved to public/');
}

capture().catch((err) => {
  console.error('Failed to capture OG images:', err);
  process.exit(1);
});
