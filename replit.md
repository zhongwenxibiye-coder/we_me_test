# 위미 (Wemi)

## Overview

인문계열 대학생을 위한 진로·멘토링 **웹(데스크톱 우선)** 서비스. 옥수수 캐릭터 "위미"를 마스코트로 한 따뜻한 톤의 웹앱.

## Artifacts

- `wemi` (react-vite, `/`) — 위미 메인 웹 앱
- `api-server` (express, `/api`) — 공유 API 서버 (현재 healthz만)
- `mockup-sandbox` (`/__mockup`) — 디자인 프로토타이핑 캔버스

## Pages (wemi)

- `/` — 메인화면 (히어로, 가치 제안, 직무 미리보기, 멘토 미리보기, CTA)
- `/jobs` — 직무 학습 (검색·카테고리 필터, 카드 그리드)
- `/mentors` — 졸업생 멘토링 (검색·분야 필터, 카드 그리드)

## Stack

- pnpm workspaces, Node 24, TypeScript 5.9
- React + Vite + Tailwind v4 + shadcn/ui + framer-motion + wouter
- 폰트: Pretendard (CDN)
- 데이터: mock seed (`src/data/jobs.ts`, `src/data/mentors.ts`) — 백엔드 미사용

## Layout

- `WebShell` — 상단 sticky 헤더(로고+네비), 본문, 푸터 구조
- 컨테이너: `max-w-6xl` 가운데 정렬, `px-6 lg:px-10`

## Design tokens (wemi)

- Primary: 옥수수 노랑 (HSL 45 92% 55%)
- Secondary/accent: 잎사귀 초록 (HSL 88 45% 55%)
- Background: 따뜻한 크림 (HSL 45 60% 97%)
- Foreground: 부드러운 갈색 (HSL 30 35% 18%)
- Radius: 1rem (둥글둥글)
- 마스코트: `/wemi-character.png` (public)

## Key Commands

- `pnpm run typecheck` — 전체 타입체크
- `pnpm run build` — 전체 빌드
- `pnpm --filter @workspace/wemi run dev` — wemi 로컬 실행
