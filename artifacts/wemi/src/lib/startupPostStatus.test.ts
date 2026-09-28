import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isStartupPostRecruiting } from "./startupPostStatus.ts";

const deadline = "2026-09-29";

for (const [description, instant, expected] of [
  ["마감일 전날 (한국 시간)", "2026-09-27T15:00:00.000Z", true],
  ["마감일 당일 시작 (한국 시간)", "2026-09-28T15:00:00.000Z", true],
  ["마감일 당일 마지막 순간 (한국 시간)", "2026-09-29T14:59:59.999Z", true],
  ["마감일 다음날 시작 (한국 시간)", "2026-09-29T15:00:00.000Z", false],
] as const) {
  test(description, (t) => {
    t.mock.method(Date, "now", () => new Date(instant).getTime());
    assert.equal(isStartupPostRecruiting({ isActive: true, endDate: deadline }), expected);
  });
}

test("마감일이 없으면 수동 설정만 적용한다", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-09-29T15:00:00.000Z"));
  assert.equal(isStartupPostRecruiting({ isActive: true, endDate: null }), true);
  assert.equal(isStartupPostRecruiting({ isActive: true, endDate: "" }), true);
  assert.equal(isStartupPostRecruiting({ isActive: false, endDate: null }), false);
});

test("수동으로 끄면 마감일 전이나 당일에도 모집마감이다", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-09-28T15:00:00.000Z"));
  assert.equal(isStartupPostRecruiting({ isActive: false, endDate: deadline }), false);
});

test("관리자 배지와 공개 공고·필터가 공통 판정 함수를 사용한다", () => {
  const admin = readFileSync(new URL("../pages/Admin.tsx", import.meta.url), "utf8");
  const publicPage = readFileSync(new URL("../pages/CareerMatch.tsx", import.meta.url), "utf8");

  for (const page of [admin, publicPage]) {
    assert.match(page, /import \{ isStartupPostRecruiting \} from ["']@\/lib\/startupPostStatus["']/);
    assert.match(page, /const recruiting = isStartupPostRecruiting\(\w+\);/);
    assert.match(page, /\{recruiting \? "모집중" : "모집마감"\}/);
  }
  assert.match(admin, /const recruiting = isStartupPostRecruiting\(p\);/);
  assert.match(admin, /data-testid=\{`status-startup-post-\$\{p\.id\}`\}[^>]*>\{recruiting \? "모집중" : "모집마감"\}/);
  assert.match(publicPage, /const recruiting = isStartupPostRecruiting\(post\);/);
  assert.match(publicPage, /filter === "all" \|\| isStartupPostRecruiting\(post\) === \(filter === "open"\)/);
});