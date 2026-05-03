import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, mentorsTable, mentorArticlesTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/mentors", async (_req, res) => {
  const rows = await db
    .select()
    .from(mentorsTable)
    .where(eq(mentorsTable.isActive, true))
    .orderBy(asc(mentorsTable.displayOrder), asc(mentorsTable.id));
  res.json(rows);
});

router.get("/mentors/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [mentor] = await db
    .select()
    .from(mentorsTable)
    .where(eq(mentorsTable.id, id));
  if (!mentor) {
    res.status(404).json({ error: "Mentor not found" });
    return;
  }
  const articles = await db
    .select()
    .from(mentorArticlesTable)
    .where(eq(mentorArticlesTable.mentorId, id))
    .orderBy(asc(mentorArticlesTable.displayOrder), asc(mentorArticlesTable.id));
  res.json({ ...mentor, articles });
});

router.post("/mentors", requireAdmin, async (req, res) => {
  const body = req.body as {
    name: string;
    major: string;
    yearsOfExperience: number;
    photoUrl?: string | null;
    headlineText?: string;
    sublineText?: string;
    bio?: string;
    avatarColor?: string;
    initial: string;
    isActive?: boolean;
    displayOrder?: number;
  };
  if (!body.name || !body.major || !body.initial || body.yearsOfExperience == null) {
    res.status(400).json({ error: "name, major, initial, yearsOfExperience required" });
    return;
  }
  const [created] = await db
    .insert(mentorsTable)
    .values({
      name: body.name,
      major: body.major,
      yearsOfExperience: Number(body.yearsOfExperience),
      photoUrl: body.photoUrl ?? null,
      headlineText: body.headlineText ?? "",
      sublineText: body.sublineText ?? "",
      bio: body.bio ?? "",
      avatarColor: body.avatarColor ?? "bg-amber-200",
      initial: body.initial,
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/mentors/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as Partial<typeof mentorsTable.$inferInsert>;
  const [updated] = await db
    .update(mentorsTable)
    .set({ ...body, id: undefined })
    .where(eq(mentorsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Mentor not found" }); return; }
  res.json(updated);
});

router.delete("/mentors/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const [deleted] = await db
    .delete(mentorsTable)
    .where(eq(mentorsTable.id, id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Mentor not found" }); return; }
  res.status(204).send();
});

// ── Articles ──────────────────────────────────────────────

router.get("/mentors/:mentorId/articles", async (req, res) => {
  const mentorId = parseInt(req.params.mentorId, 10);
  if (isNaN(mentorId)) { res.status(404).json({ error: "Not found" }); return; }
  const rows = await db
    .select()
    .from(mentorArticlesTable)
    .where(eq(mentorArticlesTable.mentorId, mentorId))
    .orderBy(asc(mentorArticlesTable.displayOrder), asc(mentorArticlesTable.id));
  res.json(rows);
});

router.post("/mentors/:mentorId/articles", requireAdmin, async (req, res) => {
  const mentorId = parseInt(req.params.mentorId, 10);
  if (isNaN(mentorId)) { res.status(400).json({ error: "Invalid mentorId" }); return; }
  const body = req.body as { title: string; content?: string; displayOrder?: number; isActive?: boolean };
  if (!body.title) { res.status(400).json({ error: "title required" }); return; }
  const [created] = await db
    .insert(mentorArticlesTable)
    .values({
      mentorId,
      title: body.title,
      content: body.content ?? "",
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive ?? true,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/mentor-articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as { title?: string; content?: string; displayOrder?: number; isActive?: boolean };
  const [updated] = await db
    .update(mentorArticlesTable)
    .set({ ...body })
    .where(eq(mentorArticlesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Article not found" }); return; }
  res.json(updated);
});

router.delete("/mentor-articles/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const [deleted] = await db
    .delete(mentorArticlesTable)
    .where(eq(mentorArticlesTable.id, id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Article not found" }); return; }
  res.status(204).send();
});

export default router;
