# Mandalart

## 빌드 & 개발

- 패키지 매니저: pnpm
- 빌드 도구: Vite 6
- `pnpm dev` — 개발 서버 (localhost:3000)
- `pnpm build` — 프로덕션 빌드 (`tsc -b && vite build`, 출력: `build/`)
- `pnpm preview` — 빌드 결과 미리보기
- `pnpm deploy` — Firebase 배포

## 기술 스택

- React 18 + TypeScript 5
- MUI 5 + Emotion (CSS-in-JS)
- Firebase (Auth, Realtime Database, Analytics, Hosting)
- react-router-dom v6, i18next, usehooks-ts

## 환경 변수

- Vite 규격: `VITE_` 접두사 사용 (`import.meta.env.VITE_*`)
- Firebase 설정: `.env` 파일에 `VITE_FIREBASE_*` 변수 필요 (template.env 참조)

## 프로젝트 구조

- `src/components/` — React 컴포넌트
- `src/hooks/` — 커스텀 훅 (인증/DB/상태관리)
- `src/contexts/` — React Context (FirebaseSdks, Loading)
- `src/locales/` — 다국어 리소스 (ko, en, ja, zh-CN)
- `src/types/` — TypeScript 타입 (Snippet, TopicNode)
