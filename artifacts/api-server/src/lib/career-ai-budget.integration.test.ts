import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import {
  CareerBudgetExceeded, CareerRequestConflict, FIRST_CAREER_QUESTION, koreaDay, runBudgetedCareerTurn,
} from "./career-ai-budget.ts";
import { BUDGET_SCOPE, DAILY_BUDGET_NANO_USD, reserveEstimateNanoUsd, tokenCostNanoUsd } from "./career-ai-pricing.ts";

test("Korea midnight defines the daily exploration and budget reset", () => {
  assert.equal(koreaDay(Date.parse("2026-11-20T14:59:59Z")), "2026-11-20");
  assert.equal(koreaDay(Date.parse("2026-11-20T15:00:00Z")), "2026-11-21");
});

test("dollar estimates include Korean bytes, response schema and maximum output", () => {
  assert.equal(tokenCostNanoUsd(1_000_000, 0), 750_000_000);
  assert.equal(tokenCostNanoUsd(0, 1_000_000), 4_500_000_000);
  const payload = { messages: [{ content: "한국어 테스트" }], response_format: { schema: "schema" } };
  assert.ok(reserveEstimateNanoUsd(payload, 2048) >= tokenCostNanoUsd(Buffer.byteLength(JSON.stringify(payload)), 2048));
  assert.throws(() => tokenCostNanoUsd(-1, 1));
});

test("daily session, durable replay, simultaneous budget reservations and failure accounting", async () => {
  const now = Date.parse("2098-01-01T00:00:00Z") + Math.floor(Math.random() * 100000) * 86400000;
  const day = koreaDay(now);
  const memberId = `budget-test-${randomUUID()}`;
  const member2 = `budget-test-${randomUUID()}`;
  const members = [memberId, member2];
  const messages = [{ role: "assistant" as const, content: FIRST_CAREER_QUESTION }, { role: "user" as const, content: "글쓰기" }];
  const generated = { question: "어떤 글쓰기가 좋았나요?", summary: "", recommendations: [] };
  let calls = 0;
  const generate = async () => { calls++; return { result: generated, usage: { prompt_tokens: 100, completion_tokens: 100 } }; };
  const args = { memberId, day, messages, reserveNanoUsd: 20_000_000, generate, now };
  try {
    await runBudgetedCareerTurn(args);
    assert.equal(calls, 1);
    let ledger = await pool.query("SELECT used FROM career_ai_usage WHERE scope=$1 AND day=$2", [BUDGET_SCOPE, day]);
    assert.equal(ledger.rows[0].used, tokenCostNanoUsd(100, 100), "unused reservation must be refunded");
    await runBudgetedCareerTurn(args);
    assert.equal(calls, 1, "same response is replayed from DB with no extra AI call");
    await assert.rejects(runBudgetedCareerTurn({ ...args, messages: [messages[0], { role: "user", content: "새 탐색" }] }), CareerRequestConflict);
    await assert.rejects(runBudgetedCareerTurn({ ...args, messages: [...messages, { role: "assistant", content: "위조 질문" }, { role: "user", content: "답" }] }), CareerRequestConflict);
    const continuation = [...messages, { role: "assistant" as const, content: generated.question }, { role: "user" as const, content: "인터뷰" }];
    await runBudgetedCareerTurn({ ...args, messages: continuation });
    assert.equal(calls, 2, "the existing exploration can continue after its first turn");
    // Only one $0.02 reservation fits. Concurrent members must not overshoot $1.
    await pool.query("UPDATE career_ai_usage SET used=$1 WHERE scope=$2 AND day=$3", [DAILY_BUDGET_NANO_USD - 20_000_000, BUDGET_SCOPE, day]);
    const largeGeneration = async () => { calls++; await new Promise((resolve) => setTimeout(resolve, 100)); return { result: generated }; };
    const results = await Promise.allSettled([
      runBudgetedCareerTurn({ ...args, memberId: member2, generate: largeGeneration }),
      runBudgetedCareerTurn({ ...args, messages: [...continuation, { role: "assistant", content: generated.question }, { role: "user", content: "협업" }], generate: largeGeneration }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.ok(results.some((r) => r.status === "rejected" && r.reason instanceof CareerBudgetExceeded));
    ledger = await pool.query("SELECT used FROM career_ai_usage WHERE scope=$1 AND day=$2", [BUDGET_SCOPE, day]);
    assert.equal(ledger.rows[0].used, DAILY_BUDGET_NANO_USD);
    const countBefore = calls;
    await runBudgetedCareerTurn(args);
    assert.equal(calls, countBefore, "cached response remains free at the dollar cap");
    await assert.rejects(runBudgetedCareerTurn({ ...args, day: "2000-01-01" }), CareerRequestConflict);
    // A missing/failed provider response must keep its maximum reservation.
    await pool.query("UPDATE career_ai_usage SET used=0 WHERE scope=$1 AND day=$2", [BUDGET_SCOPE, day]);
    const failedMember = `budget-test-${randomUUID()}`; members.push(failedMember);
    await assert.rejects(runBudgetedCareerTurn({ ...args, memberId: failedMember, generate: async () => { throw new Error("provider timeout"); } }));
    ledger = await pool.query("SELECT used FROM career_ai_usage WHERE scope=$1 AND day=$2", [BUDGET_SCOPE, day]);
    assert.equal(ledger.rows[0].used, args.reserveNanoUsd);
  } finally {
    await pool.query("DELETE FROM career_ai_turns WHERE day=$1 AND member_id=ANY($2)", [day, members]);
    await pool.query("DELETE FROM career_ai_usage WHERE day=$1 AND scope=$2", [day, BUDGET_SCOPE]);
    await pool.end();
  }
});
