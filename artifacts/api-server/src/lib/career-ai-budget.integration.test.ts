import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { CareerBudgetExceeded, koreaDay, reserveCareerAiCall, reuseCareerResponse } from "./career-ai-budget.ts";

test("usage day resets at Korea midnight rather than UTC midnight", () => {
  assert.equal(koreaDay(Date.parse("2026-11-20T14:59:59Z")), "2026-11-20");
  assert.equal(koreaDay(Date.parse("2026-11-20T15:00:00Z")), "2026-11-21");
});

test("duplicate requests share one generation and cannot cross member accounts", async () => {
  const id = randomUUID();
  let calls = 0;
  const generate = async () => { calls++; await new Promise((resolve) => setTimeout(resolve, 10)); return "answer"; };
  const values = await Promise.all([reuseCareerResponse(id, "same", generate), reuseCareerResponse(id, "same", generate)]);
  assert.deepEqual(values, ["answer", "answer"]);
  assert.equal(calls, 1);
  await reuseCareerResponse(`${id}-other`, "same", generate);
  assert.equal(calls, 2);
});

test("database reservations enforce global/member caps atomically without any AI calls", async () => {
  // An isolated future day avoids changing today's real service allowance.
  const now = Date.parse("2098-12-30T00:00:00Z") + Math.floor(Math.random() * 100000) * 86400000;
  const day = koreaDay(now);
  const members = [`budget-test-${randomUUID()}`, `budget-test-${randomUUID()}`];
  try {
    await pool.query("INSERT INTO career_ai_usage(scope,day,used) VALUES('service',$1,299)", [day]);
    const globalResults = await Promise.allSettled(members.map((id) => reserveCareerAiCall(id, now)));
    assert.equal(globalResults.filter((r) => r.status === "fulfilled").length, 1);
    assert.ok(globalResults.some((r) => r.status === "rejected" && r.reason instanceof CareerBudgetExceeded));
    let rows = await pool.query("SELECT used FROM career_ai_usage WHERE scope='service' AND day=$1", [day]);
    assert.equal(rows.rows[0].used, 300);
    await pool.query("UPDATE career_ai_usage SET used=0 WHERE scope='service' AND day=$1", [day]);
    await pool.query("INSERT INTO career_ai_usage(scope,day,used) VALUES($1,$2,14) ON CONFLICT(scope,day) DO UPDATE SET used=14", [`member:${members[0]}`, day]);
    const memberResults = await Promise.allSettled([reserveCareerAiCall(members[0], now), reserveCareerAiCall(members[0], now)]);
    assert.equal(memberResults.filter((r) => r.status === "fulfilled").length, 1);
    rows = await pool.query("SELECT scope,used FROM career_ai_usage WHERE day=$1", [day]);
    assert.equal(rows.rows.find((row) => row.scope === `member:${members[0]}`).used, 15);
    assert.equal(rows.rows.find((row) => row.scope === "service").used, 1, "rejected member request rolls back global reservation");
  } finally {
    await pool.query("DELETE FROM career_ai_usage WHERE day=$1 AND scope=ANY($2)", [day, ["service", ...members.map((id) => `member:${id}`)]]);
    await pool.end();
  }
});
