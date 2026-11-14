import assert from "node:assert/strict";
import { test } from "node:test";
import { compareStartupPostsByDeadline } from "./startupPostSort.ts";

test("모집중인 공고는 마감이 임박한 순서이고 마감일 없는 공고는 뒤에 온다", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-09-29T00:00:00Z"));
  const posts = [
    { id: 1, isActive: true, endDate: "" },
    { id: 2, isActive: true, endDate: "2026-10-30" },
    { id: 3, isActive: true, endDate: "2026-09-29" },
    { id: 4, isActive: true, endDate: "2026-10-01" },
  ];
  assert.deepEqual(posts.sort(compareStartupPostsByDeadline).map(p => p.id), [3, 4, 2, 1]);
});

test("전체보기는 모집중을 우선하고 마감된 공고는 최근 마감순이다", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-09-29T00:00:00Z"));
  const posts = [
    { id: 1, isActive: true, endDate: "2026-08-01" },
    { id: 2, isActive: true, endDate: "2026-09-29" },
    { id: 3, isActive: true, endDate: "2026-09-28" },
    { id: 4, isActive: false, endDate: null },
  ];
  assert.deepEqual(posts.sort(compareStartupPostsByDeadline).map(p => p.id), [2, 3, 1, 4]);
});

test("동일 마감일은 기존 순서를 유지한다", () => {
  const post = { isActive: false, endDate: "2026-09-28" };
  assert.equal(compareStartupPostsByDeadline(post, { ...post }), 0);
});
