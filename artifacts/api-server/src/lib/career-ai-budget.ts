import { createHash } from "node:crypto";
import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import { db, careerAiUsageTable, careerAiTurnsTable } from "@workspace/db";
import type { InterviewMessage } from "./career-exploration";
import { BUDGET_SCOPE, DAILY_BUDGET_NANO_USD, tokenCostNanoUsd } from "./career-ai-pricing";

export { DAILY_BUDGET_NANO_USD } from "./career-ai-pricing";
export const MEMBER_DAILY_EXPLORATION_LIMIT = 1;
export const FIRST_CAREER_QUESTION = "최근에 재미있었거나 몰입했던 활동이나 경험이 있나요? 수업, 아르바이트, 동아리나 취미 등 편하게 이야기해 주세요.";
export class CareerBudgetExceeded extends Error {}
export class CareerRequestConflict extends Error {}
export function koreaDay(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function transcriptHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
const whereTurn = (memberId: string, day: string, turn: number) => and(
  eq(careerAiTurnsTable.memberId, memberId), eq(careerAiTurnsTable.day, day), eq(careerAiTurnsTable.turn, turn),
);
let lastResponseCleanupDay = "";
async function clearPastResponses(day: string) {
  if (lastResponseCleanupDay === day) return;
  await db.update(careerAiTurnsTable).set({ response: null, nextPrefixHash: null })
    .where(and(lt(careerAiTurnsTable.day, day), isNotNull(careerAiTurnsTable.response)));
  lastResponseCleanupDay = day;
}

export async function getMemberUsage(memberId: string) {
  const day = koreaDay();
  await clearPastResponses(day);
  const [first] = await db.select({ status: careerAiTurnsTable.status }).from(careerAiTurnsTable)
    .where(whereTurn(memberId, day, 1));
  const [last] = await db.select({ status: careerAiTurnsTable.status }).from(careerAiTurnsTable)
    .where(whereTurn(memberId, day, 5));
  const [budget] = await db.select({ used: careerAiUsageTable.used }).from(careerAiUsageTable)
    .where(and(eq(careerAiUsageTable.scope, BUDGET_SCOPE), eq(careerAiUsageTable.day, day)));
  return {
    dailyLimit: 1, used: first ? 1 : 0, resetDay: day,
    inProgress: !!first && last?.status !== "complete",
    serviceBudgetUsd: 1,
    serviceBudgetExhausted: (budget?.used ?? 0) >= DAILY_BUDGET_NANO_USD,
  };
}

interface AiTurnResult {
  question: string;
  summary: string;
  recommendations: { jobId: number; reason: string; nextStep: string }[];
}
interface AiUsage { prompt_tokens: number; completion_tokens: number }

// Claim a turn and its maximum possible dollar cost atomically BEFORE contacting AI.
// One answer path per day prevents reset, forged transcripts and new tabs creating
// extra explorations. Responses make lost-network retries free even after restart.
export async function runBudgetedCareerTurn(args: {
  memberId: string; day: string; messages: InterviewMessage[]; reserveNanoUsd: number;
  generate: () => Promise<{ result: AiTurnResult; usage?: AiUsage | null }>;
  now?: number;
}): Promise<AiTurnResult> {
  const { memberId, day, messages, reserveNanoUsd, generate } = args;
  const now = args.now ?? Date.now();
  if (day !== koreaDay(now)) throw new CareerRequestConflict("이 탐색은 이전 날짜에 시작됐어요. 처음부터 새로 시작해 주세요.");
  const turn = messages.length / 2;
  if (!Number.isInteger(turn) || turn < 1 || turn > 5) throw new CareerRequestConflict("대화 순서가 올바르지 않습니다.");
  if (!Number.isSafeInteger(reserveNanoUsd) || reserveNanoUsd <= 0 || reserveNanoUsd > DAILY_BUDGET_NANO_USD) {
    throw new CareerBudgetExceeded("남은 일일 AI 예산으로 이 요청을 처리할 수 없어요. 내일 다시 이용해 주세요.");
  }
  const requestHash = transcriptHash(messages);
  const claim = await db.transaction(async (tx) => {
    // Serialize this member/day before inspecting turns, including across processes.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${memberId}:${day}`}, 0))`);
    const [existing] = await tx.select().from(careerAiTurnsTable).where(whereTurn(memberId, day, turn));
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new CareerRequestConflict("회원당 하루 한 번만 탐색할 수 있어요. 진행 중인 탐색의 기존 답변으로 이어가 주세요.");
      }
      if (existing.status === "complete" && existing.response) return { cached: existing.response as AiTurnResult };
      if (existing.status === "pending" && now - existing.updatedAt.getTime() < 120_000) {
        throw new CareerRequestConflict("같은 답변을 처리 중이에요. 잠시 후 다시 시도해 주세요.");
      }
      if (existing.attempts >= 3) throw new CareerRequestConflict("같은 단계의 재시도 한도에 도달했어요. 내일 다시 이용해 주세요.");
    }
    const prefix = messages.slice(0, -1);
    if (turn === 1) {
      if (transcriptHash(prefix) !== transcriptHash([{ role: "assistant", content: FIRST_CAREER_QUESTION }])) {
        throw new CareerRequestConflict("오늘의 첫 질문부터 다시 시작해 주세요.");
      }
    } else {
      const [previous] = await tx.select().from(careerAiTurnsTable).where(whereTurn(memberId, day, turn - 1));
      if (previous?.status !== "complete" || previous.nextPrefixHash !== transcriptHash(prefix)) {
        throw new CareerRequestConflict("진행 중인 탐색의 질문과 답변을 순서대로 이어가 주세요.");
      }
    }
    const budget = await tx.insert(careerAiUsageTable)
      .values({ scope: BUDGET_SCOPE, day, used: reserveNanoUsd })
      .onConflictDoUpdate({
        target: [careerAiUsageTable.scope, careerAiUsageTable.day],
        set: { used: sql`${careerAiUsageTable.used} + ${reserveNanoUsd}` },
        setWhere: sql`${careerAiUsageTable.used} + ${reserveNanoUsd} <= ${DAILY_BUDGET_NANO_USD}`,
      }).returning({ used: careerAiUsageTable.used });
    if (!budget.length) throw new CareerBudgetExceeded("오늘의 서비스 전체 AI 예산 $1이 소진됐거나 남은 예산이 부족해요. 한국 시간 자정 이후 다시 이용해 주세요.");
    if (existing) {
      await tx.update(careerAiTurnsTable).set({ status: "pending", attempts: existing.attempts + 1, updatedAt: new Date(now) })
        .where(whereTurn(memberId, day, turn));
    } else {
      await tx.insert(careerAiTurnsTable).values({ memberId, day, turn, requestHash, status: "pending", updatedAt: new Date(now) });
    }
    return { cached: null };
  });
  if (claim.cached) return claim.cached;

  try {
    const { result, usage } = await generate();
    let actual = reserveNanoUsd;
    if (usage) {
      const calculated = tokenCostNanoUsd(usage.prompt_tokens, usage.completion_tokens);
      // Never refund on inconsistent or unexpectedly large provider usage.
      if (calculated <= reserveNanoUsd) actual = calculated;
    }
    await db.transaction(async (tx) => {
      await tx.update(careerAiTurnsTable).set({
        status: "complete", response: result, updatedAt: new Date(),
        nextPrefixHash: transcriptHash([...messages, { role: "assistant", content: result.question }]),
      }).where(whereTurn(memberId, day, turn));
      if (actual < reserveNanoUsd) {
        await tx.update(careerAiUsageTable).set({ used: sql`${careerAiUsageTable.used} - ${reserveNanoUsd - actual}` })
          .where(and(eq(careerAiUsageTable.scope, BUDGET_SCOPE), eq(careerAiUsageTable.day, day)));
      }
    });
    return result;
  } catch (error) {
    // Timeouts/errors may still be billed. Keep the full reservation, not a refund.
    await db.update(careerAiTurnsTable).set({ status: "failed", updatedAt: new Date() })
      .where(whereTurn(memberId, day, turn));
    throw error;
  }
}
