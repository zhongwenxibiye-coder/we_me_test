# 위미 (Wemi)

## Overview

인문계열 대학생을 위한 진로·멘토링 모바일 웹 서비스. 옥수수 캐릭터 "위미"를 마스코트로 한 따뜻한 톤의 PWA 스타일 웹앱.

## Artifacts

- `wemi` (react-vite, `/`) — 위미 메인 웹 앱 (모바일 우선)
- `api-server` (express, `/api`) — 공유 API 서버 (현재 healthz만)
- `mockup-sandbox` (`/__mockup`) — 디자인 프로토타이핑 캔버스

## Pages (wemi)

- `/` — 랜딩 (히어로, 가치 제안, 멘토 미리보기, CTA)
- `/login` — 로그인 (localStorage 기반 mock 인증)
- `/signup` — 회원가입 (이름, 이메일, 학교, 전공, 졸업연도)
- `/jobs` — 직무 학습 콘텐츠 목록 (검색·카테고리 필터)
- `/mentors` — 졸업생 멘토 목록 (검색·분야 필터)
- `/mentors/:id/apply` — 멘토링 신청 폼
- `/me` — 마이페이지

## Stack

- pnpm workspaces, Node 24, TypeScript 5.9
- React + Vite + Tailwind v4 + shadcn/ui + framer-motion + wouter
- react-hook-form + zod
- 폰트: Pretendard (CDN)
- 데이터: 현재는 mock seed (`src/data/jobs.ts`, `src/data/mentors.ts`) + localStorage

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
- `pnpm --filter @workspace/api-spec run codegen` — API 코드젠 (현재 미사용)
