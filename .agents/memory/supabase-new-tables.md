---
name: Supabase new tables needed
description: SQL to run in Supabase dashboard for community view counts and humanities article likes/views
---

The following tables must be created in Supabase dashboard (SQL Editor) for full functionality.
Code already handles graceful failure if tables don't exist.

```sql
-- 커뮤니티 게시글 조회수 (현재 미구현 - 추후 필요 시 추가)
-- create table if not exists post_views (
--   id uuid primary key default gen_random_uuid(),
--   post_id text not null,
--   session_id text not null,
--   created_at timestamptz default now(),
--   unique(post_id, session_id)
-- );

-- 인문학 아티클 좋아요
create table if not exists humanities_article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id integer not null,
  user_id uuid not null,
  created_at timestamptz default now(),
  unique(article_id, user_id)
);

-- 인문학 아티클 조회수
create table if not exists humanities_article_views (
  id uuid primary key default gen_random_uuid(),
  article_id integer not null,
  session_id text not null,
  created_at timestamptz default now(),
  unique(article_id, session_id)
);
```

**Why:** These features (likes, view counts) require server-side persistence. The client code silently fails if tables are absent, so the app won't break.
