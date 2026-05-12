import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, creativeWorksTable, creativeEpisodesTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/creative-works", async (_req, res) => {
  const rows = await db
    .select()
    .from(creativeWorksTable)
    .orderBy(asc(creativeWorksTable.displayOrder), asc(creativeWorksTable.id));
  res.json(rows);
});

router.post("/creative-works", requireAdmin, async (req, res) => {
  const body = req.body as {
    category: string;
    title: string;
    thumbnailUrl?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  };
  if (!body.category || !body.title) {
    res.status(400).json({ error: "category and title required" });
    return;
  }
  const [created] = await db
    .insert(creativeWorksTable)
    .values({
      category: body.category,
      title: body.title,
      thumbnailUrl: body.thumbnailUrl ?? null,
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive ?? true,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/creative-works/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body;
  const [updated] = await db
    .update(creativeWorksTable)
    .set({ ...body, id: undefined, createdAt: undefined })
    .where(eq(creativeWorksTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/creative-works/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(creativeWorksTable).where(eq(creativeWorksTable.id, id));
  res.status(204).send();
});

router.get("/creative-works/:workId/episodes", async (req, res) => {
  const workId = parseInt(req.params.workId, 10);
  if (isNaN(workId)) { res.status(404).json({ error: "Not found" }); return; }
  const rows = await db
    .select()
    .from(creativeEpisodesTable)
    .where(eq(creativeEpisodesTable.workId, workId))
    .orderBy(asc(creativeEpisodesTable.episodeNumber));
  res.json(rows);
});

router.post("/creative-works/:workId/episodes", requireAdmin, async (req, res) => {
  const workId = parseInt(req.params.workId, 10);
  if (isNaN(workId)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as {
    episodeNumber: number;
    title: string;
    content?: string;
    isActive?: boolean;
  };
  if (!body.title) { res.status(400).json({ error: "title required" }); return; }
  const [created] = await db
    .insert(creativeEpisodesTable)
    .values({
      workId,
      episodeNumber: body.episodeNumber ?? 1,
      title: body.title,
      content: body.content ?? "",
      isActive: body.isActive ?? true,
    })
    .returning();
  res.status(201).json(created);
});

router.put("/creative-episodes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body;
  const [updated] = await db
    .update(creativeEpisodesTable)
    .set({ ...body, id: undefined, workId: undefined })
    .where(eq(creativeEpisodesTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/creative-episodes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(creativeEpisodesTable).where(eq(creativeEpisodesTable.id, id));
  res.status(204).send();
});

export default router;
