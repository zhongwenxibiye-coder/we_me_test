import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, jobCategoriesTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/job-categories", async (_req, res) => {
  const rows = await db
    .select()
    .from(jobCategoriesTable)
    .orderBy(asc(jobCategoriesTable.displayOrder), asc(jobCategoriesTable.id));
  res.json(rows);
});

router.post("/job-categories", requireAdmin, async (req, res) => {
  const body = req.body as { name: string; isActive?: boolean; displayOrder?: number };
  if (!body.name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db
    .insert(jobCategoriesTable)
    .values({ name: body.name, isActive: body.isActive ?? true, displayOrder: body.displayOrder ?? 0 })
    .returning();
  res.status(201).json(row);
});

router.put("/job-categories/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as { name?: string; isActive?: boolean; displayOrder?: number };
  const [row] = await db
    .update(jobCategoriesTable)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
    })
    .where(eq(jobCategoriesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/job-categories/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(jobCategoriesTable).where(eq(jobCategoriesTable.id, id));
  res.status(204).end();
});

export default router;
