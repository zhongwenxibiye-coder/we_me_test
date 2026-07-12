import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, careerVideosTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/career-videos", async (_req, res) => {
  const rows = await db
    .select()
    .from(careerVideosTable)
    .where(eq(careerVideosTable.isActive, true))
    .orderBy(asc(careerVideosTable.displayOrder), asc(careerVideosTable.id));
  res.json(rows);
});

router.get("/career-videos/all", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(careerVideosTable)
    .orderBy(asc(careerVideosTable.displayOrder), asc(careerVideosTable.id));
  res.json(rows);
});

router.post("/career-videos", requireAdmin, async (req, res) => {
  const body = req.body as {
    title: string;
    description?: string;
    youtubeUrl: string;
    displayOrder?: number;
    isActive?: boolean;
  };
  if (!body.title || !body.youtubeUrl) {
    res.status(400).json({ error: "title and youtubeUrl required" });
    return;
  }
  const [row] = await db
    .insert(careerVideosTable)
    .values({
      title: body.title,
      description: body.description ?? "",
      youtubeUrl: body.youtubeUrl,
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive ?? true,
    })
    .returning();
  res.status(201).json(row);
});

router.put("/career-videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as {
    title?: string;
    description?: string;
    youtubeUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
  };
  const [row] = await db
    .update(careerVideosTable)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.youtubeUrl !== undefined && { youtubeUrl: body.youtubeUrl }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    })
    .where(eq(careerVideosTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/career-videos/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(careerVideosTable).where(eq(careerVideosTable.id, id));
  res.status(204).end();
});

export default router;
