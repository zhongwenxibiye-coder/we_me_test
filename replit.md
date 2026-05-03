# 위미 (Wemi)

## Overview

인문계열 대학생을 위한 진로·멘토링 **웹(데스크톱 우선)** 서비스. 옥수수 캐릭터 "위미"를 마스코트로 한 따뜻한 톤의 웹앱.

## Artifacts

- `wemi` (react-vite, `/`) — 위미 메인 웹 앱
- `api-server` (express, `/api`) — 공유 API 서버
- `mockup-sandbox` (`/__mockup`) — 디자인 프로토타이핑 캔버스

## Pages (wemi)

- `/` — 메인화면 (히어로, 위미의 가치, Features)
- `/jobs`, `/jobs/:id` — 직무 학습 (정적 데이터)
- `/mentors` — 졸업생 멘토링 목록 (DB)
- `/mentors/:id` — 멘토 허브 (프로필+아티클 목록+신청링크+후원)
- `/mentors/:id/articles/:articleId` — 아티클 상세
- `/mentors/:id/apply` — 1:1 멘토링 신청 폼 (이메일 only, 100자+)
- `/career-match` — 커리어 매칭 (창업 신청 폼 + 프로젝트 목록)
- `/career-match/result/:id` — 창업 신청 결과 (공개)
- `/admin` — 관리자 (4탭: 멘토링 신청함 / 멘토 관리 / 직무 관리 / 창업 아이디어)
- `/creative-space`, `/humanities`, `/projects` — 준비중

## Backend

- DB: PostgreSQL (Replit) — 5개 테이블
  - `mentor_applications` — 멘토링 신청 (mentorId TEXT, name, contact, topic, message, status)
  - `mentors` — 멘토 프로필 (DB CRUD, integer PK)
  - `mentor_articles` — 멘토별 아티클 (mentorId → mentors.id)
  - `job_listings` — 직무 목록 (learning JSON)
  - `startup_applications` — 창업 신청 (result: 도전가능/도전불가능)
- 스키마: `lib/db/src/schema/`, push: `pnpm --filter @workspace/db run push`
- API 계약: `lib/api-spec/openapi.yaml` → codegen: `pnpm --filter @workspace/api-spec run codegen`
- 생성물: `@workspace/api-client-react` (TanStack Query hooks), `@workspace/api-zod` (Zod schemas)
- 어드민 인증: `x-admin-password` 헤더, env `ADMIN_PASSWORD` (Secret)
- `lib/api-zod/src/index.ts`는 generated/types를 `Types` 네임스페이스로 re-export (충돌 회피)

## Key Routes (api-server)

- `GET/POST /api/mentors` — 멘토 목록/추가
- `GET/PUT/DELETE /api/mentors/:id` — 멘토 상세/수정/삭제
- `GET/POST /api/mentors/:mentorId/articles` — 아티클 목록/추가
- `PUT/DELETE /api/mentor-articles/:id` — 아티클 수정/삭제
- `GET/POST /api/job-listings` — 직무 목록/추가
- `PUT/DELETE /api/job-listings/:id` — 직무 수정/삭제
- `POST/GET /api/startup-applications` — 창업 신청/목록(어드민)
- `GET /api/startup-applications/:id` — 공개 결과 조회
- `PATCH /api/startup-applications/:id/result` — 결과 설정(어드민)
- `POST/GET /api/mentor-applications` — 멘토링 신청/목록(어드민)
- `PATCH /api/mentor-applications/:id/status` — 상태 토글(어드민)

## Stack

- pnpm workspaces, Node 24, TypeScript 5.9
- React + Vite + Tailwind v4 + shadcn/ui + framer-motion + wouter
- TanStack Query + Orval generated hooks
- 폰트: Pretendard (CDN)
- Drizzle ORM

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
- `pnpm --filter @workspace/db run push` — DB 스키마 push
- `pnpm --filter @workspace/api-spec run codegen` — OpenAPI → hooks 생성
