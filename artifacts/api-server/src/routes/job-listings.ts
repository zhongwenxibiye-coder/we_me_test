import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, jobListingsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/job-listings", async (_req, res) => {
  const rows = await db
    .select()
    .from(jobListingsTable)
    .orderBy(asc(jobListingsTable.displayOrder), asc(jobListingsTable.id));
  res.json(rows);
});

router.post("/job-listings", requireAdmin, async (req, res) => {
  const body = req.body as {
    category: string;
    title: string;
    shortDescription?: string;
    imageUrl?: string | null;
    isActive?: boolean;
    displayOrder?: number;
    learning?: { title: string; content: string }[];
  };
  if (!body.category || !body.title) {
    res.status(400).json({ error: "category and title required" });
    return;
  }
  const [created] = await db
    .insert(jobListingsTable)
    .values({
      category: body.category,
      title: body.title,
      shortDescription: body.shortDescription ?? "",
      imageUrl: body.imageUrl ?? null,
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
      learning: body.learning ?? [],
    })
    .returning();
  res.status(201).json(created);
});

router.put("/job-listings/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body;
  const [updated] = await db
    .update(jobListingsTable)
    .set({ ...body, id: undefined, createdAt: undefined })
    .where(eq(jobListingsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Job listing not found" }); return; }
  res.json(updated);
});

router.delete("/job-listings/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const [deleted] = await db
    .delete(jobListingsTable)
    .where(eq(jobListingsTable.id, id))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Job listing not found" }); return; }
  res.status(204).send();
});

export default router;
