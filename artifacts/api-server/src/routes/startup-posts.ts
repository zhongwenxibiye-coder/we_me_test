import { Router, type IRouter } from "express";
import { eq, asc, and, or, gte } from "drizzle-orm";
import { db, startupPostsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.get("/startup-posts", async (req, res) => {
  const includeClosed = req.query.includeClosed === "true";
  const todayInKorea = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(startupPostsTable)
    .where(includeClosed ? undefined : and(
      eq(startupPostsTable.isActive, true),
      or(eq(startupPostsTable.endDate, ""), gte(startupPostsTable.endDate, todayInKorea)),
    ))
    .orderBy(asc(startupPostsTable.displayOrder), asc(startupPostsTable.id));
  res.json(rows);
});

router.get("/startup-posts/all", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(startupPostsTable)
    .orderBy(asc(startupPostsTable.displayOrder), asc(startupPostsTable.id));
  res.json(rows);
});

router.post("/startup-posts", requireAdmin, async (req, res) => {
  const body = req.body as {
    title: string;
    content?: string;
    organizationName?: string;
    applicationUrl?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    displayOrder?: number;
  };
  if (!body.title) {
    res.status(400).json({ error: "title required" });
    return;
  }
  const [row] = await db
    .insert(startupPostsTable)
    .values({
      title: body.title,
      content: body.content ?? "",
      organizationName: body.organizationName ?? "",
      applicationUrl: body.applicationUrl ?? "",
      startDate: body.startDate ?? "",
      endDate: body.endDate ?? "",
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
    })
    .returning();
  res.status(201).json(row);
});

router.put("/startup-posts/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as {
    title?: string;
    content?: string;
    organizationName?: string;
    applicationUrl?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    displayOrder?: number;
  };
  const [row] = await db
    .update(startupPostsTable)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.organizationName !== undefined && { organizationName: body.organizationName }),
      ...(body.applicationUrl !== undefined && { applicationUrl: body.applicationUrl }),
      ...(body.startDate !== undefined && { startDate: body.startDate }),
      ...(body.endDate !== undefined && { endDate: body.endDate }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
    })
    .where(eq(startupPostsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/startup-posts/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(startupPostsTable).where(eq(startupPostsTable.id, id));
  res.status(204).end();
});

export default router;
