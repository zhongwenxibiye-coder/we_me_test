# 위미 (Wemi)

## Overview

인문계열 대학생을 위한 진로·멘토링 **웹(데스크톱 우선)** 서비스. 옥수수 캐릭터 "위미"를 마스코트로 한 따뜻한 톤의 웹앱.

## Artifacts

- `wemi` (react-vite, `/`) — 위미 메인 웹 앱
- `api-server` (express, `/api`) — 공유 API 서버 (healthz, mentor-applications)
- `mockup-sandbox` (`/__mockup`) — 디자인 프로토타이핑 캔버스

## Pages (wemi)

- `/` — 메인화면 (히어로, 가치 제안, 직무 미리보기, 멘토 미리보기, CTA)
- `/jobs`, `/jobs/:id` — 직무 학습
- `/mentors`, `/mentors/:id` — 졸업생 멘토링 + 멘토 상세/신청 폼
- `/admin` — 관리자 신청함 (ADMIN_PASSWORD 로그인, localStorage 보관)
- `/career-match`, `/creative-space`, `/humanities`, `/projects` — 준비중

## Backend

- DB: PostgreSQL (Replit) — `mentor_applications` 테이블 (id, mentorId, name, contact, topic, message, status, createdAt, readAt)
- 스키마: `lib/db/src/schema/mentor-applications.ts`, push: `pnpm --filter @workspace/db run push`
- API 계약: `lib/api-spec/openapi.yaml` → `pnpm --filter @workspace/api-spec run codegen`로 `@workspace/api-zod`, `@workspace/api-client-react` 생성
- 라우트: `artifacts/api-server/src/routes/mentor-applications.ts`
  - `POST /api/mentor-applications` — 공개, 신청 생성
  - `GET /api/mentor-applications` — 어드민 (x-admin-password)
  - `PATCH /api/mentor-applications/:id/status` — 어드민 (read|new 토글)
- 어드민 인증: `x-admin-password` 헤더, env `ADMIN_PASSWORD` (Secret)
- `lib/api-zod/src/index.ts`는 generated/types를 `Types` 네임스페이스로 re-export (Zod const와 TS type 이름 충돌 회피)

## Stack

- pnpm workspaces, Node 24, TypeScript 5.9
- React + Vite + Tailwind v4 + shadcn/ui + framer-motion + wouter
- TanStack Query + Orval generated hooks
- 폰트: Pretendard (CDN)
- 시드 데이터: `src/data/jobs.ts`, `src/data/mentors.ts`

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
