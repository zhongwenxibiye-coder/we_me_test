import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, careerAiUsageTable } from "@workspace/db";

export const MEMBER_DAILY_AI_LIMIT = 15;
export const SERVICE_DAILY_AI_LIMIT = 300;
export const FIRST_CAREER_QUESTION = "최근에 재미있었거나 몰입했던 활동이나 경험이 있나요? 수업, 아르바이트, 동아리나 취미 등 편하게 이야기해 주세요.";

export class CareerBudgetExceeded extends Error {}

export function koreaDay(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function getMemberUsage(memberId: string) {
  const day = koreaDay();
  const [row] = await db.select().from(careerAiUsageTable)
    .where(and(eq(careerAiUsageTable.scope, `member:${memberId}`), eq(careerAiUsageTable.day, day)));
  return { dailyLimit: MEMBER_DAILY_AI_LIMIT, used: row?.used ?? 0, resetDay: day };
}

// Both limits are reserved in one transaction, so concurrent tabs/servers cannot exceed them.
// Count attempts, even provider failures: an interrupted request may still incur charges.
export async function reserveCareerAiCall(memberId: string, now = Date.now()) {
  const day = koreaDay(now);
  await db.transaction(async (tx) => {
    for (const [scope, maximum] of [
      ["service", SERVICE_DAILY_AI_LIMIT],
      [`member:${memberId}`, MEMBER_DAILY_AI_LIMIT],
    ] as const) {
      const rows = await tx.insert(careerAiUsageTable).values({ scope, day, used: 1 })
        .onConflictDoUpdate({
          target: [careerAiUsageTable.scope, careerAiUsageTable.day],
          set: { used: sql`${careerAiUsageTable.used} + 1` },
          setWhere: sql`${careerAiUsageTable.used} < ${maximum}`,
        }).returning({ used: careerAiUsageTable.used });
      if (!rows.length) throw new CareerBudgetExceeded(scope === "service"
        ? "오늘의 전체 AI 이용 한도에 도달했어요. 한국 시간 자정 이후 다시 이용해 주세요."
        : "오늘의 AI 요청 15회를 모두 사용했어요. 한국 시간 자정 이후 다시 이용해 주세요.");
    }
  });
}

type CacheEntry<T> = { expires: number; promise: Promise<T> };
const recentResponses = new Map<string, CacheEntry<unknown>>();

// Short-lived, member-isolated response reuse; never shares one member's answer with another.
export async function reuseCareerResponse<T>(memberId: string, payload: unknown, generate: () => Promise<T>): Promise<T> {
  const now = Date.now();
  for (const [key, entry] of recentResponses) if (entry.expires < now) recentResponses.delete(key);
  const key = createHash("sha256").update(`${memberId}:${koreaDay()}:${JSON.stringify(payload)}`).digest("hex");
  const cached = recentResponses.get(key);
  if (cached) return cached.promise as Promise<T>;
  if (recentResponses.size >= 300) recentResponses.delete(recentResponses.keys().next().value!);
  const promise = Promise.resolve().then(generate);
  recentResponses.set(key, { expires: now + 10 * 60 * 1000, promise });
  try {
    return await promise;
  } catch (error) {
    recentResponses.delete(key);
    throw error;
  }
}
