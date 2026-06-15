import { Router, type IRouter } from "express";
import { eq, asc, desc, sql } from "drizzle-orm";
import {
  db,
  humanitiesQuizzesTable,
  humanitiesQuizAttemptsTable,
  humanitiesArticlesTable,
} from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

// ── Quiz: Today's quiz ──────────────────────────────────────

router.get("/humanities/quiz/today", async (req, res) => {
  const sessionKey = req.query.sessionKey as string | undefined;

  // 활성 퀴즈 전체를 id 순으로 가져와 날짜 기반으로 순환
  const allQuizzes = await db
    .select()
    .from(humanitiesQuizzesTable)
    .where(eq(humanitiesQuizzesTable.isActive, true))
    .orderBy(asc(humanitiesQuizzesTable.id));

  if (allQuizzes.length === 0) {
    res.json({ quiz: null, attempt: null });
    return;
  }

  // 오늘 날짜(YYYY-MM-DD)를 고정 시드로 사용해 하루에 한 문제씩 순환
  const today = new Date().toISOString().slice(0, 10);
  const epoch = new Date("2026-01-01").getTime();
  const dayIndex = Math.floor((new Date(today).getTime() - epoch) / 86400000);
  const quiz = allQuizzes[((dayIndex % allQuizzes.length) + allQuizzes.length) % allQuizzes.length];

  let attempt = null;
  if (sessionKey) {
    const [found] = await db
      .select()
      .from(humanitiesQuizAttemptsTable)
      .where(
        sql`${humanitiesQuizAttemptsTable.quizId} = ${quiz.id} AND ${humanitiesQuizAttemptsTable.sessionKey} = ${sessionKey}`,
      )
      .limit(1);
    attempt = found ?? null;
  }

  const stats = await db
    .select({
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${humanitiesQuizAttemptsTable.isCorrect} then 1 else 0 end)::int`,
    })
    .from(humanitiesQuizAttemptsTable)
    .where(eq(humanitiesQuizAttemptsTable.quizId, quiz.id));

  const s = stats[0];
  const total = s?.total ?? 0;
  const correct = s?.correct ?? 0;
  const quizWithStats = {
    ...quiz,
    participantCount: total,
    correctRate: total > 0 ? Math.round((correct / total) * 100) : 0,
  };

  res.json({ quiz: quizWithStats, attempt });
});

// ── Quiz: Submit attempt ────────────────────────────────────

router.post("/humanities/quiz/attempt", async (req, res) => {
  const body = req.body as { quizId: number; sessionKey: string; isCorrect: boolean };
  if (!body.quizId || !body.sessionKey) {
    res.status(400).json({ error: "quizId and sessionKey required" });
    return;
  }
  const existing = await db
    .select()
    .from(humanitiesQuizAttemptsTable)
    .where(
      sql`${humanitiesQuizAttemptsTable.quizId} = ${body.quizId} AND ${humanitiesQuizAttemptsTable.sessionKey} = ${body.sessionKey}`,
    )
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Already attempted" });
    return;
  }
  const [created] = await db
    .insert(humanitiesQuizAttemptsTable)
    .values({ quizId: body.quizId, sessionKey: body.sessionKey, isCorrect: body.isCorrect })
    .returning();
  res.status(201).json(created);
});

// ── Quiz: Admin CRUD ────────────────────────────────────────

router.get("/humanities/quizzes", requireAdmin, async (_req, res) => {
  const quizzes = await db
    .select()
    .from(humanitiesQuizzesTable)
    .orderBy(desc(humanitiesQuizzesTable.scheduledDate), desc(humanitiesQuizzesTable.createdAt));

  const stats = await db
    .select({
      quizId: humanitiesQuizAttemptsTable.quizId,
      total: sql<number>`count(*)::int`,
      correct: sql<number>`sum(case when ${humanitiesQuizAttemptsTable.isCorrect} then 1 else 0 end)::int`,
    })
    .from(humanitiesQuizAttemptsTable)
    .groupBy(humanitiesQuizAttemptsTable.quizId);

  const statsMap = new Map(stats.map((s) => [s.quizId, s]));

  const result = quizzes.map((q) => {
    const s = statsMap.get(q.id);
    return {
      ...q,
      participantCount: s?.total ?? 0,
      correctCount: s?.correct ?? 0,
      correctRate: s?.total ? Math.round(((s.correct ?? 0) / s.total) * 100) : 0,
    };
  });

  res.json(result);
});

router.post("/humanities/quizzes", requireAdmin, async (req, res) => {
  const body = req.body as {
    question: string;
    answer: boolean;
    explanation: string;
    scheduledDate?: string | null;
    isActive?: boolean;
  };
  if (!body.question) { res.status(400).json({ error: "question required" }); return; }
  const [created] = await db
    .insert(humanitiesQuizzesTable)
    .values({
      question: body.question,
      answer: body.answer,
      explanation: body.explanation ?? "",
      scheduledDate: body.scheduledDate ?? null,
      isActive: body.isActive ?? true,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/humanities/quizzes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body;
  const [updated] = await db
    .update(humanitiesQuizzesTable)
    .set({ ...body, id: undefined, createdAt: undefined })
    .where(eq(humanitiesQuizzesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/humanities/quizzes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(humanitiesQuizzesTable).where(eq(humanitiesQuizzesTable.id, id));
  res.status(204).send();
});

// ── Articles: Public ────────────────────────────────────────

router.get("/humanities/articles", async (_req, res) => {
  const rows = await db
    .select()
    .from(humanitiesArticlesTable)
    .where(eq(humanitiesArticlesTable.isActive, true))
    .orderBy(asc(humanitiesArticlesTable.displayOrder), desc(humanitiesArticlesTable.createdAt));
  res.json(rows);
});

router.get("/humanities/articles/:id", async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const [article] = await db
    .select()
    .from(humanitiesArticlesTable)
    .where(eq(humanitiesArticlesTable.id, id))
    .limit(1);
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  res.json(article);
});

// ── Articles: Admin CRUD ────────────────────────────────────

router.post("/humanities/articles", requireAdmin, async (req, res) => {
  const body = req.body as {
    category: string;
    title: string;
    content?: string;
    authorName?: string;
    imageUrl?: string;
    isActive?: boolean;
    displayOrder?: number;
  };
  if (!body.category || !body.title) {
    res.status(400).json({ error: "category and title required" });
    return;
  }
  const [created] = await db
    .insert(humanitiesArticlesTable)
    .values({
      category: body.category,
      title: body.title,
      content: body.content ?? "",
      authorName: body.authorName ?? "",
      imageUrl: body.imageUrl ?? "",
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/humanities/articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body;
  const [updated] = await db
    .update(humanitiesArticlesTable)
    .set({ ...body, id: undefined, createdAt: undefined })
    .where(eq(humanitiesArticlesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/humanities/articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(humanitiesArticlesTable).where(eq(humanitiesArticlesTable.id, id));
  res.status(204).send();
});

export default router;
