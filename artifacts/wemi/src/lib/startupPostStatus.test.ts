import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  getKoreanToday,
  isStartupPostRecruiting,
  millisecondsUntilNextKoreanDay,
  watchKoreanToday,
} from "./startupPostStatus.ts";

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

test("열어 둔 화면에서 한국 시간 자정이 되면 배지·필터·신청 링크가 마감으로 바뀐다", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: new Date("2026-09-29T14:59:59.900Z") });
  const visibility = new EventTarget();
  const post = { isActive: true, endDate: deadline, applicationUrl: "https://example.com/apply" };
  let today = getKoreanToday();
  const state = () => ({
    badge: isStartupPostRecruiting(post, today) ? "모집중" : "모집마감",
    inOpenFilter: isStartupPostRecruiting(post, today),
    inClosedFilter: !isStartupPostRecruiting(post, today),
    showApplyLink: isStartupPostRecruiting(post, today) && !!post.applicationUrl,
  });
  const stop = watchKoreanToday((day) => { today = day; }, visibility);

  assert.equal(millisecondsUntilNextKoreanDay(), 100);
  assert.deepEqual(state(), { badge: "모집중", inOpenFilter: true, inClosedFilter: false, showApplyLink: true });
  t.mock.timers.tick(99);
  assert.equal(state().badge, "모집중");
  t.mock.timers.tick(1);
  assert.deepEqual(state(), { badge: "모집마감", inOpenFilter: false, inClosedFilter: true, showApplyLink: false });
  stop();
  t.mock.timers.tick(24 * 60 * 60 * 1000);
  assert.equal(today, "2026-09-30");
});

test("절전으로 자정 타이머가 밀리면 화면을 다시 볼 때 날짜를 확인한다", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: new Date("2026-09-29T14:59:59.900Z") });
  const visibility = new EventTarget();
  let today = "";
  const stop = watchKoreanToday((day) => { today = day; }, visibility);
  t.mock.timers.setTime(Date.parse("2026-09-29T15:01:00.000Z"));
  visibility.dispatchEvent(new Event("visibilitychange"));
  assert.equal(today, "2026-09-30");
  assert.equal(isStartupPostRecruiting({ isActive: true, endDate: deadline }, today), false);
  stop();
});

test("관리자 배지와 공개 공고·필터가 공통 판정 함수를 사용한다", () => {
  const admin = readFileSync(new URL("../pages/Admin.tsx", import.meta.url), "utf8");
  const publicPage = readFileSync(new URL("../pages/CareerMatch.tsx", import.meta.url), "utf8");

  for (const page of [admin, publicPage]) {
    assert.match(page, /import \{ isStartupPostRecruiting \} from ["']@\/lib\/startupPostStatus["']/);
    assert.match(page, /const todayInKorea = useKoreanToday\(\);/);
    assert.match(page, /const recruiting = isStartupPostRecruiting\(\w+, todayInKorea\);/);
    assert.match(page, /\{recruiting \? "모집중" : "모집마감"\}/);
  }
  assert.match(admin, /isStartupPostRecruiting\(postForm, todayInKorea\)/);
  assert.match(admin, /const recruiting = isStartupPostRecruiting\(p, todayInKorea\);/);
  assert.match(admin, /data-testid=\{`status-startup-post-\$\{p\.id\}`\}[^>]*>\{recruiting \? "모집중" : "모집마감"\}/);
  assert.match(publicPage, /const recruiting = isStartupPostRecruiting\(post, todayInKorea\);/);
  assert.match(publicPage, /filter === "all" \|\| isStartupPostRecruiting\(post, todayInKorea\) === \(filter === "open"\)/);
  assert.match(publicPage, /recruiting && post\.applicationUrl/);
});